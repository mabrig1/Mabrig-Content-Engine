import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const statuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'ARCHIVED'] as const;

const createSchema = z.object({
  content: z.string().trim().min(1).max(10000),
  title: z.string().max(200).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  socialAccountIds: z.array(z.string()).max(20).default([]),
  mediaIds: z.array(z.string()).max(30).default([]),
  tagIds: z.array(z.string()).max(30).default([]),
  isEvergreen: z.boolean().default(false),
  aiGenerated: z.boolean().default(false),
  status: z.enum(['DRAFT', 'SCHEDULED']).default('DRAFT'),
}).strict();

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.workspace) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const params = new URL(req.url).searchParams;
  const status = params.get('status');
  if (status && !statuses.some((value) => value === status)) {
    return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
  }
  const page = Math.max(1, Math.min(10000, Number(params.get('page')) || 1));
  const limit = Math.max(1, Math.min(100, Number(params.get('limit')) || 20));
  const skip = (Math.floor(page) - 1) * Math.floor(limit);
  const where = {
    workspaceId: session.workspace.id,
    ...(status ? { status: status as (typeof statuses)[number] } : {}),
  };

  const [records, total] = await Promise.all([
    prisma.post.findMany({
      where, orderBy: { createdAt: 'desc' }, skip, take: Math.floor(limit),
      include: {
        socialAccounts: { include: { socialAccount: {
          select: { id: true, platform: true, accountName: true, username: true, avatar: true, isActive: true },
        } } },
        mediaItems: { include: { media: true }, orderBy: { order: 'asc' } },
        tags: { include: { tag: true } },
        analytics: true,
      },
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({
    success: true, data: records, total, page, limit,
    hasMore: skip + records.length < total,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.workspace) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }
    const { content, title, scheduledAt, socialAccountIds, mediaIds, tagIds, isEvergreen, aiGenerated, status } = parsed.data;
    if (status === 'SCHEDULED' && !scheduledAt) {
      return NextResponse.json({ success: false, error: 'Choose a schedule date' }, { status: 400 });
    }
    if (scheduledAt && new Date(scheduledAt) <= new Date()) {
      return NextResponse.json({ success: false, error: 'Schedule date must be in the future' }, { status: 400 });
    }
    for (const ids of [socialAccountIds, mediaIds, tagIds]) {
      if (new Set(ids).size !== ids.length) {
        return NextResponse.json({ success: false, error: 'Duplicate content references' }, { status: 400 });
      }
    }

    const workspaceId = session.workspace.id;
    const [accountCount, mediaCount, tagCount] = await Promise.all([
      prisma.socialAccount.count({ where: { workspaceId, id: { in: socialAccountIds }, isActive: true } }),
      prisma.mediaItem.count({ where: { workspaceId, id: { in: mediaIds } } }),
      prisma.tag.count({ where: { workspaceId, id: { in: tagIds } } }),
    ]);
    if (accountCount !== socialAccountIds.length || mediaCount !== mediaIds.length || tagCount !== tagIds.length) {
      return NextResponse.json({ success: false, error: 'Some selected items are not in this workspace' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        workspaceId, content, title,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        isEvergreen, aiGenerated,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
        socialAccounts: { create: socialAccountIds.map((socialAccountId) => ({ socialAccountId })) },
        mediaItems: { create: mediaIds.map((mediaId, order) => ({ mediaId, order })) },
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
      include: {
        socialAccounts: { include: { socialAccount: {
          select: { id: true, platform: true, accountName: true, username: true, avatar: true, isActive: true },
        } } },
        mediaItems: { include: { media: true } },
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
