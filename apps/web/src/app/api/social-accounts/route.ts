import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session?.workspace) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const accounts = await prisma.socialAccount.findMany({
    where: { workspaceId: session.workspace.id, isActive: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      platform: true,
      accountName: true,
      username: true,
      avatar: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, data: accounts });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.workspace) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // In production, this would handle OAuth callback.
    // For now, allow manual connection for testing.
    const account = await prisma.socialAccount.create({
      data: {
        workspaceId: session.workspace.id,
        platform: body.platform,
        accountId: body.accountId || `manual-${Date.now()}`,
        accountName: body.accountName,
        username: body.username,
        avatar: body.avatar,
        accessToken: body.accessToken || 'placeholder',
        scopes: body.scopes || [],
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: account }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Account already connected' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Failed to connect account' }, { status: 500 });
  }
}
