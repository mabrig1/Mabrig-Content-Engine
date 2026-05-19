'use client';

import { formatNumber, getPlatformColor, getPlatformLabel } from '@/lib/utils';
import { BarChart3, Users, Calendar, TrendingUp, Zap, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { DashboardStats } from '@/types';

interface DashboardClientProps {
  stats: DashboardStats;
  recentPosts: any[];
  connectedAccounts: any[];
  userName: string;
}

const statCards = [
  {
    label: 'Total Posts',
    key: 'totalPosts' as keyof DashboardStats,
    icon: BarChart3,
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
    suffix: '',
  },
  {
    label: 'Scheduled',
    key: 'scheduledPosts' as keyof DashboardStats,
    icon: Calendar,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    suffix: '',
  },
  {
    label: 'Published',
    key: 'publishedPosts' as keyof DashboardStats,
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    suffix: '',
  },
  {
    label: 'Contacts',
    key: 'totalContacts' as keyof DashboardStats,
    icon: Users,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    suffix: '',
  },
];

const quickActions = [
  { label: 'Create Post', href: '/dashboard/compose', icon: Plus, desc: 'Write & schedule content' },
  { label: 'View Calendar', href: '/dashboard/calendar', icon: Calendar, desc: 'Manage your schedule' },
  { label: 'AI Generate', href: '/dashboard/compose?ai=true', icon: Zap, desc: 'Generate with AI' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, desc: 'View performance' },
];

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; class: string }> = {
    DRAFT: { label: 'Draft', class: 'bg-gray-500/20 text-gray-300' },
    SCHEDULED: { label: 'Scheduled', class: 'bg-purple-500/20 text-purple-300' },
    PUBLISHED: { label: 'Published', class: 'bg-emerald-500/20 text-emerald-300' },
    FAILED: { label: 'Failed', class: 'bg-red-500/20 text-red-300' },
  };
  const s = map[status] || { label: status, class: 'bg-gray-500/20 text-gray-300' };
  return <span className={`badge ${s.class}`}>{s.label}</span>;
}

export default function DashboardClient({
  stats,
  recentPosts,
  connectedAccounts,
  userName,
}: DashboardClientProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, {userName.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Here&apos;s what&apos;s happening with your content today.
          </p>
        </div>
        <Link href="/dashboard/compose" className="btn-primary">
          <Plus className="w-4 h-4" />
          Create Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.key} className="stat-card card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">{card.label}</span>
              <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">
              {formatNumber(stats[card.key] as number)}
              {card.suffix}
            </div>
            <div className="text-xs text-gray-500">All time</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Posts</h2>
            <Link href="/dashboard/compose" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-surface-300 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm">No posts yet</p>
              <p className="text-gray-500 text-xs mt-1">Create your first post to get started</p>
              <Link href="/dashboard/compose" className="btn-primary mt-4 inline-flex">
                <Plus className="w-4 h-4" />
                Create Post
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface-200/50 hover:bg-surface-200 transition-colors">
                  <div className="w-10 h-10 bg-brand-600/20 rounded-lg flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {post.content.slice(0, 80)}{post.content.length > 80 ? '...' : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(post.status)}
                      {post.socialAccounts.slice(0, 3).map((psa: any) => (
                        <span
                          key={psa.id}
                          className="text-xs text-gray-500"
                          style={{ color: getPlatformColor(psa.socialAccount.platform) }}
                        >
                          {getPlatformLabel(psa.socialAccount.platform)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="card p-5">
            <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-200 transition-colors group"
                >
                  <div className="w-8 h-8 bg-brand-600/20 rounded-lg flex items-center justify-center shrink-0">
                    <action.icon className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-brand-300">{action.label}</div>
                    <div className="text-xs text-gray-500">{action.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Connected Accounts</h2>
              <Link href="/dashboard/settings" className="text-xs text-brand-400 hover:text-brand-300">
                Manage
              </Link>
            </div>

            {connectedAccounts.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm">No accounts connected</p>
                <Link href="/dashboard/settings" className="btn-secondary mt-3 text-xs px-3 py-1.5">
                  Connect Account
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {connectedAccounts.map((account) => (
                  <div key={account.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: getPlatformColor(account.platform) }}
                    >
                      {account.platform[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white truncate">{account.accountName}</div>
                      <div className="text-xs text-gray-500">{getPlatformLabel(account.platform)}</div>
                    </div>
                    <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
