import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.workspace) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '24');
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { workspaceId: session.workspace.id };
  if (type) where.type = type;

  const [items, total] = await Promise.all([
    prisma.mediaItem.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.mediaItem.count({ where }),
  ]);

  return NextResponse.json({ success: true, data: items, total, page, limit, hasMore: skip + items.length < total });
}
