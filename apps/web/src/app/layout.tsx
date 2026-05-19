import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'MABRIG Content Engine',
    template: '%s | MABRIG Content Engine',
  },
  description: 'AI-powered social media CRM and content automation platform',
  keywords: ['social media', 'AI content', 'scheduling', 'CRM', 'automation'],
  authors: [{ name: 'MABRIG' }],
  creator: 'MABRIG',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'MABRIG Content Engine',
    description: 'AI-powered social media CRM and content automation platform',
    siteName: 'MABRIG Content Engine',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MABRIG Content Engine',
    description: 'AI-powered social media CRM and content automation platform',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-surface-0 text-white antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}
