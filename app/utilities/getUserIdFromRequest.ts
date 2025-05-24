import { NextRequest } from 'next/server';

/**
 * Extract userId from JWT cookie in a Next.js API route.
 * Returns userId as number, or null if not authenticated/invalid.
 */
export async function getUserIdFromRequest(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    const { jwtVerify } = await import('jose');
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev_secret_key');
    const { payload } = await jwtVerify(token, secret);
    const idRaw = payload.id;
    if (typeof idRaw === 'string') {
      const parsed = parseInt(idRaw, 10);
      return isNaN(parsed) ? null : parsed;
    } else if (typeof idRaw === 'number') {
      return idRaw;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
