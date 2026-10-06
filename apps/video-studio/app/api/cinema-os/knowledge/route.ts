import { NextRequest, NextResponse } from 'next/server';
import { currentUser, hasPaidAccess } from '../../../../lib/auth';
import { searchCinemaKnowledge } from '../../../../lib/pro-film-os';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = await currentUser();
  if (!user || !hasPaidAccess(user)) {
    return NextResponse.json({ error: 'Paid membership required.' }, { status: 401 });
  }
  const query = request.nextUrl.searchParams.get('q') || '';
  return NextResponse.json({ ok: true, items: searchCinemaKnowledge(query) });
}
