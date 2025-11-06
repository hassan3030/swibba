

import { getCookie } from "@/callAPI/utiles"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "https://dev-dashboard.swibba.com/"
const EXTENSION_PATH = "phone-number-validator"

/**
 * Get authentication headers
 */
const getAuthHeaders = async () => {
  const token = await getCookie()
  
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` })
  }
}


export const requestVerification = async (phoneNumber, countryCode) => {
  try {
    const headers = await getAuthHeaders()
    
    const fullPhoneNumber = phoneNumber.startsWith(countryCode) 
      ? phoneNumber 
      : `${countryCode}${phoneNumber}`
    
   
    console.log("Request verification:", { fullPhoneNumber, countryCode })
    
    const response = await fetch(`${BASE_URL}${EXTENSION_PATH}/request-verification`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        phone_number: fullPhoneNumber,
        country_code: countryCode
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to request verification")
    }

    return result
  } catch (error) {
    console.error("Request verification error:", error)
    return {
      success: false,
      message: error.message || "Failed to send verification code"
    }
  }
}


export const verifyOtp = async (phoneNumber, otp) => {
  try {
    const headers = await getAuthHeaders()
    
    console.log("Verify OTP:", { phoneNumber, otp })
    
    const response = await fetch(`${BASE_URL}${EXTENSION_PATH}/verify-otp`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        phone_number: phoneNumber,
        otp: otp
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to verify OTP")
    }

    return result
  } catch (error) {
    console.error("Verify OTP error:", error)
    return {
      success: false,
      message: error.message || "Verification failed"
    }
  }
}

export const resendOtp = async (phoneNumber) => {
  try {
    const headers = await getAuthHeaders()
    
    console.log("Resend OTP:", { phoneNumber })
    
    const response = await fetch(`${BASE_URL}${EXTENSION_PATH}/resend-otp`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        phone_number: phoneNumber
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to resend OTP")
    }

    return result
  } catch (error) {
    console.error("Resend OTP error:", error)
    return {
      success: false,
      message: error.message || "Failed to resend verification code"
    }
  }
}

export const getVerificationStatus = async (phoneNumber) => {
  try {
    const headers = await getAuthHeaders()
    
    const response = await fetch(
      `${BASE_URL}${EXTENSION_PATH}/status?phone_number=${encodeURIComponent(phoneNumber)}`,
      {
        method: "GET",
        headers
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to get verification status")
    }

    return result
  } catch (error) {
    console.error("Get verification status error:", error)
    return {
      success: false,
      message: error.message || "Failed to get verification status"
    }
  }
}
