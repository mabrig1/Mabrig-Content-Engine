'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Sparkles, Send, Clock, Save, X, Wand2, Copy, RefreshCw } from 'lucide-react';
import { cn, getPlatformColor, getPlatformLabel } from '@/lib/utils';
import type { SocialAccount } from '@/types';

const AI_TYPES = [
  { id: 'CAPTION', label: 'Caption', emoji: '✍️' },
  { id: 'HOOK', label: '5 Hooks', emoji: '🎣' },
  { id: 'HASHTAGS', label: 'Hashtags', emoji: '#️⃣' },
  { id: 'HEADLINE', label: '10 Headlines', emoji: '📰' },
  { id: 'THREAD', label: 'Thread', emoji: '🧵' },
  { id: 'CTA', label: '5 CTAs', emoji: '🎯' },
  { id: 'STORY', label: 'Story', emoji: '📖' },
  { id: 'VIDEO_SCRIPT', label: 'Video Script', emoji: '🎬' },
];

const TONES = [
  { id: 'motivational', label: '🔥 Motivational' },
  { id: 'inspirational', label: '💫 Inspirational' },
  { id: 'prophetic', label: '✨ Prophetic' },
  { id: 'business', label: '💼 Business' },
  { id: 'storytelling', label: '📖 Storytelling' },
  { id: 'educational', label: '🎓 Educational' },
  { id: 'humorous', label: '😄 Humorous' },
  { id: 'professional', label: '🎯 Professional' },
];

