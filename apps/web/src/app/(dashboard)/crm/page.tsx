'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Contact } from '@/types';

const TYPES = ['ALL', 'LEAD', 'CUSTOMER', 'FOLLOWER', 'PARTNER', 'COLLABORATOR', 'INFLUENCER'];

const TYPE_COLORS: Record<string, string> = {
  LEAD: 'bg-amber-500/20 text-amber-300',
  CUSTOMER: 'bg-emerald-500/20 text-emerald-300',
  FOLLOWER: 'bg-blue-500/20 text-blue-300',
  PARTNER: 'bg-purple-500/20 text-purple-300',
  COLLABORATOR: 'bg-pink-500/20 text-pink-300',
  INFLUENCER: 'bg-orange-500/20 text-orange-300',
};

export default function CRMPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showAdd, setShowAdd] = useState(false);
  const [total, setTotal] = useState(0);
  const [newContact, setNewContact] = useState({
    firstName: '', lastName: '', email: '', phone: '', type: 'LEAD', notes: '',
  });

  useEffect(() => { fetchContacts(); }, [search, typeFilter]);

  async function fetchContacts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (typeFilter !== 'ALL') params.set('type', typeFilter);
      const res = await fetch(`/api/crm/contacts?${params}`);
      const data = await res.json();
      if (data.success) { setContacts(data.data); setTotal(data.total); }
    } finally {
      setLoading(false);
    }
  }

  async function handleAddContact() {
    try {
      const res = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Contact added!');
        setShowAdd(false);
        setNewContact({ firstName: '', lastName: '', email: '', phone: '', type: 'LEAD', notes: '' });
        fetchContacts();
      } else {
        toast.error(data.error || 'Failed');
      }
    } catch {
      toast.error('Network error');
    }
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">CRM</h1>
          <p className="text-gray-400 text-sm mt-1">{total.toLocaleString()} contacts</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="input pl-9" placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {TYPES.map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${typeFilter === t ? 'bg-brand-600 text-white' : 'bg-surface-200 text-gray-400 hover:text-white border border-white/5'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md animate-slide-up">
            <h2 className="text-lg font-bold text-white mb-4">Add Contact</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">First Name</label>
                  <input className="input" placeholder="John" value={newContact.firstName} onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Last Name</label>
                  <input className="input" placeholder="Doe" value={newContact.lastName} onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Email</label>
                <input className="input" type="email" placeholder="john@example.com" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Phone</label>
                <input className="input" placeholder="+1 555 000 0000" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Type</label>
                <select className="input" value={newContact.type} onChange={(e) => setNewContact({ ...newContact, type: e.target.value })}>
                  {TYPES.filter(t => t !== 'ALL').map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Notes</label>
                <textarea className="input resize-none" rows={2} placeholder="Notes..." value={newContact.notes} onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleAddContact} className="btn-primary flex-1 justify-center">Add Contact</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card p-12 text-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading contacts...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 bg-surface-300 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-gray-500" />
          </div>
          <p className="text-gray-400">No contacts found</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary mt-4">
            <Plus className="w-4 h-4" /> Add First Contact
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Name', 'Contact', 'Type', 'Lead Score', 'Added'].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-600/30 flex items-center justify-center text-xs font-bold text-brand-400 shrink-0">
                        {(contact.firstName?.[0] || contact.email?.[0] || '?').toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white">
                        {[contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {contact.email && <div className="flex items-center gap-1 text-xs text-gray-400"><Mail className="w-3 h-3" />{contact.email}</div>}
                      {contact.phone && <div className="flex items-center gap-1 text-xs text-gray-400"><Phone className="w-3 h-3" />{contact.phone}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${TYPE_COLORS[contact.type] || 'bg-gray-500/20 text-gray-300'}`}>{contact.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-surface-300 rounded-full max-w-16">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(contact.leadScore, 100)}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{contact.leadScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(contact.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
