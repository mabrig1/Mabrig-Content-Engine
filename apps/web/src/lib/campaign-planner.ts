export const CAMPAIGN_CHANNELS = [
  'FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'LINKEDIN',
  'TWITTER', 'THREADS', 'PINTEREST', 'TELEGRAM',
] as const;

export type CampaignChannel = (typeof CAMPAIGN_CHANNELS)[number];

export type CampaignGoal = 'awareness' | 'community' | 'leads' | 'sales';

export interface CampaignBrief {
  name: string;
  topic: string;
  audience: string;
  message: string;
  destination: string;
  goal: CampaignGoal;
  tone: string;
  channels: CampaignChannel[];
}

export interface CampaignVariant {
  platform: CampaignChannel;
  format: string;
  content: string;
}

export const CHANNEL_LABELS: Record<CampaignChannel, string> = {
  FACEBOOK: 'Facebook post',
  INSTAGRAM: 'Instagram Reel / carousel',
  TIKTOK: 'TikTok short video',
  YOUTUBE: 'YouTube Short',
  LINKEDIN: 'LinkedIn insight',
  TWITTER: 'X post',
  THREADS: 'Threads conversation',
  PINTEREST: 'Pinterest idea pin',
  TELEGRAM: 'Telegram community post',
};

const TAGS: Record<CampaignGoal, string> = {
  awareness: '#LearnSomethingNew #MabrigTechnologies',
  community: '#JoinTheConversation #MabrigCommunity',
  leads: '#LearnMore #MabrigTechnologies',
  sales: '#DigitalSolutions #MabrigTechnologies',
};

function invitation(brief: CampaignBrief): string {
  const url = brief.destination.trim();
  const action: Record<CampaignGoal, string> = {
    awareness: 'Share this with someone who would benefit.',
    community: 'Tell us your experience in the comments.',
    leads: 'Send us a message to learn the next step.',
    sales: 'Explore how this can help you today.',
  };
  return action[brief.goal] + (url ? '\n' + url : '');
}

export function buildCampaignVariants(brief: CampaignBrief): CampaignVariant[] {
  const topic = brief.topic.trim();
  const audience = brief.audience.trim() || 'our community';
  const message = brief.message.trim() || 'Here is one practical idea worth exploring.';
  const cta = invitation(brief);
  const hashtags = TAGS[brief.goal];

  const copies: Record<CampaignChannel, { format: string; content: string }> = {
    FACEBOOK: {
      format: 'Story + discussion',
      content: topic + '\n\nImagine what could change for ' + audience + ' if we approached this differently.\n\n' +
        message + '\n\nWhat would you add from your own experience?\n\n' + cta + '\n' + hashtags,
    },
    INSTAGRAM: {
      format: 'Reel voiceover + caption',
      content: '[ON-SCREEN HOOK] ' + topic + '\n[VOICEOVER] Here is something ' + audience +
        ' should consider: ' + message + '\n[VISUAL] Show a relevant example or demonstration.\n[END SCREEN] ' +
        cta + '\n\nCaption: Save this idea for later.\n' + hashtags,
    },
    TIKTOK: {
      format: '30-second short script',
      content: '[0-3s HOOK] ' + topic + '\n[3-20s VALUE] ' + message +
        '\n[20-26s SHOW] Demonstrate one useful, verifiable example for ' + audience +
        '.\n[26-30s CTA] ' + cta + '\n\n[CAPTION] ' + hashtags,
    },
    YOUTUBE: {
      format: 'YouTube Short script',
      content: 'TITLE: ' + topic + '\n[0-5s] Why should ' + audience + ' pay attention to this?\n' +
        '[5-40s] ' + message + '\n[40-50s] Illustrate this with a real example.\n' +
        '[50-60s] ' + cta + '\nDESCRIPTION: ' + hashtags,
    },
    LINKEDIN: {
      format: 'Professional insight',
      content: topic + '\n\nFor ' + audience + ', the bigger question is how to turn an idea into action.\n\n' +
        message + '\n\nPractical next step: identify one measurable improvement, test it, and review the result.\n\n' +
        cta + '\n' + hashtags,
    },
    TWITTER: {
      format: 'Concise X post',
      content: (topic + '\n\n' + message).slice(0, 205) + '\n\n' +
        (brief.goal === 'community' ? 'What do you think?' : 'Thoughts?') +
        (brief.destination ? '\n' + brief.destination.trim().slice(0, 45) : ''),
    },
    THREADS: {
      format: 'Conversation starter',
      content: 'An idea for ' + audience + ':\n\n' + topic + '\n\n' + message +
        '\n\nI would love to hear your perspective. ' + cta,
    },
    PINTEREST: {
      format: 'Idea pin outline',
      content: 'PIN TITLE: ' + topic + '\nPANEL 1: The challenge for ' + audience +
        '\nPANEL 2: ' + message + '\nPANEL 3: Show one simple step or visual example.\n' +
        'DESCRIPTION: ' + cta + '\n' + hashtags,
    },
    TELEGRAM: {
      format: 'Community update',
      content: 'Hello community! 👋\n\nToday we are discussing: ' + topic + '\n\n' +
        message + '\n\nYour action for today: share one practical takeaway.\n\n' + cta,
    },
  };

  return [...new Set(brief.channels)]
    .filter((channel): channel is CampaignChannel => CAMPAIGN_CHANNELS.includes(channel))
    .map((platform) => ({ platform, ...copies[platform] }));
}
