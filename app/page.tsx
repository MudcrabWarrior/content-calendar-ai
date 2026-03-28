"use client";

import { useState } from "react";
import { FreeCalendarEntry } from "@/lib/anthropic";

export default function Home() {
  const [business, setBusiness] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [goals, setGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const [calendar, setCalendar] = useState<FreeCalendarEntry[]>([]);
  const [error, setError] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!business.trim() || !audience.trim()) return;
    setLoading(true);
    setError("");
    setCalendar([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business,
          audience,
          platform,
          goals,
          isPaid: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate calendar");

      setCalendar(data.calendar);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      sessionStorage.setItem(
        "calendarFormData",
        JSON.stringify({ business, audience, platform, goals })
      );

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business, audience, platform, goals }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-700 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI Content Calendar Generator
          </h1>
          <p className="text-xl text-blue-100 mb-2">
            Describe your business. Get a 7-day content preview. Free.
          </p>
          <p className="text-sm text-blue-200">
            No signup required. Upgrade for 30-day full calendar.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Business / Niche
              </label>
              <textarea
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                placeholder="E.g., Digital marketing agency, sustainable fashion brand, SaaS startup"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="E.g., entrepreneurs, eco-conscious millennials, B2B decision makers"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Primary Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              >
                <option value="Instagram">Instagram</option>
                <option value="Twitter/X">Twitter/X</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="TikTok">TikTok</option>
                <option value="Facebook">Facebook</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Content Goals (Optional)
              </label>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="E.g., increase engagement, drive sales, build brand awareness, educate audience"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-y"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !business.trim() || !audience.trim()}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate My Calendar (Free)"
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Free tier: 7-day preview, one platform. No signup required.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Results Table */}
          {calendar.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Your 7-Day Preview — {platform}
              </h2>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">Day</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">Post Idea</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">Type</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">Best Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calendar.map((entry, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50 last:border-b-0">
                        <td className="px-4 py-3 text-sm font-semibold text-brand-600">{entry.day}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{entry.postIdea}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{entry.type}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{entry.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Upsell Card */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Get the Full 30-Day Calendar — $7.99
                </h3>
                <ul className="text-sm text-gray-700 space-y-1.5 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">&#10003;</span>
                    <span><strong>30-day content calendar</strong> — all days planned</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">&#10003;</span>
                    <span><strong>All platforms</strong> — Instagram, Twitter/X, LinkedIn, TikTok, Facebook</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">&#10003;</span>
                    <span><strong>Full post copy</strong> — ready to publish</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">&#10003;</span>
                    <span><strong>Hashtags & best times</strong> — platform-optimized</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">&#10003;</span>
                    <span><strong>CSV download</strong> — edit in Excel or Sheets</span>
                  </li>
                </ul>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Get Full Calendar — $7.99
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  One-time payment. Instant delivery. Powered by Stripe.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              number: "1",
              title: "Describe",
              description: "Tell us about your business, target audience, and content goals.",
            },
            {
              number: "2",
              title: "Generate",
              description: "Our AI analyzes your input and generates platform-specific content ideas.",
            },
            {
              number: "3",
              title: "Execute",
              description: "Download your calendar, customize it, and start publishing across all platforms.",
            },
          ].map((step) => (
            <div key={step.number} className="bg-white border rounded-lg p-6">
              <div className="text-3xl font-bold text-brand-600 mb-2">{step.number}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "What do I get in the free tier?",
              a: "The free tier generates a 7-day content calendar for one social media platform with post ideas, content types, and suggested posting times. Perfect for testing and trying out the tool.",
            },
            {
              q: "What's included in the paid tier?",
              a: "Upgrade to $7.99 for a complete 30-day calendar across all platforms (Instagram, Twitter/X, LinkedIn, TikTok, Facebook) with full post copy, hashtags, best posting times, content themes, and CSV download.",
            },
            {
              q: "Which platforms are supported?",
              a: "We support Instagram, Twitter/X, LinkedIn, TikTok, Facebook, and YouTube. The paid tier generates content for all platforms; the free tier generates for one platform of your choice.",
            },
            {
              q: "Can I edit the generated calendar?",
              a: "Yes! Download the CSV from the paid tier and edit it in Excel or Google Sheets. All content is yours to customize.",
            },
            {
              q: "Is my data private?",
              a: "Absolutely. We never store your personal information or generated calendars. All data is processed securely and deleted after generation.",
            },
          ].map((faq, i) => (
            <details key={i} className="bg-white border rounded-lg p-4">
              <summary className="font-semibold text-gray-800 cursor-pointer">
                {faq.q}
              </summary>
              <p className="mt-2 text-sm text-gray-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t py-8 px-4 text-center text-sm text-gray-500">
        <p className="mb-2">Built by <a href="https://velocityforgeai.gumroad.com" className="text-brand-600 hover:underline">Velocity Forge AI</a></p>
        <p className="mb-4">Create Faster. Think Smarter. Scale Higher.</p>
        <p className="text-xs text-gray-400 mb-4">
          Other tools: <a href="https://cover-letter-ai-one.vercel.app" className="text-brand-600 hover:underline">Cover Letters</a> • <a href="https://pitch-deck-ai-nine.vercel.app" className="text-brand-600 hover:underline">Pitch Decks</a> • <a href="https://website-roaster-ai.vercel.app" className="text-brand-600 hover:underline">Website Roaster</a> • <a href="https://business-name-generator-ai.vercel.app" className="text-brand-600 hover:underline">Business Names</a>
        </p>
      </footer>
    </main>
  );
}
