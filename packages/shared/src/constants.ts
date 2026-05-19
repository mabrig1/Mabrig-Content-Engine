export const PLATFORMS = [
  { id: 'FACEBOOK', name: 'Facebook', color: '#1877F2', icon: 'facebook' },
  { id: 'INSTAGRAM', name: 'Instagram', color: '#E1306C', icon: 'instagram' },
  { id: 'TWITTER', name: 'X (Twitter)', color: '#000000', icon: 'twitter' },
  { id: 'LINKEDIN', name: 'LinkedIn', color: '#0A66C2', icon: 'linkedin' },
  { id: 'TIKTOK', name: 'TikTok', color: '#FF0050', icon: 'tiktok' },
  { id: 'YOUTUBE', name: 'YouTube', color: '#FF0000', icon: 'youtube' },
  { id: 'PINTEREST', name: 'Pinterest', color: '#E60023', icon: 'pinterest' },
  { id: 'THREADS', name: 'Threads', color: '#000000', icon: 'threads' },
  { id: 'TELEGRAM', name: 'Telegram', color: '#2CA5E0', icon: 'telegram' },
] as const;

export const AI_TONES = [
  { id: 'motivational', label: 'Motivational', emoji: '🔥' },
  { id: 'prophetic', label: 'Prophetic', emoji: '✨' },
  { id: 'inspirational', label: 'Inspirational', emoji: '💫' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'storytelling', label: 'Storytelling', emoji: '📖' },
  { id: 'educational', label: 'Educational', emoji: '🎓' },
  { id: 'humorous', label: 'Humorous', emoji: '😄' },
  { id: 'professional', label: 'Professional', emoji: '🎯' },
] as const;

export const POST_STATUSES = {
  DRAFT: { label: 'Draft', color: 'gray' },
  PENDING_APPROVAL: { label: 'Pending Approval', color: 'yellow' },
  APPROVED: { label: 'Approved', color: 'blue' },
  SCHEDULED: { label: 'Scheduled', color: 'purple' },
  PUBLISHING: { label: 'Publishing...', color: 'indigo' },
  PUBLISHED: { label: 'Published', color: 'green' },
  FAILED: { label: 'Failed', color: 'red' },
  ARCHIVED: { label: 'Archived', color: 'gray' },
} as const;

export const MAX_CONTENT_LENGTH = {
  TWITTER: 280,
  LINKEDIN: 3000,
  INSTAGRAM: 2200,
  FACEBOOK: 63206,
  TIKTOK: 2200,
  YOUTUBE: 5000,
  THREADS: 500,
  TELEGRAM: 4096,
} as const;
