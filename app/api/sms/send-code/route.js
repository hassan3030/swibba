import { NextResponse } from 'next/server'
import { sendVerificationSMS } from '@/callAPI/sms'
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

    // Send verification SMS
    const result = await sendVerificationSMS(phoneNumber, userId)

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Verification code sent successfully'
    })

  } catch (error) {
    console.error('Send SMS code error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to send verification code',
        code: error.code || 'SMS_SEND_ERROR'
      },
      { status: 400 }
    )
  }
}
