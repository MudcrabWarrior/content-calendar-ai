import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  generateFreeCalendar,
  generateFullCalendar,
} from '@/lib/anthropic';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { business, audience, platform, goals, isPaid, sessionId } =
      await request.json();

    // Validate required fields
    if (!business || !audience || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check rate limit (only for free tier)
    if (!isPaid) {
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
    }

    if (isPaid) {
      // Paid tier: generate full 30-day calendar for all platforms
      const platforms = [
        'Instagram',
        'Twitter/X',
        'LinkedIn',
        'TikTok',
        'Facebook',
      ];

      const result = await generateFullCalendar(
        business,
        audience,
        platforms,
        goals
      );

      return NextResponse.json({
        success: true,
        calendar: result.calendar,
        business,
        platforms,
        themes: result.themes,
        sessionId,
      });
    } else {
      // Free tier: generate 7-day calendar for single platform
      const calendar = await generateFreeCalendar(
        business,
        audience,
        platform,
        goals
      );

      return NextResponse.json({
        success: true,
        calendar,
        business,
        platform,
      });
    }
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
