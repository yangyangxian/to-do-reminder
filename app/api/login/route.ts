import { NextRequest, NextResponse } from 'next/server';

// Dummy user for demonstration. Replace with your DB/user lookup logic.
const DUMMY_USER = {
  email: 'test@example.com',
  password: 'password123', // In production, use hashed passwords!
};

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    // Replace this with your real user lookup and password check
    if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
      // In a real app, set a cookie or session here
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
