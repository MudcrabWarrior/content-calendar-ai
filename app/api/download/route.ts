import { NextRequest, NextResponse } from 'next/server';
import { CalendarEntry } from '@/lib/anthropic';

export const runtime = 'nodejs';

function generateCSV(calendar: CalendarEntry[], business: string): string {
  const headers = [
    'Day',
    'Date',
    'Platform',
    'Content Type',
    'Post Copy',
    'Hashtags',
    'Best Time',
    'Theme',
  ];

  const rows = calendar.map((entry) => [
    entry.day.toString(),
    entry.date,
    entry.platform,
    entry.contentType,
    `"${entry.postCopy.replace(/"/g, '""')}"`, // Escape quotes in CSV
    entry.hashtags,
    entry.bestTime,
    entry.theme,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

export async function POST(request: NextRequest) {
  try {
    const { calendar, business } = await request.json();

    if (!calendar || !Array.isArray(calendar)) {
      return NextResponse.json(
        { error: 'Invalid calendar data' },
        { status: 400 }
      );
    }

    const csv = generateCSV(calendar, business || 'Content-Calendar');
    const filename = `${business || 'Content-Calendar'}-30day.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate CSV',
      },
      { status: 500 }
    );
  }
}
