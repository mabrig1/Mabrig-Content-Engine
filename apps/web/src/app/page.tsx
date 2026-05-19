import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-gradient opacity-80" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-brand-gradient rounded-xl flex items-center justify-center glow-brand">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <span className="text-2xl font-bold text-white">MABRIG</span>
        </div>

        {/* Hero text */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Content Engine
          <span className="block gradient-text mt-2">Powered by AI</span>
        </h1>

        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          The all-in-one platform for creators and agencies. Schedule content, manage contacts,
          generate AI captions, and scale your social media presence.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="btn-primary text-base px-8 py-3 glow-brand hover:shadow-glow-lg transition-all duration-300"
          >
            Launch Dashboard
          </Link>
          <Link
            href="/login"
            className="btn-secondary text-base px-8 py-3"
          >
            Sign In
          </Link>
        </div>

        {/* Feature badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          {[
            '🤖 AI Caption Generator',
            '📅 Smart Scheduling',
            '📊 Analytics Dashboard',
            '👥 CRM Built-in',
            '🔄 Auto-Posting',
            '🎨 Media Library',
          ].map((feature) => (
            <span
              key={feature}
              className="glass px-4 py-2 rounded-full text-sm text-gray-300"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
