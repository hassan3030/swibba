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

    console.log('Verifying email with token:', token.substring(0, 20) + '...');

 
    // const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    const directusUrl = baseURL
    const verifyResponse = await fetch(`${directusUrl}/users/register/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Directus verification response status:', verifyResponse.status);

    if (verifyResponse.status === 204 || verifyResponse.ok) {
      console.log('Email verification successful');
      return NextResponse.json({
        success: true,
        message: 'Email verified successfully! You can now sign in to your account.',
      });
    }

    
    let errorMessage = 'Invalid or expired verification token. Please request a new verification email.';
    
    try {
      const errorData = await verifyResponse.json();
      console.error('Directus verification failed:', errorData);
      if (errorData.errors?.[0]?.message) {
        errorMessage = errorData.errors[0].message;
      }
    } catch {
      console.error('Directus verification failed with status:', verifyResponse.status);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Verification error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify email';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}