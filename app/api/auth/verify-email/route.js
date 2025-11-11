import { NextResponse } from 'next/server'
import { verifyEmailURL } from '@/callAPI/utiles'

/**
 * API route to handle Directus verification email redirects
 * This intercepts requests from Directus verification links and redirects to our custom page
 */
export async function GET(request) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    
    if (!searchParams || typeof searchParams.get !== 'function') {
      return NextResponse.redirect(
        new URL(`${verifyEmailURL}?error=invalid_params`, request.url)
      )
    }
    
    const token = searchParams.get('token')
    const redirect = searchParams.get('redirect') || searchParams.get('redirect_to')

    if (!token || typeof token !== 'string') {
      // If no token, redirect to verify-email page with error
      return NextResponse.redirect(
        new URL(`${verifyEmailURL}?error=missing_token`, request.url)
      )
    }

    // Build the redirect URL with token
    const redirectUrl = new URL(verifyEmailURL, request.url)
    redirectUrl.searchParams.set('token', String(token))
    
    if (redirect && typeof redirect === 'string') {
      redirectUrl.searchParams.set('redirect', String(redirect))
    }

    // Redirect to our custom verify-email page
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Verify email redirect error:', error)
    // On error, redirect to verify-email page
    return NextResponse.redirect(
      new URL(`${verifyEmailURL}?error=redirect_failed`, request.url)
    )
  }
}

