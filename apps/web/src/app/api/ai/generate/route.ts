import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateWithHuggingFace, huggingFaceConfigured } from '@/lib/huggingface';

const schema = z.object({
  type: z.enum(['CAPTION', 'HOOK', 'HASHTAGS', 'CTA', 'HEADLINE', 'STORY', 'THREAD', 'VIDEO_SCRIPT']),
  topic: z.string().min(1).max(500),
  tone: z.enum(['motivational', 'prophetic', 'inspirational', 'business', 'storytelling', 'educational', 'humorous', 'professional']).default('inspirational'),
  platform: z.string().optional(),
  extraContext: z.string().max(500).optional(),
  model: z.enum(['openai', 'claude', 'huggingface']).default('openai'),
});

const TONE_DESCRIPTIONS: Record<string, string> = {
  motivational: 'energetic, empowering, action-driving with powerful emotional hooks',
  prophetic: 'visionary, forward-thinking, bold declarations about the future',
  inspirational: 'uplifting, warm, emotionally resonant, story-driven',
  business: 'professional, authoritative, value-focused, results-oriented',
  storytelling: 'narrative-driven, personal, relatable, with a clear arc',
  educational: 'informative, clear, structured, teaching-oriented',
  humorous: 'witty, light-hearted, entertaining, relatable',
  professional: 'formal, polished, credible, expert-positioning',
};

