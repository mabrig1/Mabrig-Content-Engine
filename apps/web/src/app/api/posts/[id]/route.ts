import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.workspace) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const post = await prisma.post.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    include: {
      socialAccounts: { include: { socialAccount: true } },
      mediaItems: { include: { media: true } },
      tags: { include: { tag: true } },
      analytics: true,
    },
  });

  if (!post) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: post });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.workspace) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const post = await prisma.post.findFirst({
      where: { id: params.id, workspaceId: session.workspace.id },
    });
    if (!post) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const updated = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...(body.content !== undefined && { content: body.content }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.scheduledAt !== undefined && { scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null }),
        ...(body.isEvergreen !== undefined && { isEvergreen: body.isEvergreen }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.workspace) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const post = await prisma.post.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
  });
  if (!post) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
