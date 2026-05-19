export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  status: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

export interface Session {
  user: User;
  workspace: Workspace | null;
}

export interface SocialAccount {
  id: string;
  platform: string;
  accountName: string;
  username: string | null;
  avatar: string | null;
  isActive: boolean;
}

export interface Post {
  id: string;
  title: string | null;
  content: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  socialAccounts: PostSocialAccount[];
  mediaItems: PostMedia[];
  tags: PostTag[];
  analytics: PostAnalytics | null;
}

export interface PostSocialAccount {
  id: string;
  socialAccountId: string;
  status: string;
  socialAccount: SocialAccount;
}

export interface PostMedia {
  id: string;
  order: number;
  media: MediaItem;
}

export interface PostTag {
  tag: Tag;
}

export interface PostAnalytics {
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
}

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl: string | null;
  type: string;
  width: number | null;
  height: number | null;
  duration: number | null;
  altText: string | null;
  caption: string | null;
  createdAt: string;
}

export interface Contact {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  type: string;
  status: string;
  leadScore: number;
  notes: string | null;
  createdAt: string;
  tags: ContactTagItem[];
}

export interface ContactTagItem {
  tag: Tag;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface DashboardStats {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  totalContacts: number;
  totalImpressions: number;
  engagementRate: number;
  connectedAccounts: number;
}

export interface Automation {
  id: string;
  name: string;
  description: string | null;
  trigger: string;
  isActive: boolean;
  lastRunAt: string | null;
  runCount: number;
  createdAt: string;
}
