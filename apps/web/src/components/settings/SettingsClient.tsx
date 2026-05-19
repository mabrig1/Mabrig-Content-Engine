'use client';

import { useState } from 'react';
import { getPlatformColor, getPlatformLabel } from '@/lib/utils';
import { Settings, Link, Shield, Bell, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

const PLATFORMS = [
  { id: 'FACEBOOK', name: 'Facebook', emoji: '📘' },
  { id: 'INSTAGRAM', name: 'Instagram', emoji: '📸' },
  { id: 'TWITTER', name: 'X (Twitter)', emoji: '🐦' },
  { id: 'LINKEDIN', name: 'LinkedIn', emoji: '💼' },
  { id: 'TIKTOK', name: 'TikTok', emoji: '🎵' },
  { id: 'YOUTUBE', name: 'YouTube', emoji: '▶️' },
  { id: 'PINTEREST', name: 'Pinterest', emoji: '📌' },
  { id: 'THREADS', name: 'Threads', emoji: '🧵' },
  { id: 'TELEGRAM', name: 'Telegram', emoji: '✈️' },
];

const tabs = [
  { id: 'accounts', label: 'Social Accounts', icon: Link },
  { id: 'profile', label: 'Profile', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function SettingsClient({ user, workspace, socialAccounts }: any) {
  const [activeTab, setActiveTab] = useState('accounts');

  function handleConnect(platform: string) {
    toast.success(`Connecting to ${getPlatformLabel(platform)}... (OAuth flow coming soon)`);
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account, connections, and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Tab sidebar */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-brand-600/20 text-brand-300 border border-brand-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'accounts' && (
            <div className="card p-6">
              <h2 className="font-semibold text-white mb-1">Social Media Accounts</h2>
              <p className="text-sm text-gray-400 mb-5">Connect your social profiles to start publishing content</p>

              {/* Connected accounts */}
              {socialAccounts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Connected</h3>
                  <div className="space-y-2">
                    {socialAccounts.map((account: any) => (
                      <div key={account.id} className="flex items-center gap-3 p-3 bg-surface-200 rounded-lg">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ backgroundColor: getPlatformColor(account.platform) }}
                        >
                          {account.platform[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white">{account.accountName}</div>
                          <div className="text-xs text-gray-500">{getPlatformLabel(account.platform)}</div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available platforms */}
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Connect Platform</h3>
              <div className="grid grid-cols-1 gap-2">
                {PLATFORMS.map((platform) => {
                  const connected = socialAccounts.some((a: any) => a.platform === platform.id);
                  return (
                    <div key={platform.id} className="flex items-center gap-3 p-3 bg-surface-200/50 rounded-lg hover:bg-surface-200 transition-colors">
                      <span className="text-xl w-8 text-center">{platform.emoji}</span>
                      <span className="text-sm text-white flex-1">{platform.name}</span>
                      {connected ? (
                        <span className="text-xs text-emerald-400 font-medium">Connected</span>
                      ) : (
                        <button
                          onClick={() => handleConnect(platform.id)}
                          className="text-xs btn-secondary px-3 py-1"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="card p-6">
              <h2 className="font-semibold text-white mb-5">Profile Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                  <input className="input" defaultValue={user?.name || ''} placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                  <input className="input" defaultValue={user?.email || ''} type="email" disabled />
                </div>
                <button className="btn-primary" onClick={() => toast.success('Profile saved!')}>
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {(activeTab === 'security' || activeTab === 'notifications') && (
            <div className="card p-6 text-center">
              <div className="text-4xl mb-4">🚧</div>
              <h2 className="text-lg font-bold text-white mb-2">Coming Soon</h2>
              <p className="text-gray-400 text-sm">This section is under development.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
