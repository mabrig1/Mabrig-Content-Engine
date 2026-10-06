import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { usersCollection, type UserRole } from '../../../../lib/db';
import { createSessionToken, SESSION_COOKIE } from '../../../../lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    const users = await usersCollection();
    const user = await users.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const role: UserRole = adminEmail && email === adminEmail ? 'admin' : user.role;
    const token = await createSessionToken({
      sub: user._id.toHexString(),
      email: user.email,
      role,
    });
    const response = NextResponse.json({
      ok: true,
      user: {
        id: user._id.toHexString(),
        name: user.name,
        email: user.email,
        role,
        subscription: user.subscription,
      },
    });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed.' },
      { status: 500 },
    );
  }
}