export default function ComposePage() {
  const searchParams = useSearchParams();
  const showAI = searchParams.get('ai') === 'true';

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [saving, setSaving] = useState(false);
  const [isEvergreen, setIsEvergreen] = useState(false);

  const [aiOpen, setAiOpen] = useState(showAI);
  const [aiTopic, setAiTopic] = useState('');
  const [aiType, setAiType] = useState('CAPTION');
  const [aiTone, setAiTone] = useState('inspirational');
  const [aiModel, setAiModel] = useState<'openai' | 'claude'>('openai');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  useEffect(() => {
    fetch('/api/social-accounts')
      .then((r) => r.json())
      .then((d) => { if (d.success) setAccounts(d.data); });
  }, []);

  function toggleAccount(id: string) {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  async function handleAIGenerate() {
    if (!aiTopic.trim()) { toast.error('Enter a topic first'); return; }
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: aiType, topic: aiTopic, tone: aiTone, model: aiModel }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data.data.content);
        toast.success(`Generated with ${data.data.model}`);
      } else {
        toast.error(data.error || 'Generation failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSave(status: 'DRAFT' | 'SCHEDULED') {
    if (!content.trim()) { toast.error('Write some content first'); return; }
    if (status === 'SCHEDULED' && !scheduledAt) { toast.error('Set a schedule date/time'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content, title,
          scheduledAt: scheduledAt || null,
          socialAccountIds: selectedAccounts,
          status,
          isEvergreen,
          aiGenerated: !!aiResult && content === aiResult,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(status === 'DRAFT' ? 'Draft saved!' : 'Post scheduled!');
        setContent(''); setTitle(''); setScheduledAt(''); setSelectedAccounts([]);
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  const charCount = content.length;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Compose</h1>
          <p className="text-gray-400 text-sm mt-1">Create and schedule content across all platforms</p>
        </div>
        <button
          onClick={() => setAiOpen(!aiOpen)}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all', aiOpen ? 'bg-brand-600 text-white' : 'btn-secondary')}
        >
          <Sparkles className="w-4 h-4" />
          AI Generator
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Composer */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card p-4">
            <input
              className="w-full bg-transparent border-0 text-lg font-semibold text-white placeholder-gray-600 focus:outline-none"
              placeholder="Post title (optional)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="card p-4">
            <textarea
              className="w-full bg-transparent border-0 text-white placeholder-gray-500 resize-none text-sm leading-relaxed focus:outline-none min-h-[200px]"
              placeholder="Write your content here, or use AI to generate it..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
            />
            <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
              <span className={cn('text-xs', charCount > 2000 ? 'text-amber-400' : 'text-gray-500')}>
                {charCount.toLocaleString()} characters
              </span>
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEvergreen}
                  onChange={(e) => setIsEvergreen(e.target.checked)}
                  className="w-3 h-3 rounded border-white/20 bg-surface-200 text-brand-500 focus:ring-brand-500"
                />
                Evergreen (auto-recycle)
              </label>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Post to accounts</h3>
            {accounts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No social accounts connected.</p>
                <a href="/dashboard/settings" className="text-xs text-brand-400 hover:text-brand-300 mt-1 inline-block">
                  Connect accounts in Settings →
                </a>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => toggleAccount(account.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                      selectedAccounts.includes(account.id)
                        ? 'border-brand-500 bg-brand-600/20 text-white'
                        : 'border-white/10 bg-surface-200 text-gray-400 hover:border-white/20'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getPlatformColor(account.platform) }} />
                    {account.accountName}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Schedule (optional)
            </h3>
            <input
              type="datetime-local"
              className="input"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => handleSave('DRAFT')} disabled={saving} className="btn-secondary disabled:opacity-50">
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button onClick={() => handleSave('SCHEDULED')} disabled={saving || !scheduledAt} className="btn-primary disabled:opacity-50">
              <Clock className="w-4 h-4" />
              {saving ? 'Saving...' : 'Schedule Post'}
            </button>
            {selectedAccounts.length > 0 && !scheduledAt && (
              <button
                disabled={saving}
                onClick={() => { toast.success('Publishing... (connect real OAuth to enable)'); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Publish Now
              </button>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          {aiOpen && (
            <div className="card p-5 space-y-4 animate-slide-in-right">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  AI Content Generator
                </h3>
                <button onClick={() => setAiOpen(false)} className="text-gray-500 hover:text-gray-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Topic / Subject</label>
                <textarea
                  className="input resize-none"
                  placeholder="e.g., 'Morning mindset for entrepreneurs' or 'Why most people fail at fitness'"
                  rows={3}
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Content Type</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {AI_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setAiType(type.id)}
                      className={cn(
                        'text-xs px-2 py-1.5 rounded-lg font-medium transition-all text-left border',
                        aiType === type.id
                          ? 'bg-brand-600/30 border-brand-500/40 text-brand-300'
                          : 'bg-surface-200 border-white/5 text-gray-400 hover:border-white/10'
                      )}
                    >
                      {type.emoji} {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Tone</label>
                <select className="input text-sm" value={aiTone} onChange={(e) => setAiTone(e.target.value)}>
                  {TONES.map((tone) => (
                    <option key={tone.id} value={tone.id}>{tone.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">AI Model</label>
                <div className="flex gap-2">
                  {(['openai', 'claude'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setAiModel(m)}
                      className={cn(
                        'flex-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-all border',
                        aiModel === m
                          ? 'bg-brand-600/30 border-brand-500/40 text-brand-300'
                          : 'bg-surface-200 border-white/5 text-gray-400 hover:border-white/10'
                      )}
                    >
                      {m === 'openai' ? '🧠 GPT-4o' : '⚡ Claude'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAIGenerate}
                disabled={aiLoading || !aiTopic.trim()}
                className="btn-primary w-full justify-center py-2.5 disabled:opacity-50 glow-brand"
              >
                {aiLoading ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="w-4 h-4" /> Generate Content</>
                )}
              </button>

              {aiResult && (
                <div className="bg-surface-200 border border-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-brand-400">Generated</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { navigator.clipboard.writeText(aiResult); toast.success('Copied!'); }}
                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                      <button onClick={handleAIGenerate} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Retry
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{aiResult}</p>
                  <button
                    onClick={() => { setContent(aiResult); toast.success('Added to composer!'); }}
                    className="btn-primary mt-3 text-xs px-3 py-1.5 w-full justify-center"
                  >
                    Use This Content
                  </button>
                </div>
              )}
            </div>
          )}

          {!aiOpen && (
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-3 text-sm">Platform Preview</h3>
              {content ? (
                <div className="space-y-3">
                  <div className="bg-black border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-white/10" />
                      <span className="text-xs text-gray-400">X (Twitter)</span>
                      <span className="ml-auto text-xs text-gray-500">{Math.min(charCount, 280)}/280</span>
                    </div>
                    <p className="text-sm text-white leading-relaxed">
                      {content.slice(0, 280)}{charCount > 280 ? '...' : ''}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                      <span className="text-xs text-gray-400">Instagram</span>
                    </div>
                    <p className="text-sm text-white leading-relaxed">
                      {content.slice(0, 125)}{charCount > 125 ? '... more' : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Start writing to see previews</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
