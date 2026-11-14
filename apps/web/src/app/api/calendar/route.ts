import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.workspace) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const params = new URL(req.url).searchParams;
  const from = new Date(params.get('from') || '');
  const to = new Date(params.get('to') || '');
  if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime()) ||
      from >= to || to.getTime() - from.getTime() > 40 * 24 * 60 * 60 * 1000) {
    return NextResponse.json({ success: false, error: 'Provide a valid date range of 40 days or less' }, { status: 400 });
  }

  const posts = await prisma.post.findMany({
    where: {
      workspaceId: session.workspace.id,
      scheduledAt: { gte: from, lt: to },
      status: { in: ['SCHEDULED', 'APPROVED', 'PENDING_APPROVAL', 'FAILED'] },
    },
    orderBy: { scheduledAt: 'asc' },
    take: 500,
    select: { id: true, title: true, content: true, scheduledAt: true, status: true },
  });

  return NextResponse.json({ success: true, data: posts, truncated: posts.length === 500 });
}
