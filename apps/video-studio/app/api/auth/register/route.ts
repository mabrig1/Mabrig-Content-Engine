import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { usersCollection, type UserRole } from '../../../../lib/db';
import { createSessionToken, SESSION_COOKIE } from '../../../../lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body?.name || '').trim().slice(0, 120);
    const email = String(body?.email || '').trim().toLowerCase().slice(0, 180);
    const password = String(body?.password || '');

    if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
      return NextResponse.json(
        { error: 'Name, valid email and password of at least 8 characters are required.' },
        { status: 400 },
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const role: UserRole = adminEmail && email === adminEmail ? 'admin' : 'member';
    const now = new Date();
    const users = await usersCollection();
    const result = await users.insertOne({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role,
      subscription: {
        status: role === 'admin' ? 'active' : 'inactive',
        plan: role === 'admin' ? 'admin' : 'member',
        provider: role === 'admin' ? 'manual' : undefined,
        updatedAt: now,
      },
      createdAt: now,
      updatedAt: now,
    });

    const token = await createSessionToken({
      sub: result.insertedId.toHexString(),
      email,
      role,
    });
    const response = NextResponse.json({
      ok: true,
      user: { id: result.insertedId.toHexString(), name, email, role },
    }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ error: 'An account already exists for this email.' }, { status: 409 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed.' },
      { status: 500 },
    );
  }
}
