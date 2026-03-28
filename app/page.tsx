'use client';

import { useState } from 'react';
import { FreeCalendarEntry } from '@/lib/anthropic';

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M8 1L14 8M14 8L8 15M14 8H1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Spinner = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="animate-spin"
  >
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path
      d="M8 1a7 7 0 0 1 0 14"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M13.5 4L6 12L2.5 8.5"
      stroke="var(--success)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="3" width="16" height="14" rx="2" stroke="var(--accent)" strokeWidth="1.5" />
    <path d="M2 8h16" stroke="var(--accent)" strokeWidth="1.5" />
    <path d="M6 1v4M14 1v4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="9" width="14" height="8" rx="1.5" stroke="var(--accent)" strokeWidth="1.5" />
    <path d="M6 9V6a2 2 0 0 1 4-2v0a2 2 0 0 1 4 0v3" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

interface FAQItem {
  question: string;
  answer: string;
}

export default function Home() {
  const [business, setBusiness] = useState('');
  const [audience, setAudience] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [calendar, setCalendar] = useState<FreeCalendarEntry[]>([]);
  const [error, setError] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: 'What do I get in the free tier?',
      answer:
        'The free tier generates a 7-day content calendar for one social media platform with post ideas, content types, and suggested posting times. Perfect for testing and trying out the tool.',
    },
    {
      question: 'What\'s included in the paid tier?',
      answer:
        'Upgrade to $7.99 for a complete 30-day calendar across all platforms (Instagram, Twitter/X, LinkedIn, TikTok, Facebook) with full post copy, hashtags, best posting times, content themes, and CSV download.',
    },
    {
      question: 'Which platforms are supported?',
      answer:
        'We support Instagram, Twitter/X, LinkedIn, TikTok, Facebook, and YouTube. The paid tier generates content for all platforms; the free tier generates for one platform of your choice.',
    },
    {
      question: 'Can I edit the generated calendar?',
      answer:
        'Yes! Download the CSV from the paid tier and edit it in Excel or Google Sheets. All content is yours to customize.',
    },
    {
      question: 'Is my data private?',
      answer:
        'Absolutely. We never store your personal information or generated calendars. All data is processed securely and deleted after generation.',
    },
  ];

  const handleGenerateFree = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCalendar([]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business,
          audience,
          platform,
          goals,
          isPaid: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate calendar');
      }

      setCalendar(data.calendar);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      // Save form data for success page
      sessionStorage.setItem(
        'calendarFormData',
        JSON.stringify({ business, audience, platform, goals })
      );

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business, audience, platform, goals }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* Navigation */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'rgba(9, 9, 11, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid var(--border)`,
          zIndex: 50,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              VF
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Velocity Forge</span>
          </div>

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a
              href="https://pitch-deck-ai-nine.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              Pitch Decks
            </a>
            <a
              href="https://cover-letter-ai-one.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              Cover Letters
            </a>
            <a
              href="mailto:mudcrabwarrior@gmail.com"
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              Support
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 1.5rem 3rem' }}>
        <div style={{ textAlign: 'center' }} className="animate-fade-up">
          <div
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              background: 'var(--accent-surface)',
              border: `1px solid var(--accent-border)`,
              borderRadius: '24px',
              marginBottom: '1.5rem',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--accent-light)',
              }}
            >
              Now with 30-day planning
            </span>
          </div>

          <h1
            style={{
              fontSize: '3.5rem',
              fontWeight: '700',
              lineHeight: '1.2',
              marginBottom: '1rem',
            }}
          >
            Your content calendar,
            <br />
            generated.
          </h1>

          <p
            style={{
              fontSize: '1.25rem',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem',
            }}
          >
            Describe your brand and get a complete social media calendar powered by AI. From post ideas to hashtags to posting times.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }} className="animate-fade-up">
          <form
            onSubmit={handleGenerateFree}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              padding: '2rem',
              backgroundColor: 'var(--surface)',
              border: `1px solid var(--border)`,
              borderRadius: '12px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)',
                }}
              >
                Business / Niche
              </label>
              <textarea
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                placeholder="E.g., Digital marketing agency, sustainable fashion brand, SaaS startup"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--surface-elevated)',
                  border: `1px solid var(--border)`,
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  resize: 'vertical',
                  minHeight: '80px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)',
                }}
              >
                Target Audience
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="E.g., entrepreneurs, eco-conscious millennials, B2B decision makers"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--surface-elevated)',
                  border: `1px solid var(--border)`,
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)',
                }}
              >
                Primary Platform
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '2.5rem',
                    backgroundColor: 'var(--surface-elevated)',
                    border: `1px solid var(--border)`,
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <option value="Instagram">Instagram</option>
                  <option value="Twitter/X">Twitter/X</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Facebook">Facebook</option>
                </select>
                <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
                  <ChevronDown />
                </div>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)',
                }}
              >
                Content Goals (Optional)
              </label>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="E.g., increase engagement, drive sales, build brand awareness, educate audience"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--surface-elevated)',
                  border: `1px solid var(--border)`,
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  resize: 'vertical',
                  minHeight: '60px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: loading
                  ? 'rgba(109, 40, 217, 0.5)'
                  : 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {loading ? (
                <>
                  <Spinner />
                  Generating...
                </>
              ) : (
                <>
                  Generate free preview
                  <ArrowRight />
                </>
              )}
            </button>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Free tier: 3 previews per hour. No account required.
            </p>
          </form>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              padding: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: `1px solid rgba(239, 68, 68, 0.3)`,
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        </section>
      )}

      {/* Free Calendar Results */}
      {calendar.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div className="animate-fade-up">
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                marginBottom: '1.5rem',
              }}
            >
              Your 7-Day Preview — {platform}
            </h2>

            <div
              style={{
                overflowX: 'auto',
                backgroundColor: 'var(--surface)',
                border: `1px solid var(--border)`,
                borderRadius: '12px',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: 'var(--surface-elevated)',
                      borderBottom: `1px solid var(--border)`,
                    }}
                  >
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Day
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Post Idea
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Type
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Best Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {calendar.map((entry, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: idx < calendar.length - 1 ? `1px solid var(--border)` : 'none',
                      }}
                    >
                      <td style={{ padding: '1rem', color: 'var(--accent)' }}>
                        {entry.day}
                      </td>
                      <td style={{ padding: '1rem' }}>{entry.postIdea}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                        {entry.type}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                        {entry.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Upsell Card */}
      {calendar.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              padding: '2rem',
              backgroundColor: 'var(--accent-surface)',
              border: `2px solid var(--accent-border)`,
              borderRadius: '12px',
            }}
            className="animate-fade-up"
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
              <CalendarIcon />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  Get the full 30-day calendar
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Unlock all platforms, full post copy, hashtags, and more.
                </p>
              </div>
            </div>

            <ul style={{ listStyle: 'none', marginBottom: '1.5rem' }}>
              {[
                '30-day content calendar',
                'All platforms (Instagram, Twitter/X, LinkedIn, TikTok, Facebook)',
                'Full post copy for each post',
                'Relevant hashtags',
                'Best posting times per platform',
                'Content themes and types',
                'CSV download for easy editing',
              ].map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                    fontSize: '14px',
                  }}
                >
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={handleCheckout}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s',
                marginBottom: '0.75rem',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Get full calendar — $7.99
              <ArrowRight />
            </button>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
              One-time payment • Instant delivery
            </p>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 1.5rem 3rem' }}>
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '3rem',
          }}
        >
          How it works
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}
          className="stagger-children"
        >
          {[
            {
              number: '01',
              title: 'Describe',
              description:
                'Tell us about your business, target audience, and content goals.',
            },
            {
              number: '02',
              title: 'Generate',
              description:
                'Our AI analyzes your input and generates platform-specific content ideas.',
            },
            {
              number: '03',
              title: 'Execute',
              description:
                'Download your calendar, customize it, and start publishing across all platforms.',
            },
          ].map((step) => (
            <div
              key={step.number}
              style={{
                padding: '2rem',
                backgroundColor: 'var(--surface)',
                border: `1px solid var(--border)`,
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: 'var(--accent)',
                  marginBottom: '1rem',
                }}
              >
                {step.number}
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                }}
              >
                {step.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '5rem 1.5rem 3rem' }}>
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          Frequently asked questions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                border: `1px solid ${expandedFAQ === idx ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'all 0.2s',
              }}
            >
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                style={{
                  width: '100%',
                  padding: '1.5rem',
                  backgroundColor: 'var(--surface)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-elevated)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface)'}
              >
                {item.question}
                <div
                  style={{
                    transform: expandedFAQ === idx ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <ChevronDown />
                </div>
              </button>

              {expandedFAQ === idx && (
                <div
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--surface-elevated)',
                    borderTop: `1px solid var(--border)`,
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid var(--border)`,
          padding: '3rem 1.5rem',
          marginTop: '5rem',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
              marginBottom: '2rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  VF
                </div>
                <span style={{ fontWeight: '600' }}>Velocity Forge</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Create Faster. Think Smarter. Scale Higher.
              </p>
            </div>

            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>Tools</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>
                  <a
                    href="https://pitch-deck-ai-nine.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
                  >
                    Pitch Deck Generator
                  </a>
                </li>
                <li>
                  <a
                    href="https://cover-letter-ai-one.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
                  >
                    Cover Letter Generator
                  </a>
                </li>
                <li>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Content Calendar (you are here)
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>Support</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>
                  <a
                    href="mailto:mudcrabwarrior@gmail.com"
                    style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
                  >
                    Email
                  </a>
                </li>
                <li>
                  <a
                    href="https://velocityforgeai.gumroad.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
                  >
                    Gumroad
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            style={{
              paddingTop: '2rem',
              borderTop: `1px solid var(--border)`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            <p>© 2025 Velocity Forge AI. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <a
                href="#privacy"
                style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