const TYPE_PROMPTS: Record<string, (topic: string, tone: string, platform?: string, extra?: string) => string> = {
  CAPTION: (topic, tone, platform, extra) => `
Write a compelling social media caption about: "${topic}"
Tone: ${tone} - ${TONE_DESCRIPTIONS[tone]}
${platform ? `Platform: ${platform} (optimize for this platform's style and character limits)` : ''}
${extra ? `Additional context: ${extra}` : ''}

Requirements:
- Start with an attention-grabbing hook (first line is critical)
- Include a clear call-to-action at the end
- Use relevant emojis naturally (not excessively)
- Make it feel authentic and human
- Do NOT use hashtags (I'll generate those separately)

Output ONLY the caption text, nothing else.
  `.trim(),

  HOOK: (topic, tone, platform) => `
Write 5 powerful opening hooks for content about: "${topic}"
Tone: ${tone} - ${TONE_DESCRIPTIONS[tone]}
${platform ? `Platform: ${platform}` : ''}

Requirements:
- Each hook must be under 150 characters
- Must stop the scroll immediately
- Use pattern interrupts, surprising statements, or powerful questions
- Number each hook 1-5
- No fluff, no generic openers

Output ONLY the 5 hooks, numbered.
  `.trim(),

  HASHTAGS: (topic, tone, platform) => `
Generate 30 strategic hashtags for content about: "${topic}"
${platform ? `Platform: ${platform}` : ''}

Requirements:
- Mix of: 10 high-volume (#500k+ posts), 10 mid-range (#50k-500k), 10 niche (#1k-50k)
- All must be relevant to the topic
- Include a mix of broad and specific hashtags
- Format: just the hashtags, space-separated, starting with #

Output ONLY the hashtags, nothing else.
  `.trim(),

  CTA: (topic, tone, platform) => `
Write 5 powerful call-to-action statements for content about: "${topic}"
Tone: ${tone}
${platform ? `Platform: ${platform}` : ''}

Requirements:
- Each CTA should drive a specific action (comment, share, click, buy, follow)
- Make them urgent, specific, and compelling
- Vary the types of CTAs
- Number each 1-5

Output ONLY the 5 CTAs, numbered.
  `.trim(),

  HEADLINE: (topic, tone) => `
Write 10 viral headline variations for: "${topic}"
Tone: ${tone} - ${TONE_DESCRIPTIONS[tone]}

Requirements:
- Use proven formats: "How to...", "X Ways to...", "Why...", "The Truth About...", "Stop...", numbers, questions
- Each headline must be under 80 characters
- Make them click-worthy but not clickbait
- Number each 1-10

Output ONLY the 10 headlines, numbered.
  `.trim(),

  STORY: (topic, tone) => `
Write a compelling personal story framework about: "${topic}"
Tone: ${tone} - ${TONE_DESCRIPTIONS[tone]}

Structure:
1. Hook (attention-grabbing opening)
2. Context (set the scene)
3. Conflict/Challenge (the problem)
4. Turning Point (the insight/change)
5. Resolution (the outcome)
6. Lesson/CTA (takeaway for audience)

Make it authentic, relatable, and emotionally resonant. Write it as flowing paragraphs.
  `.trim(),

  THREAD: (topic, tone) => `
Write a viral Twitter/X thread about: "${topic}"
Tone: ${tone} - ${TONE_DESCRIPTIONS[tone]}

Requirements:
- 8-12 tweets in the thread
- First tweet is the hook (must make people want to read more)
- Each tweet under 280 characters
- End with engagement CTA
- Number each tweet 1/, 2/, etc.
- Flow naturally from one tweet to the next

Output ONLY the thread, numbered tweets.
  `.trim(),

  VIDEO_SCRIPT: (topic, tone, platform) => `
Write a ${platform === 'TIKTOK' || platform === 'INSTAGRAM' ? '30-60 second' : '2-3 minute'} video script about: "${topic}"
Tone: ${tone} - ${TONE_DESCRIPTIONS[tone]}
${platform ? `Platform: ${platform}` : ''}

Format:
[HOOK - 0:00-0:05] Opening line
[INTRO - 0:05-0:15] Brief context
[MAIN CONTENT] Core value delivery
[CTA - Final 5s] Call to action

Write it conversationally, as if speaking directly to camera. Include [B-ROLL suggestions] where relevant.
  `.trim(),
};

async function generateWithOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert social media content strategist and copywriter for creators and brands. You write viral, engaging content that drives real results.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1500,
      temperature: 0.85,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'OpenAI request failed');
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function generateWithClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Anthropic API key not configured');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: 'You are an expert social media content strategist and copywriter for creators and brands. You write viral, engaging content that drives real results.',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Claude request failed');
  }

  const data = await res.json();
  return data.content[0].text;
}

type AIProvider = 'openai' | 'claude' | 'huggingface';

function providerConfigured(provider: AIProvider) {
  if (provider === 'openai') return Boolean(process.env.OPENAI_API_KEY);
  if (provider === 'claude') return Boolean(process.env.ANTHROPIC_API_KEY);
  return huggingFaceConfigured();
}

async function generateWithProvider(
  provider: AIProvider,
  prompt: string,
): Promise<{ content: string; model: string }> {
  if (provider === 'openai') {
    return { content: await generateWithOpenAI(prompt), model: 'gpt-4o-mini' };
  }
  if (provider === 'claude') {
    return { content: await generateWithClaude(prompt), model: 'claude-haiku-4-5' };
  }

  const result = await generateWithHuggingFace(prompt);
  return {
    content: result.content,
    model: `${result.model} via Hugging Face`,
  };
}

async function generateWithFallback(
  requested: AIProvider,
  prompt: string,
): Promise<{ content: string; model: string }> {
  const order = [
    requested,
    'huggingface',
    'openai',
    'claude',
  ] as AIProvider[];
  const providers = [...new Set(order)].filter(providerConfigured);

  if (!providers.length) {
    throw new Error(
      'No AI provider is configured. Set HF_TOKEN, OPENAI_API_KEY, or ANTHROPIC_API_KEY.',
    );
  }

  let firstError: unknown;
  for (const provider of providers) {
    try {
      return await generateWithProvider(provider, prompt);
    } catch (error) {
      firstError ??= error;
    }
  }

  throw firstError instanceof Error
    ? firstError
    : new Error('All configured AI providers failed');
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.workspace) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const { type, topic, tone, platform, extraContext, model } = parsed.data;
    const promptFn = TYPE_PROMPTS[type];
    if (!promptFn) {
      return NextResponse.json({ success: false, error: 'Invalid content type' }, { status: 400 });
    }

    const prompt = promptFn(topic, tone, platform, extraContext);

    const generated = await generateWithFallback(model, prompt);
    const result = generated.content;
    const usedModel = generated.model;

    // Save to history (non-blocking)
    await prisma.aIContentHistory.create({
      data: {
        workspaceId: session.workspace.id,
        type,
        prompt: topic,
        result,
        model: usedModel,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, data: { content: result, model: usedModel, type } });
  } catch (error: any) {
    console.error('AI generate error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'AI generation failed. Check your API keys.' },
      { status: 500 }
    );
  }
}
