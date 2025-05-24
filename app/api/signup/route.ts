import { NextRequest, NextResponse } from 'next/server';
import { ExecuteSQL } from '@/app/dataAccess/dataAccess';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }
    // Check if user already exists
    const checkUser = await ExecuteSQL('SELECT * FROM users WHERE username = $1', [email]);
    if (checkUser.length > 0) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 });
    }
    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    // Insert new user
    await ExecuteSQL('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [email, passwordHash]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Sign up error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
