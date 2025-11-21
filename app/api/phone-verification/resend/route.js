import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://dev-dashboard.swibba.com/';

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone_number, country_code } = body;

    if (!phone_number) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Phone number is required' 
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
    const requestBody = { phone_number };
    if (country_code) {
      requestBody.country_code = country_code;
    }

    const response = await fetch(`${DIRECTUS_URL}phone-number-validator/resend-otp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.message || 'Failed to resend OTP' 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        expiresIn: result.data?.expires_in || 600,
        canResendAfter: result.data?.can_resend_after || 60
      },
      message: result.message || 'OTP resent successfully'
    });

  } catch (error) {
    console.error('Phone verification resend error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
