import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const session = await getSession();

  let stats = {
    totalPosts: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
    totalContacts: 0,
    totalImpressions: 0,
    engagementRate: 0,
    connectedAccounts: 0,
  };

  let recentPosts: any[] = [];
  let connectedAccounts: any[] = [];

  if (session?.workspace) {
    const workspaceId = session.workspace.id;

    const [postCounts, contacts, accounts, recent] = await Promise.all([
      prisma.post.groupBy({
        by: ['status'],
        where: { workspaceId },
        _count: true,
      }),
      prisma.contact.count({ where: { workspaceId } }),
      prisma.socialAccount.findMany({
        where: { workspaceId, isActive: true },
        select: { id: true, platform: true, accountName: true, avatar: true },
        take: 10,
      }),
      prisma.post.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          socialAccounts: {
            include: { socialAccount: { select: { platform: true, accountName: true } } },
          },
        },
      }),
    ]);

    const scheduled = postCounts.find((p) => p.status === 'SCHEDULED')?._count ?? 0;
    const published = postCounts.find((p) => p.status === 'PUBLISHED')?._count ?? 0;
    const total = postCounts.reduce((acc, p) => acc + p._count, 0);

    stats = {
      totalPosts: total,
      scheduledPosts: scheduled,
      publishedPosts: published,
      totalContacts: contacts,
      totalImpressions: 0,
      engagementRate: 0,
      connectedAccounts: accounts.length,
    };

    recentPosts = recent;
    connectedAccounts = accounts;
  }

  return (
    <DashboardClient
      stats={stats}
      recentPosts={recentPosts}
      connectedAccounts={connectedAccounts}
      userName={session?.user.name || 'Creator'}
    />
  );
}
