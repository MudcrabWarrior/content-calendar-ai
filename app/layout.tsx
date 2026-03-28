import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Content Calendar Generator — AI-Powered Social Media Planning | Velocity Forge',
  description: 'Generate a complete 30-day social media content calendar with AI. Get post ideas, hashtags, best posting times, and content themes for Instagram, Twitter/X, LinkedIn, TikTok, and Facebook in seconds.',
  keywords: [
    'content calendar generator',
    'social media calendar',
    'AI content planner',
    'post scheduler',
    'content planning tool',
    'marketing calendar',
  ],
  openGraph: {
    title: 'Content Calendar Generator — AI-Powered Social Media Planning',
    description: 'Generate your complete social media content calendar with AI. 30 days of posts across all platforms.',
    type: 'website',
    url: 'https://content-calendar-ai.vercel.app',
    images: [
      {
        url: 'https://content-calendar-ai.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Content Calendar Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Content Calendar Generator — AI-Powered Social Media Planning',
    description: 'Generate your complete social media content calendar with AI. 30 days of posts across all platforms.',
    images: ['https://content-calendar-ai.vercel.app/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#09090b" />
      </head>
      <body style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
        {children}
      </body>
    </html>
  );
}
