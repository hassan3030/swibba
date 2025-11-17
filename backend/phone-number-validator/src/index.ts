import { defineEndpoint } from '@directus/extensions-sdk';
import { 
  RequestVerificationBody, 
  VerifyOTPBody, 
  ResendOTPBody,
  ApiResponse,
  VerificationRequestResponse,
  VerificationSuccessResponse,
  VerificationStatusResponse
} from './types.js';
import { DirectusRequest } from './types/request.js';
import { OTPServiceImpl } from './services/otp.service.js';
import { PhoneValidationServiceImpl } from './services/phone-validation.service.js';
import { VonageSMSProvider, BeonSMSProvider } from './services/sms.service.js';
import { RateLimitServiceImpl } from './services/rate-limit.service.js';
import { createError, handleError } from './utils/errors.js';
import { 
  getCurrentUser, 
  isPhoneNumberTaken, 
  updateUserVerification, 
  verifyUserPhone, 
  incrementAttempts,
  clearExpiredOTPs 
} from './utils/user.utils.js';
import { 
  validateRequestBody, 
  sanitizePhoneNumber, 
  isOTPExpired 
} from './utils/validation.utils.js';

export default defineEndpoint({
  id: 'phone-number-validator',
  handler: (router, { env, database: knex, logger }) => {
    // Initialize services
    const otpService = new OTPServiceImpl(env['SECRET'] || 'default-secret');
    const phoneValidationService = new PhoneValidationServiceImpl();
    const rateLimitService = new RateLimitServiceImpl(knex);

    // Initialize SMS providers
    const vonageProvider = new VonageSMSProvider(
      env['VONAGE_API_KEY'],
      env['VONAGE_API_SECRET'],
      env['SENDER_NAME'] || 'Swibba'
    );

    const beonProvider = new BeonSMSProvider(
      env['BEON_TOKEN'],
      env['SENDER_NAME'] || 'Swibba'
    );

    // Configuration
    const OTP_EXPIRY_MINUTES = 10;
    const MAX_ATTEMPTS = 5;

    // Clean expired OTPs periodically
    setInterval(() => {
      clearExpiredOTPs(knex).catch(err => logger.error('Failed to clear expired OTPs:', err));
    }, 5 * 60 * 1000); // Every 5 minutes

    // Request phone verification
    router.post('/request-verification', async (req: DirectusRequest, res) => {
      try {
        const body = validateRequestBody<RequestVerificationBody>(req.body, ['phone_number', 'country_code']);
        const user = await getCurrentUser(knex, req.accountability);

        // Sanitize and validate phone number
        const phoneNumber = sanitizePhoneNumber(body.phone_number);
        const validationResult = phoneValidationService.validatePhone(phoneNumber, body.country_code);

        // Check if phone number is already taken by another user
        if (await isPhoneNumberTaken(knex, validationResult.formattedNumber, user.id)) {
          throw createError('PHONE_IN_USE');
        }

        // Check rate limiting
        await rateLimitService.checkRateLimit(user.id, validationResult.formattedNumber);

        // Generate OTP and hash it
        const otp = otpService.generateOTP();
        const otpHash = otpService.hashOTP(otp);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        // Store verification data in user record
        await updateUserVerification(knex, user.id, validationResult.formattedNumber, otpHash, expiresAt);

        // Send SMS
        const provider = phoneValidationService.selectSMSProvider(validationResult.formattedNumber);
        const smsProvider = provider === 'vonage' ? vonageProvider : beonProvider;
        
        await smsProvider.sendOTP(validationResult.formattedNumber, otp, OTP_EXPIRY_MINUTES);

        logger.info(`OTP sent to ${validationResult.formattedNumber} for user ${user.id}`);

        const response: ApiResponse<VerificationRequestResponse> = {
          success: true,
          message: 'OTP sent successfully',
          data: {
            expires_in: OTP_EXPIRY_MINUTES * 60,
            can_resend_after: 60
          }
        };

        res.json(response);
      } catch (error) {
        const errorInfo = handleError(error);
        logger.error('Request verification error:', error);
        
        const response: ApiResponse = {
          success: false,
          message: errorInfo.message
        };

        res.status(errorInfo.statusCode).json(response);
      }
    });

    // Verify OTP
    router.post('/verify-otp', async (req: DirectusRequest, res) => {
      try {
        const body = validateRequestBody<VerifyOTPBody>(req.body, ['phone_number', 'otp']);
        const user = await getCurrentUser(knex, req.accountability);

        const phoneNumber = sanitizePhoneNumber(body.phone_number);

        // Check if user has pending verification for this phone number
        if (!user.otp_hash || !user.expires_at || user.phone_number !== phoneNumber) {
          throw createError('NO_PENDING_VERIFICATION');
        }

        // Check if OTP is expired
        if (isOTPExpired(user.expires_at)) {
          throw createError('OTP_EXPIRED');
        }

        // Check max attempts
        if ((user.attempts || 0) >= MAX_ATTEMPTS) {
          throw createError('MAX_ATTEMPTS');
        }

        // Validate OTP
        const isValidOTP = otpService.validateOTP(body.otp, user.otp_hash);
        
        if (!isValidOTP) {
          // Increment attempts
          await incrementAttempts(knex, user.id);
          throw createError('OTP_INVALID');
        }

        // Mark phone as verified
        await verifyUserPhone(knex, user.id, phoneNumber);

        logger.info(`Phone ${phoneNumber} verified successfully for user ${user.id}`);

        const response: ApiResponse<VerificationSuccessResponse> = {
          success: true,
          message: 'Phone number verified successfully',
          data: {
            verified_phone: phoneNumber
          }
        };

        res.json(response);
      } catch (error) {
        const errorInfo = handleError(error);
        logger.error('Verify OTP error:', error);
        
        const response: ApiResponse = {
          success: false,
          message: errorInfo.message
        };

        res.status(errorInfo.statusCode).json(response);
      }
    });

    // Resend OTP
    router.post('/resend-otp', async (req: DirectusRequest, res) => {
      try {
        const body = validateRequestBody<ResendOTPBody>(req.body, ['phone_number']);
        const user = await getCurrentUser(knex, req.accountability);

        const phoneNumber = sanitizePhoneNumber(body.phone_number);

        // Check if user has pending verification for this phone number
        if (!user.otp_hash || !user.expires_at || user.phone_number !== phoneNumber) {
          throw createError('NO_PENDING_VERIFICATION');
        }

        // Check if can resend (rate limiting)
        if (!(await rateLimitService.canResend(user.id, phoneNumber))) {
          throw createError('RATE_LIMITED', 'Please wait before requesting another OTP');
        }

        // Generate new OTP
        const otp = otpService.generateOTP();
        const otpHash = otpService.hashOTP(otp);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        // Update verification data
        await updateUserVerification(knex, user.id, phoneNumber, otpHash, expiresAt);

        // Send SMS
        const provider = phoneValidationService.selectSMSProvider(phoneNumber);
        const smsProvider = provider === 'vonage' ? vonageProvider : beonProvider;
        
        await smsProvider.sendOTP(phoneNumber, otp, OTP_EXPIRY_MINUTES);

        logger.info(`OTP resent to ${phoneNumber} for user ${user.id}`);

        const response: ApiResponse<VerificationRequestResponse> = {
          success: true,
          message: 'OTP resent successfully',
          data: {
            expires_in: OTP_EXPIRY_MINUTES * 60,
            can_resend_after: 60
          }
        };

        res.json(response);
      } catch (error) {
        const errorInfo = handleError(error);
        logger.error('Resend OTP error:', error);
        
        const response: ApiResponse = {
          success: false,
          message: errorInfo.message
        };

        res.status(errorInfo.statusCode).json(response);
      }
    });

    // Get verification status
    router.get('/status', async (req: DirectusRequest, res) => {
      try {
        const user = await getCurrentUser(knex, req.accountability);
        const phoneNumber = req.query.phone_number as string;

        if (!phoneNumber) {
          throw createError('INVALID_PHONE', 'Phone number is required');
        }

        const sanitizedPhone = sanitizePhoneNumber(phoneNumber);

        let response: ApiResponse<VerificationStatusResponse>;

        if (user.phone_number === sanitizedPhone && user.otp_hash && user.expires_at) {
          const isExpired = isOTPExpired(user.expires_at);
          const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - (user.attempts || 0));
          const canResend = await rateLimitService.canResend(user.id, sanitizedPhone);

          response = {
            success: true,
            message: 'Verification status retrieved',
            data: {
              verification_pending: !isExpired,
              expires_at: isExpired ? null : user.expires_at.toISOString(),
              attempts_remaining: attemptsRemaining,
              can_resend: canResend && !isExpired
            }
          };
        } else {
          response = {
            success: true,
            message: 'No pending verification',
            data: {
              verification_pending: false,
              expires_at: null,
              attempts_remaining: MAX_ATTEMPTS,
              can_resend: true
            }
          };
        }

        res.json(response);
      } catch (error) {
        const errorInfo = handleError(error);
        logger.error('Status check error:', error);
        
        const response: ApiResponse = {
          success: false,
          message: errorInfo.message
        };

        res.status(errorInfo.statusCode).json(response);
      }
    });

    // Health check endpoint
    router.get('/', (_req, res) => {
      res.json({
        success: true,
        message: 'Phone Number Validator Extension is running',
        endpoints: [
          'POST /request-verification',
          'POST /verify-otp',
          'POST /resend-otp',
          'GET /status'
        ]
      });
    });

    logger.info('Phone Number Validator Extension initialized successfully');
  },
});
