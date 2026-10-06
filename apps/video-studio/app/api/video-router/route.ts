import { NextRequest, NextResponse } from 'next/server';
import { VIDEO_PROVIDER_REGISTRY, runtimeStatesFromEnvironment } from '../../../lib/video-router/provider-registry';
import { runVideoRoutingMission } from '../../../lib/video-router/orchestrator';
import { videoCircuitBreakers } from '../../../lib/video-router/circuit-breaker';
import { currentUser, hasPaidAccess } from '../../../lib/auth';
import type {
  ProviderRuntimeState,
  VideoGenerationRequest,
} from '../../../lib/video-router/types';

async function paidGuard() {
  const user = await currentUser();
  return Boolean(user && hasPaidAccess(user));
}

export async function GET() {
  if (!(await paidGuard())) return NextResponse.json({ error: 'Paid membership required.' }, { status: 401 });
  return NextResponse.json({
    providers: VIDEO_PROVIDER_REGISTRY,
    runtime: runtimeStatesFromEnvironment(),
    circuits: videoCircuitBreakers.snapshot(),
    modes: ['free-only', 'free-preferred', 'commercial-safe', 'best-quality'],
    note:
      'Google Vids account quota is intentionally separate from Gemini/Veo API billing and is enabled only through an authorized connector/local bridge.',
  });
}

export async function POST(req: NextRequest) {
  if (!(await paidGuard())) return NextResponse.json({ error: 'Paid membership required.' }, { status: 401 });
  try {
    const body = (await req.json()) as {
      request?: VideoGenerationRequest;
      wallet?: ProviderRuntimeState[];
    };

    if (!body?.request) {
      return NextResponse.json(
        { error: 'request is required' },
        { status: 400 },
      );
    }

    const mission = runVideoRoutingMission(body.request, body.wallet);
    return NextResponse.json(mission, {
      status: mission.decision.selectedProviderId ? 200 : 409,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Invalid video routing request',
      },
      { status: 400 },
    );
  }
}
