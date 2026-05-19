'use client';

import { Bell, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import type { User, Workspace } from '@/types';

interface TopBarProps {
  user: User;
  workspace: Workspace | null;
}

export default function TopBar({ user, workspace }: TopBarProps) {
  return (
    <header className="h-14 border-b border-white/5 bg-surface-50/50 backdrop-blur-sm flex items-center px-6 gap-4 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search posts, contacts, media..."
            className="w-full bg-surface-200 border border-white/8 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* New Post button */}
        <Link
          href="/dashboard/compose"
          className="btn-primary text-xs px-3 py-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          New Post
        </Link>

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
          <Bell className="w-4 h-4 text-gray-400" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-brand-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-brand-600/30 flex items-center justify-center text-xs font-bold text-brand-400">
          {user.name?.[0] || user.email[0]}
        </div>
      </div>
    </header>
  );
}
