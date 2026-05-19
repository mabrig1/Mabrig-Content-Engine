import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SettingsClient from '@/components/settings/SettingsClient';

export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const session = await getSession();
  let socialAccounts: any[] = [];

  if (session?.workspace) {
    socialAccounts = await prisma.socialAccount.findMany({
      where: { workspaceId: session.workspace.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  return (
    <SettingsClient
      user={session?.user}
      workspace={session?.workspace}
      socialAccounts={socialAccounts}
    />
  );
}
