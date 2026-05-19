'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { User, Workspace } from '@/types';
import {
  LayoutDashboard,
  PenSquare,
  Calendar,
  Image,
  BarChart3,
  Users,
  Zap,
  Settings,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  user: User;
  workspace: Workspace | null;
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/dashboard/compose', icon: PenSquare, label: 'Compose' },
  { href: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/dashboard/media', icon: Image, label: 'Media Library' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/crm', icon: Users, label: 'CRM' },
  { href: '/dashboard/automation', icon: Zap, label: 'Automation' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ user, workspace }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 h-full bg-surface-50 border-r border-white/5 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-gradient rounded-xl flex items-center justify-center shrink-0 glow-brand">
            <span className="text-white font-bold text-base">M</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white">MABRIG</div>
            <div className="text-xs text-gray-500">Content Engine</div>
          </div>
        </Link>
      </div>

      {/* Workspace selector */}
      {workspace && (
        <div className="px-3 py-3 border-b border-white/5">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group">
            <div className="w-7 h-7 bg-brand-600/30 rounded-lg flex items-center justify-center text-xs font-bold text-brand-400 shrink-0">
              {workspace.name[0]}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-xs font-medium text-white truncate">{workspace.name}</div>
              <div className="text-xs text-gray-500 capitalize">{workspace.plan.toLowerCase()} plan</div>
            </div>
            <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-gray-300 shrink-0" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                active ? 'sidebar-item-active' : 'sidebar-item'
              )}
            >
              <item.icon className={cn('w-4 h-4', active ? 'text-brand-400' : 'text-gray-500')} />
              <span>{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />}
            </Link>
          );
        })}
      </nav>

      {/* AI Assistant promo */}
      <div className="px-3 py-3 border-t border-white/5">
        <div className="bg-brand-600/10 border border-brand-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-semibold text-brand-300">AI Assistant</span>
          </div>
          <p className="text-xs text-gray-400 mb-2 leading-relaxed">
            Generate captions, hooks & viral content instantly.
          </p>
          <Link
            href="/dashboard/compose"
            className="text-xs text-brand-400 hover:text-brand-300 font-medium"
          >
            Try it now →
          </Link>
        </div>
      </div>

      {/* User */}
      <div className="px-3 py-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-brand-600/30 flex items-center justify-center text-xs font-bold text-brand-400 shrink-0">
            {user.name?.[0] || user.email[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-white truncate">{user.name || 'User'}</div>
            <div className="text-xs text-gray-500 truncate">{user.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
