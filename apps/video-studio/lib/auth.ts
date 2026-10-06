import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { usersCollection, type UserRecord, type UserRole } from './db';
import { SESSION_COOKIE, verifySessionToken } from './session';

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subscription: UserRecord['subscription'];
};

function safeUser(user: UserRecord & { _id: ObjectId }): SafeUser {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const role: UserRole =
    adminEmail && user.email.toLowerCase() === adminEmail ? 'admin' : user.role;
  return {
    id: user._id.toHexString(),
    name: user.name,
    email: user.email,
    role,
    subscription:
      role === 'admin'
        ? {
            ...user.subscription,
            status: 'active',
            plan: 'admin',
            updatedAt: user.subscription.updatedAt || new Date(),
          }
        : user.subscription,
  };
}

export function hasPaidAccess(user: SafeUser) {
  if (user.role === 'admin') return true;
  if (user.subscription.status !== 'active' && user.subscription.status !== 'trialing') {
    return false;
  }
  if (
    user.subscription.currentPeriodEnd &&
    new Date(user.subscription.currentPeriodEnd).getTime() < Date.now()
  ) {
    return false;
  }
  return true;
}

export async function currentUser(): Promise<SafeUser | null> {
  const store = await cookies();
  const session = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!session || !ObjectId.isValid(session.sub)) return null;
  try {
    const users = await usersCollection();
    const user = await users.findOne({ _id: new ObjectId(session.sub) });
    return user ? safeUser(user as UserRecord & { _id: ObjectId }) : null;
  } catch {
    return null;
  }
}

export async function requireLogin(nextPath = '/masterclass') {
  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export async function requirePaidMember() {
  const user = await requireLogin('/masterclass');
  if (!hasPaidAccess(user)) redirect('/pricing?locked=masterclass');
  return user;
}

export async function requireAdmin() {
  const user = await requireLogin('/studio');
  if (user.role !== 'admin') redirect('/masterclass');
  return user;
}
