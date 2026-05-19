'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Film, Upload, Grid, List, Search } from 'lucide-react';
import type { MediaItem } from '@/types';

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter !== 'ALL') params.set('type', typeFilter);
    fetch(`/api/media?${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) { setMedia(d.data); setTotal(d.total); } })
      .finally(() => setLoading(false));
  }, [typeFilter]);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Media Library</h1>
          <p className="text-gray-400 text-sm mt-1">{total} files</p>
        </div>
        <button className="btn-primary"><Upload className="w-4 h-4" /> Upload Media</button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="input pl-9" placeholder="Search media..." />
        </div>
        <div className="flex gap-2">
          {['ALL', 'IMAGE', 'VIDEO', 'GIF'].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${typeFilter === t ? 'bg-brand-600 text-white' : 'bg-surface-200 text-gray-400 hover:text-white border border-white/5'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          <button onClick={() => setView('grid')} className={`p-2 rounded-lg ${view === 'grid' ? 'bg-brand-600/20 text-brand-400' : 'text-gray-500 hover:text-white'}`}><Grid className="w-4 h-4" /></button>
          <button onClick={() => setView('list')} className={`p-2 rounded-lg ${view === 'list' ? 'bg-brand-600/20 text-brand-400' : 'text-gray-500 hover:text-white'}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      ) : media.length === 0 ? (
        <div className="card p-16 text-center border-dashed border-2 border-white/10 hover:border-brand-500/30 transition-colors cursor-pointer">
          <div className="w-16 h-16 bg-surface-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Upload your first media</h2>
          <p className="text-gray-400 text-sm mb-2">Drag and drop files or click to browse</p>
          <p className="text-gray-500 text-xs">JPG, PNG, GIF, MP4, MOV — max 100MB</p>
        </div>
      ) : (
        <div className={view === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3' : 'space-y-2'}>
          {media.map((item) => (
            <div key={item.id} className={view === 'grid' ? 'card aspect-square overflow-hidden cursor-pointer hover:border-brand-500/30 transition-all' : 'card p-3 flex items-center gap-3 cursor-pointer hover:border-white/10'}>
              <div className="w-full h-full bg-surface-300 flex items-center justify-center">
                {item.type === 'VIDEO' ? <Film className="w-8 h-8 text-gray-500" /> : <ImageIcon className="w-8 h-8 text-gray-500" />}
              </div>
              {view === 'list' && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.originalName}</p>
                  <p className="text-xs text-gray-500">{item.type} · {(item.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
