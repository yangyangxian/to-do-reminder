import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev_secret_key');
const COOKIE_NAME = 'auth_token';

// Define which routes require authentication
const protectedRoutes = [
  '/list',
  '/home',
  '/api/todos',
  '/api/usersettings',
  '/api/usersubscriptions',
  // Add more as needed
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

    // Redirect authenticated users away from /login and /signup to /home
  console.log('pathname', pathname);
  if (pathname === '/login' || pathname === '/signup') {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        // Use a 307 redirect to ensure browser navigation
        return NextResponse.redirect(new URL('/home', req.url), 307);
      } catch (err) {
        // Invalid token, allow to see login/signup
      }
    }
    // Allow unauthenticated users to see login/signup
    return NextResponse.next();
  }

  // Only protect specified routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    console.log('Token:', token);
    if (!token) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', req.url));
    }
    try {
      await jwtVerify(token, JWT_SECRET);
      // If valid, allow request
      console.log('Token is valid');
      return NextResponse.next();
    } catch (err) {
        console.error('Token verification failed:', err);
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

}

export const config = {
  matcher: [
    '/((?!login|signup|_next|favicon.ico|manifest.json|sw.js|vercel.svg|next.svg|apple-touch-icon.png|android-chrome-192x192.png|android-chrome-512x512.png|public|api/login|api/signup|api/logout).*)',
  ],
};
