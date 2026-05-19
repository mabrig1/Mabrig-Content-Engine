import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  type: z.enum(['FOLLOWER', 'LEAD', 'CUSTOMER', 'PARTNER', 'COLLABORATOR', 'INFLUENCER']).default('LEAD'),
  notes: z.string().max(5000).optional(),
  tagIds: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.workspace) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const type = searchParams.get('type');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const where: any = { workspaceId: session.workspace.id };
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { tags: { include: { tag: true } } },
    }),
    prisma.contact.count({ where }),
  ]);

  return NextResponse.json({ success: true, data: contacts, total, page, limit, hasMore: skip + contacts.length < total });
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

    const { firstName, lastName, email, phone, type, notes, tagIds } = parsed.data;

    const contact = await prisma.contact.create({
      data: {
        workspaceId: session.workspace.id,
        firstName,
        lastName,
        email,
        phone,
        type,
        notes,
        tags: { create: tagIds.map((id) => ({ tagId: id })) },
      },
      include: { tags: { include: { tag: true } } },
    });

    return NextResponse.json({ success: true, data: contact }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create contact' }, { status: 500 });
  }
}
