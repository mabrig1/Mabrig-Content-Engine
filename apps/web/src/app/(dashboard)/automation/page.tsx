export const metadata = { title: 'Automation' };

export default function AutomationPage() {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Automation</h1>
          <p className="text-gray-400 text-sm mt-1">Create powerful workflows to automate your content strategy</p>
        </div>
        <button className="btn-primary">+ New Automation</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[
          { title: 'Auto-Repost Evergreen', desc: 'Automatically repost your best performing content', icon: '🔄', active: false },
          { title: 'Engagement Follow-up', desc: 'Send DMs to highly engaged followers', icon: '💬', active: false },
          { title: 'Content Recycler', desc: 'Recycle top posts on a schedule', icon: '♻️', active: false },
          { title: 'AI Daily Caption', desc: 'Generate and schedule daily AI captions', icon: '🤖', active: false },
        ].map((automation) => (
          <div key={automation.title} className="card p-5 flex items-start gap-4">
            <div className="text-3xl">{automation.icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">{automation.title}</h3>
              <p className="text-sm text-gray-400 mt-1">{automation.desc}</p>
            </div>
            <div className="w-10 h-5 bg-surface-300 rounded-full border border-white/10 cursor-pointer" />
          </div>
        ))}
      </div>
    </div>
  );
}
