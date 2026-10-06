import { NextResponse } from 'next/server';
import { currentUser, hasPaidAccess } from '../../../../lib/auth';
import type { FilmBlueprint } from '../../../../lib/movie-masterclass';
import {
  compileProfessionalFilm,
  type ProfessionalShot,
} from '../../../../lib/pro-film-os';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user || !hasPaidAccess(user)) {
    return NextResponse.json({ error: 'Paid membership required.' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      blueprint?: FilmBlueprint;
      previousShots?: ProfessionalShot[];
    };
    if (!body.blueprint?.scenes?.length) {
      return NextResponse.json({ error: 'A film blueprint with scenes is required.' }, { status: 400 });
    }
    const professional = compileProfessionalFilm(body.blueprint, body.previousShots || []);
    return NextResponse.json({
      ok: true,
      professional,
      benchmarkMode: 'PRODUCTION_INTELLIGENCE',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Professional film compilation failed.' },
      { status: 400 },
    );
  }
}
