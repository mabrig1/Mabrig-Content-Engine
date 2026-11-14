'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { buildCampaignVariants, CAMPAIGN_CHANNELS, CHANNEL_LABELS } from '@/lib/campaign-planner';
import type { CampaignBrief, CampaignChannel, CampaignGoal, CampaignVariant } from '@/lib/campaign-planner';

const DEFAULT_BRIEF: CampaignBrief = {
  name: '', topic: '', audience: '', message: '', destination: '',
  goal: 'awareness', tone: 'inspirational',
  channels: ['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE'],
};

export default function CampaignStudioPage() {
  const [brief, setBrief] = useState<CampaignBrief>(DEFAULT_BRIEF);
  const [variants, setVariants] = useState<CampaignVariant[]>([]);
  const [saving, setSaving] = useState(false);
  const [refining, setRefining] = useState<CampaignChannel | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  const change = (field: keyof CampaignBrief, value: string) => {
    setBrief((previous) => ({ ...previous, [field]: value }));
    setSavedCount(0);
  };

  const toggleChannel = (platform: CampaignChannel) => {
    setBrief((previous) => ({
      ...previous,
      channels: previous.channels.includes(platform)
        ? previous.channels.filter((channel) => channel !== platform)
        : [...previous.channels, platform],
    }));
    setSavedCount(0);
  };

  const createPlan = () => {
    if (!brief.name.trim() || !brief.topic.trim() || !brief.message.trim()) {
      toast.error('Add a campaign name, topic and key message');
      return;
    }
    if (!brief.channels.length) {
      toast.error('Choose at least one channel');
      return;
    }
    setVariants(buildCampaignVariants(brief));
    setSavedCount(0);
    toast.success('Editable channel drafts prepared');
  };

  const updateVariant = (platform: CampaignChannel, content: string) =>
    setVariants((previous) => previous.map((v) => v.platform === platform ? { ...v, content } : v));

  const refineWithAI = async (variant: CampaignVariant) => {
    setRefining(variant.platform);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: variant.platform === 'TIKTOK' || variant.platform === 'YOUTUBE' ? 'VIDEO_SCRIPT' : 'CAPTION',
          topic: brief.topic + ' for ' + (brief.audience || 'a general audience'),
          tone: brief.tone,
          platform: variant.platform,
          extraContext: ('Key message: ' + brief.message + '. Call to action: ' +
            (brief.goal === 'sales' ? 'explore the offer' : 'engage with the post') +
            '. Use only verifiable claims. ' + (brief.destination || '')).slice(0, 500),
          model: 'openai',
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || 'AI generation unavailable');
      updateVariant(variant.platform, body.data.content);
      setSavedCount(0);
      toast.success('AI draft ready to review');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to refine content');
    } finally {
      setRefining(null);
    }
  };

  const saveDrafts = async () => {
    if (variants.some((variant) => variant.content.trim().length < 10)) {
      toast.error('Each draft needs at least 10 characters');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brief.name,
          variants: variants.map(({ platform, content }) => ({ platform, content })),
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || 'Could not save');
      setSavedCount(body.data.count);
      toast.success(String(body.data.count) + ' campaign drafts saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">MABRIG Creator Operations</p>
        <h1 className="text-2xl font-bold text-white mt-1">Campaign Studio</h1>
        <p className="text-sm text-gray-400 mt-2">
          Turn one idea into editable scripts, captions and community posts. Start with working templates;
          optionally refine with AI, then save as drafts for review.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 card p-5 space-y-4">
          <h2 className="font-semibold text-white">1. Creative brief</h2>
          <label className="block text-sm text-gray-300">
            Campaign name
            <input className="input mt-1" maxLength={100} placeholder="e.g. BuildRx beginner launch"
              value={brief.name} onChange={(e) => change('name', e.target.value)} />
          </label>
          <label className="block text-sm text-gray-300">
            Core topic
            <input className="input mt-1" maxLength={250} placeholder="What are you announcing or teaching?"
              value={brief.topic} onChange={(e) => change('topic', e.target.value)} />
          </label>
          <label className="block text-sm text-gray-300">
            Audience
            <input className="input mt-1" maxLength={150} placeholder="e.g. Nigerian students or business owners"
              value={brief.audience} onChange={(e) => change('audience', e.target.value)} />
          </label>
          <label className="block text-sm text-gray-300">
            Key message / promise
            <textarea className="input mt-1 resize-y" rows={4} maxLength={1000}
              placeholder="State the key fact or real benefit. Avoid unverified promises."
              value={brief.message} onChange={(e) => change('message', e.target.value)} />
          </label>
          <label className="block text-sm text-gray-300">
            Destination link (optional)
            <input className="input mt-1" maxLength={250} placeholder="https://..."
              value={brief.destination} onChange={(e) => change('destination', e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-gray-300">
              Goal
              <select className="input mt-1" value={brief.goal}
                onChange={(e) => change('goal', e.target.value as CampaignGoal)}>
                <option value="awareness">Awareness</option>
                <option value="community">Engagement</option>
                <option value="leads">Lead generation</option>
                <option value="sales">Sales</option>
              </select>
            </label>
            <label className="text-sm text-gray-300">
              Voice
              <select className="input mt-1" value={brief.tone}
                onChange={(e) => change('tone', e.target.value)}>
                <option value="inspirational">Inspirational</option>
                <option value="motivational">Motivational</option>
                <option value="prophetic">Faith / prophetic</option>
                <option value="business">Business</option>
                <option value="storytelling">Storytelling</option>
                <option value="educational">Educational</option>
                <option value="professional">Professional</option>
              </select>
            </label>
          </div>
          <div>
            <p className="text-sm text-gray-300 mb-2">Channels</p>
            <div className="grid grid-cols-2 gap-2">
              {CAMPAIGN_CHANNELS.map((platform) => (
                <label key={platform} className="flex items-center gap-2 text-xs text-gray-300 rounded-lg bg-surface-200 p-2 cursor-pointer">
                  <input type="checkbox" checked={brief.channels.includes(platform)}
                    onChange={() => toggleChannel(platform)} className="accent-indigo-500" />
                  {CHANNEL_LABELS[platform]}
                </label>
              ))}
            </div>
          </div>
          <button type="button" className="btn-primary w-full justify-center py-3" onClick={createPlan}>
            Build platform drafts
          </button>
          <p className="text-xs text-gray-500">
            Drafting does not publish to a social network. AI refinement requires a configured provider key.
          </p>
        </div>

        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-white">2. Edit and save</h2>
              <p className="text-xs text-gray-400">{variants.length} platform drafts</p>
            </div>
            {variants.length > 0 && (
              <button type="button" className="btn-primary disabled:opacity-50"
                disabled={saving || savedCount > 0} onClick={saveDrafts}>
                {saving ? 'Saving…' : savedCount ? 'Drafts saved' : 'Save all as drafts'}
              </button>
            )}
          </div>
          {savedCount > 0 && (
            <div role="status" className="card p-4 text-sm text-emerald-300">
              Saved {savedCount} editable drafts to your workspace. They were not scheduled or published.
              <Link href="/dashboard" className="ml-2 underline">View recent posts</Link>
            </div>
          )}
          {!variants.length && (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">🎬</div>
              <h3 className="text-white font-semibold">One brief, many formats</h3>
              <p className="text-sm text-gray-400 mt-2">
                Build a campaign to see videos, social captions, professional posts and community updates here.
              </p>
            </div>
          )}
          {variants.map((variant) => (
            <div className="card p-5 space-y-3" key={variant.platform}>
              <div className="flex justify-between gap-2 items-start">
                <div>
                  <h3 className="text-white font-semibold">{CHANNEL_LABELS[variant.platform]}</h3>
                  <p className="text-xs text-gray-500">{variant.format} · {variant.content.length} characters</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button type="button" className="btn-secondary text-xs"
                    onClick={() => { navigator.clipboard.writeText(variant.content); toast.success('Copied'); }}>
                    Copy
                  </button>
                  <button type="button" className="btn-secondary text-xs disabled:opacity-50"
                    disabled={refining !== null} onClick={() => refineWithAI(variant)}>
                    {refining === variant.platform ? 'Refining…' : 'Refine with AI'}
                  </button>
                </div>
              </div>
              <textarea className="input min-h-[170px] resize-y leading-relaxed" aria-label={'Edit ' + CHANNEL_LABELS[variant.platform]}
                value={variant.content} onChange={(e) => { updateVariant(variant.platform, e.target.value); setSavedCount(0); }} />
              {variant.platform === 'TWITTER' && variant.content.length > 280 && (
                <p className="text-amber-400 text-xs">X post exceeds 280 characters. Shorten before posting.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
