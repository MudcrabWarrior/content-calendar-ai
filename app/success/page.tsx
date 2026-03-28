'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarEntry } from '@/lib/anthropic';

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

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M8 1v10M1 12h14M12 9l-4 4-4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [calendar, setCalendar] = useState<CalendarEntry[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [business, setBusiness] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [downloadingCSV, setDownloadingCSV] = useState(false);

  useEffect(() => {
    const generateFull = async () => {
      try {
        // Get form data from sessionStorage (set before checkout redirect)
        const formData = sessionStorage.getItem('calendarFormData');
        if (!formData) {
          throw new Error('Form data not found. Please try again.');
        }

        const { business: biz, audience, platform, goals } = JSON.parse(formData);
        setBusiness(biz);

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business: biz,
            audience,
            platform,
            goals,
            isPaid: true,
            sessionId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate calendar');
        }

        setCalendar(data.calendar);
        setThemes(data.themes);
        sessionStorage.removeItem('calendarFormData');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    generateFull();
  }, [sessionId]);

  const handleDownloadCSV = async () => {
    try {
      setDownloadingCSV(true);

      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendar, business }),
      });

      if (!response.ok) {
        throw new Error('Failed to download CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${business || 'Content-Calendar'}-30day.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download CSV');
    } finally {
      setDownloadingCSV(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            Generating your full 30-day calendar...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div
          style={{
            maxWidth: '500px',
            padding: '2rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: `1px solid rgba(239, 68, 68, 0.3)`,
            borderRadius: '12px',
            color: '#fca5a5',
          }}
        >
          <h2 style={{ marginBottom: '1rem' }}>Error</h2>
          <p style={{ marginBottom: '1.5rem' }}>{error}</p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Back to home
          </a>
        </div>
      </div>
    );
  }

  const platforms = Array.from(new Set(calendar.map((e) => e.platform)));
  const filteredCalendar = selectedPlatform === 'All'
    ? calendar
    : calendar.filter((e) => e.platform === selectedPlatform);

  return (
    <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div
        style={{
          borderBottom: `1px solid var(--border)`,
          padding: '2rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Your 30-Day Content Calendar
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {business} — All platforms, ready to execute
        </p>

        <button
          onClick={handleDownloadCSV}
          disabled={downloadingCSV}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: downloadingCSV ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: downloadingCSV ? 0.7 : 1,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!downloadingCSV) e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {downloadingCSV ? (
            <>
              <Spinner />
              Downloading...
            </>
          ) : (
            <>
              <DownloadIcon />
              Download as CSV
            </>
          )}
        </button>
      </div>

      {/* Themes */}
      {themes.length > 0 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            Monthly content themes
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {themes.map((theme, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--accent-surface)',
                  border: `1px solid var(--accent-border)`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: 'var(--accent-light)',
                }}
              >
                {theme}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Tabs */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 0' }}>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: `1px solid var(--border)` }}>
          <button
            onClick={() => setSelectedPlatform('All')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: selectedPlatform === 'All' ? 'var(--accent-surface)' : 'transparent',
              border: selectedPlatform === 'All' ? `1px solid var(--accent-border)` : 'none',
              color: selectedPlatform === 'All' ? 'var(--accent-light)' : 'var(--text-secondary)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (selectedPlatform !== 'All') {
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPlatform !== 'All') {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            All platforms
          </button>
          {platforms.map((plat) => (
            <button
              key={plat}
              onClick={() => setSelectedPlatform(plat)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: selectedPlatform === plat ? 'var(--accent-surface)' : 'transparent',
                border: selectedPlatform === plat ? `1px solid var(--accent-border)` : 'none',
                color: selectedPlatform === plat ? 'var(--accent-light)' : 'var(--text-secondary)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (selectedPlatform !== plat) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPlatform !== plat) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {plat}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Table */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div style={{ overflowX: 'auto' }}>
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
                  backgroundColor: 'var(--surface)',
                  borderBottom: `1px solid var(--border)`,
                }}
              >
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', minWidth: '60px' }}>
                  Day
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', minWidth: '80px' }}>
                  Date
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', minWidth: '100px' }}>
                  Platform
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', minWidth: '100px' }}>
                  Type
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', minWidth: '200px' }}>
                  Post Copy
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', minWidth: '150px' }}>
                  Hashtags
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', minWidth: '80px' }}>
                  Time
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', minWidth: '100px' }}>
                  Theme
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCalendar.map((entry, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: `1px solid var(--border)`,
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(24, 24, 27, 0.5)',
                  }}
                >
                  <td style={{ padding: '1rem', color: 'var(--accent)' }}>
                    {entry.day}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {entry.date}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>
                    {entry.platform}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {entry.contentType}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                    {entry.postCopy}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--accent-light)', fontSize: '12px' }}>
                    {entry.hashtags}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {entry.bestTime}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {entry.theme}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross-Promo */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem', textAlign: 'center' }}>
          Explore more tools from Velocity Forge
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <a
            href="https://pitch-deck-ai-nine.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '2rem',
              backgroundColor: 'var(--surface)',
              border: `1px solid var(--border)`,
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.backgroundColor = 'var(--surface)';
            }}
          >
            <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>
              Pitch Deck Generator
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '1rem' }}>
              Create stunning pitch decks in seconds. Generate professional PPTX presentations with AI.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
              Explore <ArrowRight />
            </div>
          </a>

          <a
            href="https://cover-letter-ai-one.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '2rem',
              backgroundColor: 'var(--surface)',
              border: `1px solid var(--border)`,
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.backgroundColor = 'var(--surface)';
            }}
          >
            <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>
              Cover Letter Generator
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '1rem' }}>
              Land your dream job. Generate tailored cover letters that stand out to recruiters.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
              Explore <ArrowRight />
            </div>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid var(--border)`,
          padding: '2rem 1.5rem',
          textAlign: 'center',
          marginTop: '3rem',
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '1rem' }}>
          © 2025 Velocity Forge AI. All rights reserved.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          Need help? Email{' '}
          <a href="mailto:mudcrabwarrior@gmail.com" style={{ color: 'var(--accent)' }}>
            mudcrabwarrior@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
