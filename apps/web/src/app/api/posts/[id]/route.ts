import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateSchema = z.object({
  content: z.string().trim().min(1).max(10000).optional(),
  title: z.string().max(200).nullable().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'ARCHIVED']).optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  isEvergreen: z.boolean().optional(),
}).strict();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.workspace) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const post = await prisma.post.findFirst({
    where: { id: (await params).id, workspaceId: session.workspace.id },
    include: {
      socialAccounts: { include: { socialAccount: {
        select: { id: true, platform: true, accountName: true, username: true, avatar: true, isActive: true },
      } } },
      mediaItems: { include: { media: true } },
      tags: { include: { tag: true } },
      analytics: true,
    },
  });
  if (!post) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: post });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.workspace) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });

    const existing = await prisma.post.findFirst({ where: { id: (await params).id, workspaceId: session.workspace.id } });
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    if (existing.status === 'PUBLISHED' || existing.status === 'PUBLISHING') {
      return NextResponse.json({ success: false, error: 'Published or publishing posts cannot be changed here' }, { status: 409 });
    }

    const changes = parsed.data;
    const nextStatus = changes.status ?? (
      changes.scheduledAt === null ? 'DRAFT' :
      changes.scheduledAt ? 'SCHEDULED' : existing.status
    );
    const nextSchedule = changes.scheduledAt === undefined
      ? (nextStatus === 'DRAFT' ? null : existing.scheduledAt)
      : changes.scheduledAt ? new Date(changes.scheduledAt) : null;

    if (nextStatus === 'SCHEDULED' && (!nextSchedule || nextSchedule <= new Date())) {
      return NextResponse.json({ success: false, error: 'A future date is required to schedule a post' }, { status: 400 });
    }
    if (nextStatus === 'DRAFT' && nextSchedule) {
      return NextResponse.json({ success: false, error: 'Drafts cannot have an active schedule' }, { status: 400 });
    }

    const updatedCount = await prisma.post.updateMany({
      where: { id: (await params).id, workspaceId: session.workspace.id, status: { notIn: ['PUBLISHED', 'PUBLISHING'] } },
      data: {
        ...(changes.content !== undefined && { content: changes.content }),
        ...(changes.title !== undefined && { title: changes.title }),
        ...(changes.isEvergreen !== undefined && { isEvergreen: changes.isEvergreen }),
        status: nextStatus,
        scheduledAt: nextSchedule,
      },
    });
    if (updatedCount.count === 0) return NextResponse.json({ success: false, error: 'Post changed; retry' }, { status: 409 });
    const updated = await prisma.post.findFirst({ where: { id: (await params).id, workspaceId: session.workspace.id } });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Post update failed:', error);
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.workspace) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const deleted = await prisma.post.deleteMany({
    where: { id: (await params).id, workspaceId: session.workspace.id, status: { notIn: ['PUBLISHED', 'PUBLISHING'] } },
  });
  if (deleted.count === 0) return NextResponse.json({ success: false, error: 'Not found or cannot delete published post' }, { status: 404 });
  return NextResponse.json({ success: true });
}
