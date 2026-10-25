/**
 * Review-first campaign kit adapted from the owner's Content Engine, GospelVision,
 * VidMint, Author CRM, portfolio and AI Video workflows.
 * This module deliberately performs no external calls, generation or publishing.
 */
export type StudioPillar = 'faith' | 'music' | 'books' | 'digital';
export type StudioPlatform = 'instagram' | 'tiktok' | 'youtube' | 'facebook';

export interface StudioBrief {
  pillar: StudioPillar;
  title: string;
  message: string;
  scripture?: string;
  cta: string;
}

export interface StudioPack {
  hook: string;
  script: string;
  caption: string;
  hashtags: string[];
  thumbnail: string;
  productionBrief: string;
  communityPrompt: string;
  publishingChecklist: string[];
  variants: Record<StudioPlatform, { format: string; content: string }>;
}

export const studioPillars: Record<StudioPillar, { label: string; example: string; hashtags: string[]; tone: string }> = {
  faith: {
    label: 'Faith & motivation',
    example: 'Faith moves before conditions become perfect',
    hashtags: ['#MabrigKorie', '#FaithInAction', '#ChristianMotivation', '#PurposeDriven'],
    tone: 'warm prophetic encouragement without invented promises',
  },
  music: {
    label: 'Gospel music',
    example: 'We Are Able - new gospel release',
    hashtags: ['#MabrigKorie', '#GospelMusic', '#AfroGospel', '#WorshipMusic'],
    tone: 'energetic Afro-gospel music campaign with artist-approved assets',
  },
  books: {
    label: 'Books & authorship',
    example: 'A new chapter on resilience and purpose',
    hashtags: ['#MabrigKorie', '#ChristianAuthor', '#BooksThatInspire', '#ReadToGrow'],
    tone: 'story-led book discovery with verified product links',
  },
  digital: {
    label: 'Digital skills & apps',
    example: 'Learn practical digital skills through real projects',
    hashtags: ['#MabrigKorie', '#DigitalSkills', '#LearnToBuild', '#AfricanInnovation'],
    tone: 'clear educational value, accurate product claims, and a demonstrable next step',
  },
};

const safe = (value: string, fallback: string, max: number) =>
  (value || '').trim().slice(0, max) || fallback;

export function createStudioPack(brief: StudioBrief): StudioPack {
  const config = studioPillars[brief.pillar] || studioPillars.faith;
  const title = safe(brief.title, config.example, 140);
  const message = safe(brief.message, 'A meaningful next step begins today.', 500);
  const cta = safe(brief.cta, 'Share your next step in the comments.', 180);
  const scripture = safe(brief.scripture || '', '', 100);
  const hook = brief.pillar === 'music'
    ? 'This is more than a song. Here is the story behind ' + title + '.'
    : brief.pillar === 'books'
      ? 'What if one chapter could change how you see ' + title + '?'
      : brief.pillar === 'digital'
        ? 'You do not need to know everything to begin building.'
        : 'Your current circumstances do not have to define your next chapter.';

  const script = [
    '[HOOK 0-5s] ' + hook,
    '[STORY 5-15s] ' + title + '. ' + message,
    scripture ? '[FAITH ANCHOR 15-22s] Reflect on ' + scripture + '. Explain its context accurately before quoting.' : '[VALUE 15-22s] Give one practical example your audience can act on today.',
    '[ACTION 22-32s] ' + cta,
    '[OUTRO] Mabrig Korie - Faith. Knowledge. Transformation.',
  ].join('\n');

  const caption = hook + '\n\n' + message + (scripture ? '\n\nScripture to reflect on: ' + scripture : '') + '\n\n' + cta;
  const communityPrompt = 'What is one action you will take after hearing "' + title + '"?';
  const productionBrief = [
    '9:16 vertical master, 1080x1920 recommended; subtitles inside safe area.',
    'Scene 1: close-up artist/presenter delivering the hook.',
    'Scene 2: original or licensed cutaways illustrating "' + title + '".',
    'Scene 3: direct-to-camera practical message, steady eye contact.',
    'Scene 4: branded call to action, legible title, clear end card.',
    'Voice: owner-authorized narration; music: owned or properly licensed.',
    'VidMint/GospelVision are separate tools; this pack is a shot list, not rendered video.',
  ].join('\n');
  const publishingChecklist = [
    'Check scripture context and factual accuracy; do not invent quotes or testimonials.',
    'Confirm music, clips, images, likeness and signature voice rights/consent.',
    'Inspect legibility, captions, audio levels, and vertical safe zones on a phone.',
    'Confirm destination links and platform-specific policies.',
    'Obtain explicit final approval before scheduling or publishing.',
  ];

  return {
    hook, script, caption, hashtags: config.hashtags,
    thumbnail: 'Bold portrait, authentic Mabrig Korie likeness only with owner-provided reference; title: "' + title + '"; high contrast, legible mobile typography.',
    productionBrief, communityPrompt, publishingChecklist,
    variants: {
      instagram: { format: 'Reel 9:16, 30-45 seconds', content: caption + '\n\n' + config.hashtags.join(' ') },
      tiktok: { format: 'Short 9:16, 25-40 seconds', content: hook + '\n' + message + '\n' + cta + '\n' + config.hashtags.slice(0, 3).join(' ') },
      youtube: { format: 'Short 9:16, 30-60 seconds', content: title + '\n\n' + message + '\n\n' + cta + '\n#Shorts ' + config.hashtags[0] },
      facebook: { format: 'Reel or feed video, 30-60 seconds', content: caption + '\n\n' + communityPrompt },
    },
  };
}
