import { NextResponse } from 'next/server'
import { cleanupExpiredCodes } from '@/callAPI/sms'

export async function POST(request) {
  try {
    // Clean up expired verification codes
    cleanupExpiredCodes()

    return NextResponse.json({
      success: true,
      message: 'Expired codes cleaned up successfully'
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to cleanup expired codes'
      },
      { status: 500 }
    )
  }
}
