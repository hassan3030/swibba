import {  NextResponse } from 'next/server';
import { baseURL } from '@/callAPI/utiles';


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    const directusUrl = baseURL
    
    // Try query parameter approach (as per your Directus setup)
    const queryUrl = `${directusUrl}users/register/verify-email?token=${encodeURIComponent(token)}`;
    
    const verifyResponse = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Directus returns 200 with success response for verification
    if (verifyResponse.ok && (verifyResponse.status === 200 || verifyResponse.status === 204)) {
      return NextResponse.json({
        success: true,
        message: 'Email verified successfully! You can now sign in to your account.',
      });
    }

    // Handle error response
    let errorMessage = 'Invalid or expired verification token. Please request a new verification email.';
    
    try {
      const errorData = await verifyResponse.json();
      if (errorData.errors?.[0]?.message) {
        errorMessage = errorData.errors[0].message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // If can't parse error, use default message
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status: 400 }
    );

  } catch (error) {
    // console.error('Verification error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify email';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}