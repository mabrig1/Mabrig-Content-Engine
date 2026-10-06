import { NextResponse } from 'next/server';
import {
  buildFilmBlueprint,
  type FilmProjectInput,
} from '../../../lib/movie-masterclass';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<FilmProjectInput>;
    const input: FilmProjectInput = {
      title: String(body.title || ''),
      logline: String(body.logline || ''),
      genre: (body.genre || 'Drama') as FilmProjectInput['genre'],
      durationMinutes: Math.max(1, Math.min(180, Number(body.durationMinutes || 3))),
      audience: String(body.audience || ''),
      visualStyle: String(body.visualStyle || ''),
      protagonist: String(body.protagonist || ''),
      conflict: String(body.conflict || ''),
      ending: String(body.ending || ''),
      aspectRatio: String(body.aspectRatio || '2.39:1'),
    };

    return NextResponse.json({
      ok: true,
      mode: 'CINEMATIC_MOVIE_MASTERCLASS',
      blueprint: buildFilmBlueprint(input),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Movie blueprint could not be created.',
      },
      { status: 400 },
    );
  }
}
