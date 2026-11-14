'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface CalendarPost {
  id: string;
  title: string | null;
  content: string;
  status: string;
  scheduledAt: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(() => new Date().getDate());
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDate, setEditDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const refresh = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const start = new Date(year, monthIndex, 1).toISOString();
      const end = new Date(year, monthIndex + 1, 1).toISOString();
      const url = '/api/calendar?from=' + encodeURIComponent(start) + '&to=' + encodeURIComponent(end);
      const response = await fetch(url, { signal });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Calendar unavailable');
      setPosts(result.data);
      if (result.truncated) toast.error('Some scheduled items may be hidden. Narrow the range.');
    } catch (error) {
      if (signal?.aborted) return;
      toast.error(error instanceof Error ? error.message : 'Unable to load calendar');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
    // refresh depends only on the selected month.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, monthIndex]);

  const changeMonth = (delta: number) => {
    setMonth(new Date(year, monthIndex + delta, 1));
    setSelected(1);
    setEditDate('');
  };

  const sameDay = (post: CalendarPost, day: number) => {
    const date = new Date(post.scheduledAt);
    return date.getFullYear() === year && date.getMonth() === monthIndex && date.getDate() === day;
  };

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const offset = new Date(year, monthIndex, 1).getDay();
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => i - offset + 1);
  const selectedPosts = posts.filter((post) => sameDay(post, selected));

  const updateSchedule = async (post: CalendarPost, unschedule: boolean) => {
    if (!unschedule && (!editDate || !Number.isFinite(new Date(editDate).getTime()) || new Date(editDate) <= new Date())) {
      toast.error('Choose a future date and time');
      return;
    }
    setEditingId(post.id);
    try {
      const response = await fetch('/api/posts/' + encodeURIComponent(post.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unschedule
          ? { status: 'DRAFT', scheduledAt: null }
          : { status: 'SCHEDULED', scheduledAt: new Date(editDate).toISOString() }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || 'Update failed');
      setEditDate('');
      await refresh();
      toast.success(unschedule ? 'Returned to draft' : 'Schedule updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setEditingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
          <p className="text-sm text-gray-400 mt-1">
            Plan and reschedule posts. Dates are planning records, not confirmation of social publication.
          </p>
        </div>
        <Link href="/dashboard/compose" className="btn-primary">+ New scheduled post</Link>
      </div>

      <div className="card p-4 sm:p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-white">
            {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={() => changeMonth(-1)} aria-label="Previous month">←</button>
            <button type="button" className="btn-secondary" onClick={() => changeMonth(1)} aria-label="Next month">→</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => <div className="text-xs text-gray-500 text-center py-2" key={day}>{day}</div>)}
          {cells.map((day, index) => {
            const valid = day > 0 && day <= daysInMonth;
            const events = valid ? posts.filter((post) => sameDay(post, day)) : [];
            return (
              <button key={index} type="button" disabled={!valid}
                aria-label={valid ? 'Select ' + String(day) : 'Outside current month'}
                onClick={() => { setSelected(day); setEditDate(''); }}
                className={'min-h-[74px] sm:min-h-[90px] rounded-lg border p-1 sm:p-2 text-left transition-colors ' +
                  (valid ? 'hover:bg-white/10 ' : 'opacity-20 ') +
                  (day === selected && valid ? 'border-brand-500 bg-brand-600/15' : 'border-white/5 bg-surface-200')}>
                {valid && <span className="text-xs text-gray-300">{day}</span>}
                {events.slice(0, 2).map((post) => (
                  <div key={post.id} className="mt-1 rounded bg-brand-600/30 text-brand-200 px-1 py-0.5 text-[10px] truncate">
                    {post.title || post.content.slice(0, 25)}
                  </div>
                ))}
                {events.length > 2 && <div className="text-[10px] text-gray-400 mt-1">+{events.length - 2} more</div>}
              </button>
            );
          })}
        </div>
        {loading && <p role="status" className="text-xs text-gray-400 mt-4">Loading scheduled content…</p>}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-white mb-3">
          {new Date(year, monthIndex, selected).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </h2>
        {selectedPosts.length === 0 ? (
          <p className="text-sm text-gray-500">No scheduled items for this day.</p>
        ) : (
          <div className="space-y-4">
            {selectedPosts.map((post) => (
              <div className="border border-white/10 rounded-lg p-4 space-y-3" key={post.id}>
                <div className="flex justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{post.title || 'Untitled post'}</h3>
                    <p className="text-xs text-gray-400">
                      {new Date(post.scheduledAt).toLocaleString()} · {post.status.toLowerCase().replaceAll('_', ' ')}
                    </p>
                  </div>
                  <button type="button" className="btn-secondary text-xs disabled:opacity-50"
                    disabled={editingId !== null} onClick={() => updateSchedule(post, true)}>
                    Return to draft
                  </button>
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-3">{post.content}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <input type="datetime-local" className="input max-w-[240px]" aria-label="New scheduled date"
                    value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                  <button type="button" className="btn-primary disabled:opacity-50" disabled={editingId !== null || !editDate}
                    onClick={() => updateSchedule(post, false)}>Reschedule</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
