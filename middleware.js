// middleware.js
import { NextResponse } from 'next/server';

export async function middleware(req) {

  //  const { pathname } = request.nextUrl;
 
   const token = req.cookies.get('Token')?.value;


  // Protect /chat
  if (!token && req.nextUrl.pathname.startsWith('/chat')) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }


 // Protect /offers
 if (!token && req.nextUrl.pathname.startsWith('/offers')) {
  return NextResponse.redirect(new URL('/auth/login', req.url));
}
 // Protect /offers-details
 if (!token && req.nextUrl.pathname.startsWith('/offers-details')) {
  return NextResponse.redirect(new URL('/auth/login', req.url));
}
// Protect /payment
if (!token && req.nextUrl.pathname.startsWith('/payment')) {
  return NextResponse.redirect(new URL('/auth/login', req.url));
}

  // Protect /dashboard
  if (!token && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
 
  // Protect /profile
  if (!token && req.nextUrl.pathname.startsWith('/profile')) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
  // Protect /swap
  if (!token && req.nextUrl.pathname.startsWith('/swap')) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
  // Protect /wishList
  if (!token && req.nextUrl.pathname.startsWith('/wishList')) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
   // Protect /auth/login when already logged in
   if (token && req.nextUrl.pathname.startsWith('/auth/login')) {
    return NextResponse.redirect(new URL('/', req.url));
  }
   // Protect /auth/login when already logged in

 if (token && req.nextUrl.pathname.startsWith('/auth/register')) {
  
    return NextResponse.redirect(new URL('/', req.url));
  }

   // Protect /send-items when already logged in

 if (!token && req.nextUrl.pathname.startsWith('/send-items')) {
  
  return NextResponse.redirect(new URL('/auth/login', req.url));
}

 // Protect /recived-items when already logged in

 if (!token && req.nextUrl.pathname.startsWith('/recived-items')) {
  
  return NextResponse.redirect(new URL('/auth/login', req.url));
}

  return NextResponse.next();
}
 

export const config = {
  matcher: [
             '/offers/:path*',
             '/payment/:path*',
             '/offers-details/:path*',
             '/chat/:path*',
             '/swap/:path*',
             '/wishList/:path*',
             '/profile/:path*',
             '/auth/:path*',
             '/send-items/:path*',
             '/recived-items/:path*',
            ],
};
