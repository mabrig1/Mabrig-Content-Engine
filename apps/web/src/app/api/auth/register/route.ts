import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'CREATOR',
        status: 'ACTIVE',
      },
    });

    // Create default workspace
    const workspaceName = `${name}'s Workspace`;
    const baseSlug = slugify(name);
    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        slug: `${baseSlug}-${user.id.slice(-6)}`,
        ownerId: user.id,
        plan: 'FREE',
      },
    });

    // Add user as owner member
    await prisma.workspaceMember.create({
      data: { workspaceId: workspace.id, userId: user.id, role: 'OWNER' },
    });

    const token = signToken({ userId: user.id, email: user.email, workspaceId: workspace.id });

    const response = NextResponse.json({
      success: true,
      data: { userId: user.id, workspaceId: workspace.id },
    });

    response.cookies.set('mabrig_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
