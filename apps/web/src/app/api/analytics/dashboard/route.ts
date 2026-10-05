import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session?.workspace) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = session.workspace.id;

  const [postStats, contactCount, accountCount, recentPosts] = await Promise.all([
    prisma.post.groupBy({
      by: ['status'],
      where: { workspaceId },
      _count: true,
    }),
    prisma.contact.count({ where: { workspaceId } }),
    prisma.socialAccount.count({ where: { workspaceId, isActive: true } }),
    prisma.post.findMany({
      where: { workspaceId, status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 10,
      include: { analytics: true },
    }),
  ]);

  type PostStat = { status: string; _count: number };
  const typedPostStats = postStats as PostStat[];

  const statusMap = typedPostStats.reduce((acc: Record<string, number>, g) => {
    acc[g.status] = g._count;
    return acc;
  }, {});

  const totalImpressions = recentPosts.reduce((acc, p) => acc + (p.analytics?.impressions || 0), 0);
  const totalEngagements = recentPosts.reduce((acc, p) => acc + (p.analytics?.likes || 0) + (p.analytics?.comments || 0), 0);
  const engagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;

  return NextResponse.json({
    success: true,
    data: {
      totalPosts: Object.values(statusMap).reduce((a, b) => a + b, 0),
      draftPosts: statusMap['DRAFT'] || 0,
      scheduledPosts: statusMap['SCHEDULED'] || 0,
      publishedPosts: statusMap['PUBLISHED'] || 0,
      totalContacts: contactCount,
      connectedAccounts: accountCount,
      totalImpressions,
      engagementRate: Math.round(engagementRate * 100) / 100,
    },
  });
}
