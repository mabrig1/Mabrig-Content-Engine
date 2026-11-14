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
      id: true, platform: true, accountName: true,
      username: true, avatar: true, isActive: true, createdAt: true,
    },
  });
  return NextResponse.json({ success: true, data: accounts });
}

export async function POST(_req: NextRequest) {
  const session = await getSession();
  if (!session?.workspace) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // The previous manual endpoint accepted arbitrary access tokens (including
  // "placeholder") and then called the account connected. This is unsafe.
  // OAuth must verify the account with the provider and store tokens securely.
  return NextResponse.json({
    success: false,
    error: 'Social account linking requires a verified OAuth integration. Manual placeholder connections are disabled.',
  }, { status: 501 });
}
