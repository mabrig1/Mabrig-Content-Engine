import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    FACEBOOK: '#1877F2',
    INSTAGRAM: '#E1306C',
    TWITTER: '#000000',
    LINKEDIN: '#0A66C2',
    TIKTOK: '#FF0050',
    YOUTUBE: '#FF0000',
    PINTEREST: '#E60023',
    THREADS: '#000000',
    TELEGRAM: '#2CA5E0',
  };
  return colors[platform] || '#6366f1';
}

export function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    FACEBOOK: 'Facebook',
    INSTAGRAM: 'Instagram',
    TWITTER: 'X (Twitter)',
    LINKEDIN: 'LinkedIn',
    TIKTOK: 'TikTok',
    YOUTUBE: 'YouTube',
    PINTEREST: 'Pinterest',
    THREADS: 'Threads',
    TELEGRAM: 'Telegram',
  };
  return labels[platform] || platform;
}
