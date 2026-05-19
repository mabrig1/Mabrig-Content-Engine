import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366f1'),
});

export async function GET() {
  const session = await getSession();
  if (!session?.workspace) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const tags = await prisma.tag.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json({ success: true, data: tags });
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
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }
    const tag = await prisma.tag.create({
      data: { workspaceId: session.workspace.id, name: parsed.data.name, color: parsed.data.color },
    });
    return NextResponse.json({ success: true, data: tag }, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Tag already exists' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create tag' }, { status: 500 });
  }
}
