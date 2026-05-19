// AI Service abstraction layer for MABRIG Content Engine
// Supports OpenAI and Anthropic Claude with automatic fallback

export type AIModel = 'openai' | 'claude';

export type ContentType =
  | 'CAPTION'
  | 'HOOK'
  | 'HASHTAGS'
  | 'CTA'
  | 'HEADLINE'
  | 'STORY'
  | 'THREAD'
  | 'VIDEO_SCRIPT';

export type ContentTone =
  | 'motivational'
  | 'prophetic'
  | 'inspirational'
  | 'business'
  | 'storytelling'
  | 'educational'
  | 'humorous'
  | 'professional';

export interface GenerateRequest {
  type: ContentType;
  topic: string;
  tone: ContentTone;
  platform?: string;
  extraContext?: string;
  model?: AIModel;
}

export interface GenerateResult {
  content: string;
  model: string;
  tokensUsed?: number;
}

export const TONE_DESCRIPTIONS: Record<ContentTone, string> = {
  motivational: 'energetic, empowering, action-driving with powerful emotional hooks',
  prophetic: 'visionary, forward-thinking, bold declarations about the future',
  inspirational: 'uplifting, warm, emotionally resonant, story-driven',
  business: 'professional, authoritative, value-focused, results-oriented',
  storytelling: 'narrative-driven, personal, relatable, with a clear arc',
  educational: 'informative, clear, structured, teaching-oriented',
  humorous: 'witty, light-hearted, entertaining, relatable',
  professional: 'formal, polished, credible, expert-positioning',
};

export const SYSTEM_PROMPT =
  'You are an expert social media content strategist and copywriter for creators and brands. You write viral, engaging content that drives real results. Be concise, impactful, and authentic.';
