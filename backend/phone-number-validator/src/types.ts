export interface RequestVerificationBody {
  phone_number: string;
  country_code: string;
}

export interface VerifyOTPBody {
  phone_number: string;
  otp: string;
}

export interface ResendOTPBody {
  phone_number: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface VerificationRequestResponse {
  expires_in: number;
  can_resend_after: number;
}

export interface VerificationSuccessResponse {
  verified_phone: string;
}

export interface VerificationStatusResponse {
  verification_pending: boolean;
  expires_at: string | null;
  attempts_remaining: number;
  can_resend: boolean;
}

export interface DirectusUser {
  id: string;
  phone_number?: string;
  country_code?: string;
  otp_hash?: string;
  expires_at?: Date;
  attempts?: number;
  verified_phone?: boolean;
  created_at?: Date;
}

export interface ValidationResult {
  isValid: boolean;
  formattedNumber: string;
  countryIso2: string;
}

export interface SMSProvider {
  sendOTP(phoneNumber: string, otp: string, expiryMinutes: number): Promise<void>;
}

export interface OTPService {
  generateOTP(): string;
  hashOTP(otp: string): string;
  validateOTP(otp: string, hash: string): boolean;
}

export interface PhoneValidationService {
  validatePhone(phoneNumber: string, countryCode?: string): ValidationResult;
  selectSMSProvider(phoneNumber: string): 'vonage' | 'beon';
}

export interface RateLimitService {
  checkRateLimit(userId: string, phoneNumber: string): Promise<void>;
  canResend(userId: string, phoneNumber: string): Promise<boolean>;
}

export interface VerificationError extends Error {
  code: string;
  statusCode: number;
}

export const ERROR_CODES = {
  INVALID_PHONE: { code: 'INVALID_PHONE', message: 'Invalid phone number format', status: 400 },
  RATE_LIMITED: { code: 'RATE_LIMITED', message: 'Too many requests. Try again later.', status: 429 },
  OTP_EXPIRED: { code: 'OTP_EXPIRED', message: 'OTP has expired', status: 400 },
  OTP_INVALID: { code: 'OTP_INVALID', message: 'Invalid OTP', status: 400 },
  PHONE_IN_USE: { code: 'PHONE_IN_USE', message: 'Phone number already verified by another user', status: 409 },
  USER_NOT_FOUND: { code: 'USER_NOT_FOUND', message: 'User not found', status: 404 },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Authentication required', status: 401 },
  SMS_FAILED: { code: 'SMS_FAILED', message: 'Failed to send SMS', status: 500 },
  MAX_ATTEMPTS: { code: 'MAX_ATTEMPTS', message: 'Maximum verification attempts exceeded', status: 400 },
  NO_PENDING_VERIFICATION: { code: 'NO_PENDING_VERIFICATION', message: 'No pending verification found', status: 404 },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;