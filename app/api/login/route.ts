import { ExecuteSQL } from '@/app/dataAccess/dataAccess';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key'; // Use env var in production
const COOKIE_NAME = 'auth_token';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const checkUser = await ExecuteSQL('SELECT * FROM users WHERE username = $1', [email]);
    if (!checkUser || checkUser.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    const user = checkUser[0] || checkUser; // Adjust if ExecuteSQL returns array or object
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (email === user.username && passwordMatch) {
      // Generate JWT
      const token = jwt.sign({ email: user.username, id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      // Set cookie and return JSON success
      const response = NextResponse.json({ success: true });
      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Auth check endpoint for client-side redirect
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  try {
    // Use jose for verification (Edge compatible)
    const { jwtVerify } = await import('jose');
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.json({ authenticated: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
