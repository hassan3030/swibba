import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://dev-dashboard.swibba.com/';

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone_number, otp } = body;

    if (!phone_number || !otp) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Phone number and OTP code are required' 
        },
        { status: 400 }
      );
    }

    // Get authentication token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('Token')?.value;

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    // Call the Directus extension endpoint
    const response = await fetch(`${DIRECTUS_URL}phone-number-validator/verify-otp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number,
        otp
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.message || 'Failed to verify OTP' 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        verified_phone: result.data?.verified_phone
      },
      message: result.message || 'Phone number verified successfully'
    });

  } catch (error) {
    console.error('Phone verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
