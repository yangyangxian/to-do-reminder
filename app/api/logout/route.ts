import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'auth_token';

export async function POST() {
  // Clear the auth_token cookie
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
