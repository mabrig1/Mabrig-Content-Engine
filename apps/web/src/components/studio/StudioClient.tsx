'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Copy, CheckCircle2, Save, Sparkles, ExternalLink, Film, ShieldCheck } from 'lucide-react';
import { createStudioPack, studioPillars, type StudioBrief, type StudioPillar, type StudioPlatform } from '@/lib/studio';

const platforms: StudioPlatform[] = ['instagram', 'tiktok', 'youtube', 'facebook'];
const sources = [
  { title: 'GospelVision', use: 'Cinematic scene planning', url: 'https://github.com/mabrig1/gospelvision-agent' },
  { title: 'VidMint', use: 'Owner-controlled media production', url: 'https://github.com/mabrig1/VidMint' },
  { title: 'Author Growth CRM', use: 'Reader questions & conversion journeys', url: 'https://github.com/mabrig1/author-crm' },
  { title: 'AI Video', use: 'Review gates and publishing safeguards', url: 'https://github.com/mabrig1/aivideo' },
  { title: 'Portfolio Hub', use: 'Share and product discovery', url: 'https://github.com/mabrig1/MabrigKorie' },
];

export default function StudioClient() {
  const [brief, setBrief] = useState<StudioBrief>({
    pillar: 'faith',
    title: 'God does not need perfect conditions',
    message: 'Faith is demonstrated through practical action. Start with the next responsible step.',
    scripture: 'Genesis 12:1-4',
    cta: 'Comment I AM MOVING and share the first step you will take.',
  });
  const [platform, setPlatform] = useState<StudioPlatform>('instagram');
  const [generated, setGenerated] = useState('');
  const [busy, setBusy] = useState<'ai' | 'draft' | ''>('');
  const [notice, setNotice] = useState('');
  const kit = useMemo(() => createStudioPack(brief), [brief]);
  const chosenContent = generated || kit.variants[platform].content;

  const update = (key: keyof StudioBrief, value: string) => {
    setBrief((previous) => ({ ...previous, [key]: value }));
    setGenerated('');
    setNotice('');
  };
  const setPillar = (pillar: StudioPillar) => {
    setBrief((previous) => ({
      ...previous,
      pillar,
      title: studioPillars[pillar].example,
      message: '',
      scripture: pillar === 'faith' ? 'Genesis 12:1-4' : '',
    }));
    setGenerated('');
    setNotice('');
  };
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice('Copied to clipboard.');
    } catch {
      setNotice('Clipboard unavailable; select the text manually.');
    }
  }
  async function generateAI() {
    setBusy('ai');
    setNotice('');
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CAPTION', topic: brief.title,
          tone: brief.pillar === 'digital' ? 'educational' : brief.pillar === 'faith' ? 'inspirational' : 'storytelling',
          platform: platform.toUpperCase(), model: 'openai',
          extraContext: [brief.message, brief.scripture ? 'Reference: ' + brief.scripture : '', 'CTA: ' + brief.cta].filter(Boolean).join('. ').slice(0, 500),
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success || !payload.data?.content) {
        throw new Error(payload.error || 'Generation failed. Configure an authorized AI provider.');
      }
      setGenerated(payload.data.content);
      setNotice('AI caption ready for human review. No post has been sent.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'AI generation unavailable.');
    } finally {
      setBusy('');
    }
  }
  async function saveDraft() {
    if (!chosenContent.trim()) return;
    setBusy('draft');
    setNotice('');
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: brief.title.slice(0, 200),
          content: chosenContent.slice(0, 10000),
          status: 'DRAFT',
          socialAccountIds: [],
          mediaIds: [],
          tagIds: [],
          isEvergreen: false,
          aiGenerated: Boolean(generated),
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Could not save draft.');
      setNotice('Saved as a private draft. No accounts selected; nothing scheduled or published.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Draft save failed.');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-brand-400">Faith • Knowledge • Transformation</p>
        <h1 className="text-3xl font-bold text-white">MABRIG AI Content Studio</h1>
        <p className="text-sm text-gray-400">Build campaign kits from your own project playbooks. Human approval remains mandatory before distribution.</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-emerald-500/10 text-emerald-300 px-3 py-1">Creative planner ready</span>
          <span className="rounded-full bg-amber-500/10 text-amber-300 px-3 py-1">Video production in separate tools</span>
          <span className="rounded-full bg-brand-500/10 text-brand-300 px-3 py-1">Review-first • No autopublish</span>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <section className="xl:col-span-2 card p-5 space-y-4">
          <h2 className="font-semibold text-white">1. Creative brief</h2>
          <fieldset>
            <legend className="text-xs text-gray-400 mb-2">Campaign department</legend>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(studioPillars) as StudioPillar[]).map((pillar) => (
                <button key={pillar} type="button" onClick={() => setPillar(pillar)}
                  aria-pressed={brief.pillar === pillar}
                  className={'text-left text-xs p-3 border rounded-lg transition ' + (brief.pillar === pillar ? 'bg-brand-600/20 border-brand-500 text-white' : 'bg-surface-200 border-white/10 text-gray-400 hover:text-white')}>
                  {studioPillars[pillar].label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block text-xs text-gray-300">Title / campaign
            <input className="input mt-2" maxLength={140} value={brief.title}
              onChange={(event) => update('title', event.target.value)} />
          </label>
          <label className="block text-xs text-gray-300">Key message
            <textarea className="input resize-y mt-2" rows={4} maxLength={500} value={brief.message}
              placeholder="The real story, product value, or practical lesson"
              onChange={(event) => update('message', event.target.value)} />
          </label>
          <label className="block text-xs text-gray-300">Scripture reference (optional; verify context)
            <input className="input mt-2" maxLength={100} value={brief.scripture || ''}
              onChange={(event) => update('scripture', event.target.value)} />
          </label>
          <label className="block text-xs text-gray-300">Call to action
            <input className="input mt-2" maxLength={180} value={brief.cta}
              onChange={(event) => update('cta', event.target.value)} />
          </label>
          <p className="text-xs text-gray-500">Campaign previews are editable planning templates, not claims about completed video or scheduled publication.</p>
        </section>

        <section className="xl:col-span-3 space-y-4">
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-white">2. Platform campaign pack</h2>
            <div className="flex flex-wrap gap-2">
              {platforms.map((item) => (
                <button key={item} type="button" aria-pressed={platform === item}
                  className={'rounded-full px-4 py-2 text-xs font-semibold capitalize ' + (platform === item ? 'bg-brand-600 text-white' : 'bg-surface-200 text-gray-400 hover:text-white')}
                  onClick={() => { setPlatform(item); setGenerated(''); setNotice(''); }}>{item}</button>
              ))}
            </div>
            <p className="text-xs text-gray-500">{kit.variants[platform].format} • Verify network limits before publishing.</p>
            <label className="text-xs text-gray-400 block" htmlFor="studio-copy">Caption or AI-revised caption</label>
            <textarea id="studio-copy" readOnly rows={8} value={chosenContent}
              className="input resize-y text-sm leading-relaxed" />
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-secondary text-sm" onClick={() => copy(chosenContent)}>
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button type="button" className="btn-secondary text-sm" onClick={generateAI} disabled={busy !== ''}>
                <Sparkles className="w-4 h-4" /> {busy === 'ai' ? 'Generating…' : 'AI refine (configured key required)'}
              </button>
              <button type="button" className="btn-primary text-sm" onClick={saveDraft} disabled={busy !== ''}>
                <Save className="w-4 h-4" /> {busy === 'draft' ? 'Saving…' : 'Save as draft only'}
              </button>
            </div>
            {notice && <p role="status" className="text-sm text-amber-200 bg-amber-500/10 rounded-lg p-3">{notice}</p>}
            <p className="text-xs text-gray-500">Saving creates a workspace draft using the existing Content Engine API. It never schedules or posts.</p>
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-white flex items-center gap-2"><Film className="w-4 h-4" />3. Video director&apos;s brief</h2>
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed">{kit.script}</pre>
            <button type="button" className="btn-secondary text-xs" onClick={() => copy(kit.script)}><Copy className="w-4 h-4" /> Copy voiceover script</button>
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-400 leading-relaxed border-t border-white/10 pt-4">{kit.productionBrief}</pre>
            <button type="button" className="btn-secondary text-xs" onClick={() => copy(kit.productionBrief)}><Copy className="w-4 h-4" /> Copy scene brief</button>
            <p className="text-sm text-gray-400">Thumbnail concept: {kit.thumbnail}</p>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="card p-5 space-y-3">
          <h2 className="font-semibold text-white flex items-center gap-2"><ShieldCheck className="w-4 h-4" />4. Studio quality gate</h2>
          <ul className="space-y-2">
            {kit.publishingChecklist.map((check) => <li key={check} className="text-sm text-gray-300 flex items-start gap-2"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-brand-400" />{check}</li>)}
          </ul>
          <p className="text-xs text-amber-200">Review required: no automated posting, unauthorized voice cloning, or paid inference.</p>
        </section>
        <section className="card p-5 space-y-3">
          <h2 className="font-semibold text-white">5. Production stations from your GitHub</h2>
          {sources.map((source) => <a key={source.title} target="_blank" rel="noopener noreferrer" href={source.url}
            className="flex justify-between items-start border-b border-white/10 pb-2 text-sm group">
            <span><strong className="block text-gray-200 group-hover:text-brand-300">{source.title}</strong><span className="text-gray-500 text-xs">{source.use}</span></span>
            <ExternalLink className="w-4 h-4 shrink-0 text-gray-500" />
          </a>)}
          <div className="pt-2 flex flex-wrap gap-2">
            <Link href="/dashboard/compose" className="text-brand-300 hover:text-white text-xs">Open content composer →</Link>
            <Link href="/dashboard/crm" className="text-brand-300 hover:text-white text-xs">Open audience CRM →</Link>
            <a href="https://www.canva.com/folder/FAHY-p-Dr2U" target="_blank" rel="noopener noreferrer" className="text-brand-300 hover:text-white text-xs">Open Canva studio →</a>
          </div>
          <p className="text-xs text-gray-500">These are related tools and source patterns, not live integrated service APIs. Credentials and paid execution stay separate.</p>
        </section>
      </div>
    </div>
  );
}
