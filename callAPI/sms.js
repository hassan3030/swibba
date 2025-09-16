import twilio from 'twilio'
import { getCookie, decodedToken } from './utiles.js'

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map()

// Generate a 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send SMS verification code
export const sendVerificationSMS = async (phoneNumber, userId = null) => {
  try {
    // Validate phone number format
    if (!phoneNumber || !phoneNumber.startsWith('+')) {
      throw new Error('Invalid phone number format. Must include country code.')
    }

    // Check rate limiting (max 3 attempts per phone number per hour)
    const rateLimitKey = `rate_${phoneNumber}`
    const now = Date.now()
    const oneHour = 60 * 60 * 1000

    if (verificationCodes.has(rateLimitKey)) {
      const { attempts, lastAttempt } = verificationCodes.get(rateLimitKey)
      if (attempts >= 3 && (now - lastAttempt) < oneHour) {
        throw new Error('Too many verification attempts. Please try again later.')
      }
    }

    // Generate verification code
    const code = generateVerificationCode()
    const expiryTime = now + (5 * 60 * 1000) // 5 minutes from now

    // Store verification code with expiry
    const verificationKey = `verify_${phoneNumber}`
    verificationCodes.set(verificationKey, {
      code,
      expiry: expiryTime,
      userId,
      attempts: 0
    })

    // Update rate limiting
    const currentRateLimit = verificationCodes.get(rateLimitKey) || { attempts: 0, lastAttempt: 0 }
    verificationCodes.set(rateLimitKey, {
      attempts: currentRateLimit.attempts + 1,
      lastAttempt: now
    })

    // Send SMS via Twilio
    const message = await client.messages.create({
      body: `Your Swibba verification code is: ${code}. This code expires in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    })

    console.log(`SMS sent to ${phoneNumber}, SID: ${message.sid}`)

    return {
      success: true,
      messageId: message.sid,
      expiresIn: 300, // 5 minutes in seconds
      message: 'Verification code sent successfully'
    }

  } catch (error) {
    console.error('SMS sending error:', error)
    
    // Handle specific Twilio errors
    if (error.code === 21211) {
      throw new Error('Invalid phone number format')
    } else if (error.code === 21614) {
      throw new Error('Phone number is not a valid mobile number')
    } else if (error.code === 21408) {
      throw new Error('Permission to send SMS to this number denied')
    }

    throw new Error(error.message || 'Failed to send verification code')
  }
}

// Verify SMS code
export const verifySMSCode = async (phoneNumber, code, userId = null) => {
  try {
    const verificationKey = `verify_${phoneNumber}`
    const storedData = verificationCodes.get(verificationKey)

    if (!storedData) {
      throw new Error('No verification code found for this phone number')
    }

    // Check if code has expired
    if (Date.now() > storedData.expiry) {
      verificationCodes.delete(verificationKey)
      throw new Error('Verification code has expired')
    }

    // Check attempt limit (max 5 attempts per code)
    if (storedData.attempts >= 5) {
      verificationCodes.delete(verificationKey)
      throw new Error('Too many verification attempts. Please request a new code.')
    }

    // Increment attempt counter
    storedData.attempts += 1
    verificationCodes.set(verificationKey, storedData)

    // Verify the code
    if (storedData.code !== code) {
      throw new Error('Invalid verification code')
    }

    // Code is valid, clean up
    verificationCodes.delete(verificationKey)
    
    // Clean up rate limiting for this phone number
    const rateLimitKey = `rate_${phoneNumber}`
    verificationCodes.delete(rateLimitKey)

    return {
      success: true,
      message: 'Phone number verified successfully',
      userId: storedData.userId || userId
    }

  } catch (error) {
    console.error('SMS verification error:', error)
    throw error
  }
}

// Resend verification code
export const resendVerificationSMS = async (phoneNumber, userId = null) => {
  try {
    // Check if there's already a pending verification
    const verificationKey = `verify_${phoneNumber}`
    const existingData = verificationCodes.get(verificationKey)
    
    if (existingData && Date.now() < existingData.expiry) {
      // Check if enough time has passed since last send (minimum 60 seconds)
      const timeSinceLastSend = Date.now() - (existingData.expiry - (5 * 60 * 1000))
      if (timeSinceLastSend < 60000) {
        throw new Error('Please wait before requesting a new code')
      }
    }

    // Send new verification code
    return await sendVerificationSMS(phoneNumber, userId)

  } catch (error) {
    console.error('Resend SMS error:', error)
    throw error
  }
}

// Clean up expired codes (call this periodically)
export const cleanupExpiredCodes = () => {
  const now = Date.now()
  for (const [key, value] of verificationCodes.entries()) {
    if (key.startsWith('verify_') && now > value.expiry) {
      verificationCodes.delete(key)
    }
  }
}

// Get verification status
export const getVerificationStatus = (phoneNumber) => {
  const verificationKey = `verify_${phoneNumber}`
  const storedData = verificationCodes.get(verificationKey)
  
  if (!storedData) {
    return { status: 'none', message: 'No verification in progress' }
  }

  if (Date.now() > storedData.expiry) {
    verificationCodes.delete(verificationKey)
    return { status: 'expired', message: 'Verification code has expired' }
  }

  const timeRemaining = Math.max(0, Math.floor((storedData.expiry - Date.now()) / 1000))
  return { 
    status: 'pending', 
    message: 'Verification in progress',
    timeRemaining,
    attempts: storedData.attempts
  }
}
