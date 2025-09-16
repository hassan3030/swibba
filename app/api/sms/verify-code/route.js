import { NextResponse } from 'next/server'
import { verifySMSCode } from '@/callAPI/sms'
import { getCookie, decodedToken } from '@/callAPI/utiles'

export async function POST(request) {
  try {
    const { phoneNumber, code } = await request.json()

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { success: false, error: 'Phone number and verification code are required' },
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

    // Verify SMS code
    const result = await verifySMSCode(phoneNumber, code, userId)

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Phone number verified successfully'
    })

  } catch (error) {
    console.error('Verify SMS code error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to verify code',
        code: error.code || 'SMS_VERIFY_ERROR'
      },
      { status: 400 }
    )
  }
}
