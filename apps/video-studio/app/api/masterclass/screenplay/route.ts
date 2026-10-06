import { NextResponse } from 'next/server';
import type { FilmBlueprint } from '../../../../lib/movie-masterclass';
import { buildDeterministicScreenplay } from '../../../../lib/cinematic-production';

export const dynamic = 'force-dynamic';

function systemPrompt() {
  return [
    'You are the screenplay department inside MABRIG CINEMA.',
    'Write production-ready cinematic screenplay pages from the supplied film blueprint.',
    'Preserve scene count, act order, character identity and world continuity.',
    'Use concise scene headings, visual action, playable dialogue, subtext and strong transitions.',
    'Do not add random characters or locations unless the blueprint clearly requires them.',
    'The result must be directly usable by an AI film production pipeline.',
  ].join(' ');
}

async function generateWithOpenRouter(blueprint: FilmBlueprint) {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  const model = process.env.OPENROUTER_MODEL?.trim();
  if (!key || !model) return null;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://aivideo.mabrigkorie.org',
      'X-Title': 'MABRIG CINEMA',
    },
    body: JSON.stringify({
      model,
      temperature: 0.65,
      messages: [
        { role: 'system', content: systemPrompt() },
        {
          role: 'user',
          content:
            'Create the full shooting screenplay from this blueprint. Return screenplay text only.\n\n' +
            JSON.stringify(blueprint),
        },
      ],
    }),
    cache: 'no-store',
  });

  if (!response.ok) return null;
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  return typeof content === 'string' && content.trim() ? content.trim() : null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { blueprint?: FilmBlueprint };
    if (!body.blueprint?.scenes?.length) {
      return NextResponse.json({ error: 'blueprint with scenes is required' }, { status: 400 });
    }

    const aiScreenplay = await generateWithOpenRouter(body.blueprint);
    return NextResponse.json({
      ok: true,
      source: aiScreenplay ? 'openrouter' : 'deterministic-fallback',
      screenplay: aiScreenplay || buildDeterministicScreenplay(body.blueprint),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Screenplay generation failed',
      },
      { status: 400 },
    );
  }
}
