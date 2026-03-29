import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Calendar Generator — AI-Powered Social Media Planning | Velocity Forge",
  description:
    "Generate a complete 30-day social media content calendar with AI. Get post ideas, hashtags, best posting times, and content themes for Instagram, Twitter/X, LinkedIn, TikTok, and Facebook in seconds.",
  keywords: [
    "content calendar generator",
    "social media calendar",
    "AI content planner",
    "post scheduler",
    "content planning tool",
    "marketing calendar",
  ],
  openGraph: {
    title: "Content Calendar Generator — AI-Powered Social Media Planning",
    description: "Generate your complete social media content calendar with AI. 30 days of posts across all platforms.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Content Calendar Generator — AI-Powered Social Media Planning",
    description: "Generate your complete social media content calendar with AI. 30 days of posts across all platforms.",
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
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
