import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const platformSchema = z.enum([
  'FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'LINKEDIN',
  'TWITTER', 'THREADS', 'PINTEREST', 'TELEGRAM',
]);

const schema = z.object({
  name: z.string().trim().min(3).max(100),
  variants: z.array(z.object({
    platform: platformSchema,
    content: z.string().trim().min(10).max(10000),
  })).min(1).max(9),
}).strict().refine(
  (data) => new Set(data.variants.map((item) => item.platform)).size === data.variants.length,
  'Each platform may appear only once',
);

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.workspace) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = schema.safeParse(await req.json());
    if (!payload.success) {
      return NextResponse.json({
        success: false, error: 'Invalid campaign brief', details: payload.error.flatten(),
      }, { status: 400 });
    }

    // This is a *draft* batch. Nothing is posted or published externally.
    const posts = await prisma.$transaction(
      payload.data.variants.map(({ platform, content }) => prisma.post.create({
        data: {
          workspaceId: session.workspace!.id,
          title: payload.data.name + ' — ' + platform,
          content,
          status: 'DRAFT',
          aiGenerated: false,
          contentVariants: { campaignName: payload.data.name, intendedPlatform: platform, origin: 'campaign-studio' },
          notes: 'Created by Campaign Studio. Review, connect the correct account and approve before publishing.',
        },
        select: { id: true, title: true, status: true },
      })),
    );

    return NextResponse.json({ success: true, data: { count: posts.length, posts } }, { status: 201 });
  } catch (error) {
    console.error('Campaign draft save failed:', error);
    return NextResponse.json({ success: false, error: 'Unable to save campaign' }, { status: 500 });
  }
}
