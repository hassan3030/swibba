import { NextResponse } from 'next/server'
import { resendVerificationSMS } from '@/callAPI/sms'
import { getCookie, decodedToken } from '@/callAPI/utiles'

export async function POST(request) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Get user ID if authenticated
    let userId = null
    try {
      const token = await getCookie()
      if (token) {
        const decoded = await decodedToken(token)
        userId = decoded?.id
      }
    } catch (error) {
      // User not authenticated, that's okay for phone verification
      console.log('User not authenticated for SMS verification')
    }

    // Resend verification SMS
    const result = await resendVerificationSMS(phoneNumber, userId)

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Verification code resent successfully'
    })

  } catch (error) {
    console.error('Resend SMS code error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to resend verification code',
        code: error.code || 'SMS_RESEND_ERROR'
      },
      { status: 400 }
    )
  }
}
