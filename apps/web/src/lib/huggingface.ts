const HF_CHAT_URL = 'https://router.huggingface.co/v1/chat/completions';

export function huggingFaceConfigured() {
  return Boolean(process.env.HF_TOKEN?.trim());
}

export function huggingFaceModel() {
  return (
    process.env.HF_CHAT_MODEL?.trim() ||
    'openai/gpt-oss-120b:cheapest'
  );
}

export async function generateWithHuggingFace(
  prompt: string,
): Promise<{ content: string; model: string }> {
  const token = process.env.HF_TOKEN?.trim();
  if (!token) throw new Error('Hugging Face token not configured');

  const model = huggingFaceModel();
  const res = await fetch(HF_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      stream: false,
      max_tokens: 1500,
      temperature: 0.85,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert social media content strategist and copywriter for creators and brands. Write useful, engaging content that follows the user constraints exactly.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  const data = (await res.json().catch(() => null)) as
    | {
        choices?: Array<{
          message?: { content?: string };
        }>;
        error?: { message?: string } | string;
      }
    | null;

  if (!res.ok) {
    const detail =
      typeof data?.error === 'string'
        ? data.error
        : data?.error?.message;
    throw new Error(detail || `Hugging Face request failed with HTTP ${res.status}`);
  }

  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Hugging Face returned an empty completion');
  }

  return { content, model };
}
