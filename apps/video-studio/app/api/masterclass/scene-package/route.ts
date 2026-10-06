import { NextResponse } from 'next/server';
import type { FilmBlueprint, FilmScenePlan } from '../../../../lib/movie-masterclass';
import { currentUser, hasPaidAccess } from '../../../../lib/auth';
import {
  buildSceneProductionPackage,
  type ActorProfile,
  type SetProfile,
} from '../../../../lib/cinematic-production';
import { runVideoRoutingMission } from '../../../../lib/video-router/orchestrator';

async function paidGuard() {
  const user = await currentUser();
  return Boolean(user && hasPaidAccess(user));
}

export const dynamic = 'force-dynamic';

function routerRatio(ratio: string) {
  if (ratio === '9:16' || ratio === '1:1') return ratio;
  return '16:9';
}

export async function POST(request: Request) {
  if (!(await paidGuard())) return NextResponse.json({ error: 'Paid membership required.' }, { status: 401 });
  try {
    const body = (await request.json()) as {
      blueprint?: FilmBlueprint;
      scene?: FilmScenePlan;
      actor?: Partial<ActorProfile>;
      set?: Partial<SetProfile>;
    };

    if (!body.blueprint || !body.scene) {
      return NextResponse.json(
        { error: 'blueprint and scene are required' },
        { status: 400 },
      );
    }

    const scenePackage = buildSceneProductionPackage({
      blueprint: body.blueprint,
      scene: body.scene,
      actor: body.actor,
      set: body.set,
    });

    const routing = runVideoRoutingMission({
      prompt: scenePackage.videoPrompt,
      durationSeconds: Math.max(1, Math.min(180, scenePackage.durationSeconds)),
      aspectRatio: routerRatio(scenePackage.aspectRatio),
      mode: 'free-preferred',
      source: (body.actor?.referenceCount || 0) > 0 ? 'image' : 'text',
      commercialUse: true,
      allowPaidFallback: false,
      maxCostUsd: 0,
    });

    return NextResponse.json({
      ok: true,
      scenePackage,
      routing,
      execution:
        routing.decision.selectedProviderId
          ? 'Scene is packaged and routed. Actual provider execution remains behind the existing execution/approval safety boundary.'
          : 'Scene is packaged, but no provider currently passes the configured free-preferred routing gates.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Scene packaging failed',
      },
      { status: 400 },
    );
  }
}
