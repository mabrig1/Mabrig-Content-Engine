import { NextResponse } from 'next/server';
import { currentUser, hasPaidAccess } from '../../../../lib/auth';
import {
  buildDeterministicDebate,
  CINEMA_KNOWLEDGE,
  type DebateProposal,
  type ProfessionalShot,
} from '../../../../lib/pro-film-os';

export const dynamic = 'force-dynamic';

const AGENTS = [
  ['Director', 'Protect dramatic objective, performance and audience understanding.'],
  ['Cinematographer', 'Protect camera motivation, lens choice, light, axis and visual grammar.'],
  ['Continuity Supervisor', 'Protect identity, wardrobe, props, geography, eyelines and first/last-frame handoff.'],
  ['Editor', 'Protect cut motivation, rhythm, reaction coverage, sound bridges and timeline usability.'],
] as const;

async function callAgent(
  model: string,
  key: string,
  agent: string,
  mandate: string,
  shot: ProfessionalShot,
): Promise<DebateProposal | null> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://aivideo.mabrigkorie.org',
      'X-Title': 'MABRIG CINEMA Debate-Judge',
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            `You are the ${agent} in a professional film production debate. ${mandate} Return JSON only with recommendation, risk, score (1-10). Do not reveal private chain-of-thought.`,
        },
        { role: 'user', content: JSON.stringify({ shot, methodology: CINEMA_KNOWLEDGE.filter((card) => shot.knowledgeRefs.includes(card.id)) }) },
      ],
    }),
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const payload = await response.json();
  const raw = payload?.choices?.[0]?.message?.content;
  if (typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      agent: agent as DebateProposal['agent'],
      recommendation: String(parsed.recommendation || '').slice(0, 1200),
      risk: String(parsed.risk || '').slice(0, 800),
      score: Math.max(1, Math.min(10, Number(parsed.score || 7))),
    };
  } catch {
    return null;
  }
}

async function judge(
  model: string,
  key: string,
  shot: ProfessionalShot,
  proposals: DebateProposal[],
) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://aivideo.mabrigkorie.org',
      'X-Title': 'MABRIG CINEMA Debate-Judge',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are the senior film judge. Resolve the department recommendations into one production decision. Return JSON only: decision APPROVE or REVISE, winningApproach, mandatoryChanges array, score 1-10. Do not reveal private chain-of-thought.',
        },
        { role: 'user', content: JSON.stringify({ shot, proposals, methodology: CINEMA_KNOWLEDGE.filter((card) => shot.knowledgeRefs.includes(card.id)) }) },
      ],
    }),
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const payload = await response.json();
  const raw = payload?.choices?.[0]?.message?.content;
  if (typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      decision: parsed.decision === 'REVISE' ? 'REVISE' as const : 'APPROVE' as const,
      winningApproach: String(parsed.winningApproach || '').slice(0, 1200),
      mandatoryChanges: Array.isArray(parsed.mandatoryChanges)
        ? parsed.mandatoryChanges.slice(0, 8).map((item: unknown) => String(item).slice(0, 500))
        : [],
      score: Math.max(1, Math.min(10, Number(parsed.score || 7))),
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user || !hasPaidAccess(user)) {
    return NextResponse.json({ error: 'Paid membership required.' }, { status: 401 });
  }

  const body = (await request.json()) as { shot?: ProfessionalShot };
  if (!body.shot?.id) {
    return NextResponse.json({ error: 'A professional shot is required.' }, { status: 400 });
  }

  const key = process.env.OPENROUTER_API_KEY?.trim();
  const model = process.env.OPENROUTER_MODEL?.trim();

  if (!key || !model) {
    return NextResponse.json({
      ok: true,
      source: 'deterministic-film-rules',
      debate: buildDeterministicDebate(body.shot),
    });
  }

  const proposals = (await Promise.all(
    AGENTS.map(([agent, mandate]) => callAgent(model, key, agent, mandate, body.shot!)),
  )).filter((item): item is DebateProposal => Boolean(item));

  if (proposals.length !== AGENTS.length) {
    return NextResponse.json({
      ok: true,
      source: 'deterministic-film-rules',
      warning: 'One or more AI departments were unavailable; deterministic cinema rules were used instead.',
      debate: buildDeterministicDebate(body.shot),
    });
  }

  const finalJudge = await judge(model, key, body.shot, proposals);
  if (!finalJudge) {
    return NextResponse.json({
      ok: true,
      source: 'hybrid',
      debate: {
        ...buildDeterministicDebate(body.shot),
        proposals,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    source: 'multi-agent-openrouter',
    debate: {
      shotId: body.shot.id,
      proposals,
      judge: finalJudge,
    },
  });
}
