import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSchema = z.object({
  content: z.string().min(1).max(10000),
  title: z.string().max(200).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  socialAccountIds: z.array(z.string()).default([]),
  mediaIds: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
  isEvergreen: z.boolean().default(false),
  aiGenerated: z.boolean().default(false),
  status: z.enum(['DRAFT', 'SCHEDULED']).default('DRAFT'),
});

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.workspace) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const where: any = { workspaceId: session.workspace.id };
  if (status) where.status = status;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        socialAccounts: {
          include: { socialAccount: { select: { id: true, platform: true, accountName: true, avatar: true } } },
        },
        mediaItems: {
          include: { media: true },
          orderBy: { order: 'asc' },
        },
        tags: { include: { tag: true } },
        analytics: true,
      },
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: posts,
    total,
    page,
    limit,
    hasMore: skip + posts.length < total,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.workspace) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { content, title, scheduledAt, socialAccountIds, mediaIds, tagIds, isEvergreen, aiGenerated, status } = parsed.data;

    const post = await prisma.post.create({
      data: {
        workspaceId: session.workspace.id,
        content,
        title,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        isEvergreen,
        aiGenerated,
        status: scheduledAt ? 'SCHEDULED' : status,
        socialAccounts: {
          create: socialAccountIds.map((id) => ({ socialAccountId: id })),
        },
        mediaItems: {
          create: mediaIds.map((id, order) => ({ mediaId: id, order })),
        },
        tags: {
          create: tagIds.map((id) => ({ tagId: id })),
        },
      },
      include: {
        socialAccounts: { include: { socialAccount: true } },
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
