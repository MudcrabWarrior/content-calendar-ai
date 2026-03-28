import Anthropic from '@anthropic-ai/sdk';

let anthropicInstance: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!anthropicInstance) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not defined');
    }
    anthropicInstance = new Anthropic({ apiKey });
  }
  return anthropicInstance;
}

export interface CalendarEntry {
  day: number;
  date: string;
  platform: string;
  postCopy: string;
  hashtags: string;
  bestTime: string;
  contentType: string;
  theme: string;
}

export interface FreeCalendarEntry {
  day: string;
  platform: string;
  postIdea: string;
  type: string;
  time: string;
}

export async function generateFreeCalendar(
  business: string,
  audience: string,
  platform: string,
  goals: string
): Promise<FreeCalendarEntry[]> {
  const client = getAnthropic();

  const prompt = `You are a social media content strategist. Generate a 7-day content calendar for a business.

Business/Niche: ${business}
Target Audience: ${audience}
Primary Platform: ${platform}
Content Goals: ${goals || 'Grow engagement and reach'}

Generate exactly 7 days of content ideas. For each day, provide:
- Day (Day 1 through Day 7)
- Platform (the provided platform)
- A specific, actionable post idea (2-3 sentences)
- Content type (e.g., Educational, Promotional, Behind-the-scenes, Tutorial, Inspirational, Question)
- Suggested posting time (e.g., 9:00 AM, 2:00 PM, 7:00 PM)

Return ONLY a valid JSON array with no markdown formatting or code fences. Each object should have: day, platform, postIdea, type, time

Example format:
[
  {"day": "Day 1", "platform": "Instagram", "postIdea": "Share a behind-the-scenes photo of your team working on a new project.", "type": "Behind-the-scenes", "time": "9:00 AM"},
  {"day": "Day 2", "platform": "Instagram", "postIdea": "Post a carousel showing 5 quick tips related to your industry.", "type": "Educational", "time": "2:00 PM"}
]`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : '';

  // Parse the JSON response, handling markdown code fences
  let jsonText = responseText.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  const calendar: FreeCalendarEntry[] = JSON.parse(jsonText);
  return calendar;
}

export async function generateFullCalendar(
  business: string,
  audience: string,
  platforms: string[],
  goals: string
): Promise<{ calendar: CalendarEntry[]; themes: string[] }> {
  const client = getAnthropic();

  const platformsList = platforms.join(', ');

  const prompt = `You are a professional content strategist. Generate a comprehensive 30-day social media content calendar.

Business/Niche: ${business}
Target Audience: ${audience}
Platforms: ${platformsList}
Content Goals: ${goals || 'Grow audience, increase engagement, drive conversions'}

Generate exactly 30 days of content. For each day, provide posts for each platform with:
- Day (1 through 30)
- Date (starting from tomorrow, use format: MMM DD)
- Platform (one of: Instagram, Twitter/X, LinkedIn, TikTok, Facebook)
- Full post copy (engaging, platform-appropriate, 1-3 sentences)
- Hashtags (5-10 relevant hashtags for the platform)
- Best posting time (optimal time for that platform)
- Content type (e.g., Educational, Promotional, Behind-the-scenes, Tutorial, Inspirational, Question, Trend, Story)
- Theme (monthly theme or topic focus)

Return ONLY a valid JSON object with this structure:
{
  "calendar": [
    {
      "day": 1,
      "date": "Mar 30",
      "platform": "Instagram",
      "postCopy": "Full post text here...",
      "hashtags": "#hashtag1 #hashtag2 #hashtag3",
      "bestTime": "9:00 AM",
      "contentType": "Educational",
      "theme": "Content Marketing Fundamentals"
    }
  ],
  "themes": ["Theme 1", "Theme 2", "Theme 3", "Theme 4"]
}

No markdown, no code fences. Return only the JSON object.`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : '';

  // Parse the JSON response, handling markdown code fences
  let jsonText = responseText.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  const result = JSON.parse(jsonText);
  return {
    calendar: result.calendar,
    themes: result.themes || [],
  };
}
