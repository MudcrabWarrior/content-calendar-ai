import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { getStripe } from '@/lib/stripe';
import {
  generateFreeCalendar,
  generateFullCalendar,
} from '@/lib/anthropic';

export const runtime = 'nodejs';

// Track used sessions to prevent replay
const usedSessions = new Set<string>();

// Sanitize user input to prevent prompt injection
function sanitizeInput(input: string): string {
  return input
    .replace(/\b(ignore|disregard|forget)\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi, '[filtered]')
    .replace(/\b(you\s+are\s+now|act\s+as|pretend\s+to\s+be|new\s+instructions?)\b/gi, '[filtered]')
    .replace(/\b(system\s*prompt|system\s*message|<\/?system>)/gi, '[filtered]');
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-real-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';
    const { business, audience, platform, goals, sessionId } =
      await request.json();

    // Validate required fields
    if (!business || !audience || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // --- PREMIUM PATH: Verify payment via Stripe session ---
    if (sessionId) {
      // Prevent session replay
      if (usedSessions.has(sessionId)) {
        return NextResponse.json(
          { error: 'This session has already been used.' },
          { status: 403 }
        );
      }

      // Verify payment with Stripe (server-side, not trusting client)
      const stripe = getStripe();
      let session;
      try {
        session = await stripe.checkout.sessions.retrieve(sessionId);
      } catch {
        return NextResponse.json(
          { error: 'Invalid session ID.' },
          { status: 400 }
        );
      }

      if (session.payment_status !== 'paid') {
        return NextResponse.json(
          { error: 'Payment not completed. Please complete checkout first.' },
          { status: 403 }
        );
      }

      // Mark session as used
      usedSessions.add(sessionId);
      if (usedSessions.size > 10000) {
        const arr = Array.from(usedSessions);
        for (let i = 0; i < 5000; i++) usedSessions.delete(arr[i]);
      }

      // Paid tier: generate full 30-day calendar for all platforms
      const platforms = [
        'Instagram',
        'Twitter/X',
        'LinkedIn',
        'TikTok',
        'Facebook',
      ];

      const result = await generateFullCalendar(
        sanitizeInput(business.slice(0, 2000)),
        sanitizeInput(audience.slice(0, 1000)),
        platforms,
        sanitizeInput((goals || '').slice(0, 1000))
      );

      return NextResponse.json({
        success: true,
        calendar: result.calendar,
        business,
        platforms,
        themes: result.themes,
        sessionId,
      });
    }

    // --- FREE PATH ---
    const { allowed, remaining } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            'Rate limit exceeded. Free tier allows 3 previews per hour. Upgrade to generate more calendars.',
        },
        { status: 429 }
      );
    }

    // Free tier: generate 7-day calendar for single platform
    const calendar = await generateFreeCalendar(
      sanitizeInput(business.slice(0, 2000)),
      sanitizeInput(audience.slice(0, 1000)),
      platform,
      sanitizeInput((goals || '').slice(0, 1000))
    );

    return NextResponse.json({
      success: true,
      calendar,
      business,
      platform,
    });
  } catch (error) {
    console.error('Error generating calendar:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate calendar',
      },
      { status: 500 }
    );
  }
}
