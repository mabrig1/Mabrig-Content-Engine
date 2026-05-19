export const metadata = { title: 'Analytics' };

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Track your content performance and audience growth</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Impressions', value: '0', icon: '👁' },
          { label: 'Avg. Engagement Rate', value: '0%', icon: '💫' },
          { label: 'Follower Growth', value: '+0', icon: '📈' },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="card p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h2 className="text-xl font-bold text-white mb-2">Connect Accounts to See Analytics</h2>
        <p className="text-gray-400 text-sm">Connect your social accounts to start tracking performance metrics, engagement rates, and audience growth.</p>
      </div>
    </div>
  );
}
