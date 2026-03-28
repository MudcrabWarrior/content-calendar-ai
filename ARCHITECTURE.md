# Technical Architecture — Content Calendar AI

## Stack Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) + React 18 | Landing page, form, calendar display |
| **Styling** | Tailwind CSS + CSS custom properties | Dark theme, responsive design |
| **Backend** | Next.js API Routes | Serverless functions |
| **AI** | Anthropic Claude (Haiku 4.5) | Content generation |
| **Payments** | Stripe Checkout | Session-based, one-time payment |
| **Hosting** | Vercel | Zero-config deployment |
| **Database** | None (stateless) | Data generated on-demand, no persistence |

## Project Structure

```
content-calendar-ai/
├── app/
│   ├── api/
│   │   ├── generate/route.ts      ← Free/paid calendar generation
│   │   ├── checkout/route.ts      ← Stripe checkout session creation
│   │   ├── webhook/route.ts       ← Stripe webhook handler
│   │   └── download/route.ts      ← CSV export endpoint
│   ├── success/
│   │   └── page.tsx               ← Post-payment success page
│   ├── layout.tsx                 ← Root layout, metadata, fonts
│   ├── page.tsx                   ← Landing page, main form, FAQ
│   ├── globals.css                ← Design system, animations, themes
│   ├── robots.ts                  ← SEO: Block API routes
│   └── sitemap.ts                 ← SEO: Sitemap generation
├── lib/
│   ├── anthropic.ts               ← Claude API client, generation logic
│   ├── stripe.ts                  ← Stripe client initialization
│   └── rate-limit.ts              ← IP-based rate limiter
├── package.json                   ← Dependencies
├── next.config.js                 ← Next.js configuration
├── tsconfig.json                  ← TypeScript configuration
├── tailwind.config.ts             ← Tailwind CSS configuration
├── postcss.config.js              ← PostCSS configuration
├── .env.example                   ← Environment variable template
├── .gitignore                     ← Git ignore patterns
├── app.json                       ← Vercel app configuration
├── DEPLOYMENT.md                  ← Deployment guide
└── ARCHITECTURE.md                ← This file
```

## Request Flow

### Free Tier (7-day preview)

```
User Form Input
    ↓
POST /api/generate (isPaid: false)
    ↓
Rate Limit Check (3/hour per IP)
    ↓
Claude API: generateFreeCalendar()
    ↓
JSON Response: 7 days × 1 platform
    ↓
Frontend: Display table with Day, Post Idea, Type, Time
```

### Paid Tier (30-day full calendar)

```
User Form Input
    ↓
Save to sessionStorage
    ↓
POST /api/checkout
    ↓
Stripe: Create checkout session
    ↓
Redirect to Stripe payment page
    ↓
[User pays]
    ↓
Stripe Webhook: checkout.session.completed
    ↓
Redirect to /success?session_id=xxx
    ↓
POST /api/generate (isPaid: true, sessionId)
    ↓
Claude API: generateFullCalendar()
    ↓
JSON Response: 30 days × 5 platforms + themes
    ↓
Frontend: Display filterable table + CSV download
```

## API Endpoints

### POST /api/generate
Generate a content calendar (free or paid).

**Request:**
```json
{
  "business": "Digital marketing agency",
  "audience": "Entrepreneurs",
  "platform": "Instagram",
  "goals": "Increase engagement",
  "isPaid": false,
  "sessionId": null
}
```

**Response (Free):**
```json
{
  "success": true,
  "calendar": [
    {
      "day": "Day 1",
      "platform": "Instagram",
      "postIdea": "Share a behind-the-scenes photo...",
      "type": "Behind-the-scenes",
      "time": "9:00 AM"
    }
  ],
  "business": "Digital marketing agency",
  "platform": "Instagram"
}
```

**Response (Paid):**
```json
{
  "success": true,
  "calendar": [
    {
      "day": 1,
      "date": "Mar 30",
      "platform": "Instagram",
      "postCopy": "Full post text here...",
      "hashtags": "#hashtag1 #hashtag2",
      "bestTime": "9:00 AM",
      "contentType": "Educational",
      "theme": "Content Marketing Fundamentals"
    }
  ],
  "themes": ["Theme 1", "Theme 2"],
  "platforms": ["Instagram", "Twitter/X", ...]
}
```

**Rate Limiting:**
- Free tier: 3 requests per IP per hour
- Header: `X-RateLimit-Remaining: 2`
- Error: 429 if exceeded

---

### POST /api/checkout
Create a Stripe checkout session.

**Request:**
```json
{
  "business": "Digital marketing agency",
  "audience": "Entrepreneurs",
  "platform": "Instagram",
  "goals": "Increase engagement"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/pay/cs_test_xxx"
}
```

**Flow:**
1. Save form data to sessionStorage
2. POST to /api/checkout
3. Redirect to `response.url` (Stripe checkout)
4. After payment, Stripe redirects to `/success?session_id=xxx`

---

### POST /api/webhook
Stripe webhook for payment verification.

**Event:** `checkout.session.completed`
- Validates signature with `STRIPE_WEBHOOK_SECRET`
- Logs payment metadata (business, audience, goals)
- Returns 200 OK

---

### POST /api/download
Generate and download calendar as CSV.

**Request:**
```json
{
  "calendar": [...],
  "business": "Digital marketing agency"
}
```

**Response:**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="Digital marketing agency-30day.csv"`
- CSV headers: Day, Date, Platform, Content Type, Post Copy, Hashtags, Best Time, Theme

---

## Key Components

### lib/anthropic.ts

**generateFreeCalendar()**
- Uses Claude Haiku
- Prompt: "Generate 7 days of content ideas"
- Returns: Array of 7 objects with day, platform, postIdea, type, time

**generateFullCalendar()**
- Uses Claude Haiku
- Prompt: "Generate 30 days for all platforms"
- Returns: Array of 30+ objects with full copy, hashtags, times, themes

**JSON Parsing:**
- Strips markdown code fences (```json...```)
- Throws error if invalid JSON
- No fallbacks — errors propagate to user

---

### lib/stripe.ts

**getStripe()**
- Lazy-initializes Stripe client
- Only once per server instance
- Uses `STRIPE_SECRET_KEY` from environment

**Why Lazy Init?
- Avoids build-time errors
- Allows dynamic key loading
- Matches Next.js best practices

---

### lib/rate-limit.ts

**checkRateLimit(ip: string)**
- In-memory Map with IP as key
- Tracks count and resetTime per IP
- 3 requests per hour window
- Auto-cleanup every hour

**Design Notes:**
- Simple, no external dependencies
- Perfect for free tier
- Resets per IP per hour (not rolling window)
- Server-side only (no cookies needed)

---

## Design System

All colors use CSS custom properties defined in `app/globals.css`:

| Variable | Color | Usage |
|----------|-------|-------|
| `--bg` | #09090b | Page background |
| `--surface` | #18181b | Cards, containers |
| `--surface-elevated` | #1f1f23 | Hover states, inputs |
| `--border` | #27272a | Dividers, borders |
| `--text-primary` | #fafafa | Headings, body text |
| `--text-secondary` | #a1a1aa | Subtext, labels |
| `--text-muted` | #71717a | Subtle text, helpers |
| `--accent` | #6d28d9 | Buttons, highlights |
| `--accent-light` | #8b5cf6 | Hover states |

### Animations

- `fade-up`: Entrance animation (0.6s)
- `fade-in`: Opacity animation (0.6s)
- `shimmer-line`: Loading skeleton effect
- `spin`: Spinner rotation
- `pulse`: Pulsing opacity effect
- `.stagger-children`: Delays child animations

---

## Performance Optimization

### Frontend
- Lazy Stripe/Anthropic initialization
- Inline SVG icons (no image requests)
- CSS-in-JS via style attributes (no CSS bloat)
- Minimal JavaScript (~40KB gzipped)

### Backend
- Claude Haiku (fastest, cheapest model)
- Streaming not used (full response received)
- No database queries (stateless)
- Webhook logging minimal (no storage)

### Caching
- Vercel Edge Cache: HTTP headers not set (no caching)
- Stripe Session: Auto-expires after 24h
- Rate Limit: In-memory, auto-cleanup

---

## Security

### Input Validation
- Business, audience, platform are required
- All inputs passed to Claude (no SQL injection risk)
- No sensitive user data persisted

### API Keys
- STRIPE_SECRET_KEY: Server-only (never exposed)
- ANTHROPIC_API_KEY: Server-only (never exposed)
- STRIPE_WEBHOOK_SECRET: Used to verify Stripe signature

### CORS
- All requests same-origin (no CORS headers set)
- Next.js handles CORS by default

### Webhook Security
- Stripe signature verified with webhook secret
- Invalid signatures rejected immediately
- Event type checked before processing

### Rate Limiting
- IP-based, free tier only
- Prevents abuse of free tier
- No CAPTCHA (simple rate limit sufficient)

---

## Error Handling

### User-Facing Errors
- Rate limit exceeded: 429 status
- Invalid input: 400 status with message
- API errors: 500 status with message

### Logging
- Console errors logged to stdout
- Vercel captures logs automatically
- Stripe webhook events logged (no database)

### Retry Logic
- None implemented (fire-and-forget)
- Stripe webhooks auto-retry 3x (3 days)
- User can retry manually

---

## Testing Checklist

### Free Tier
- [ ] Submit form with all fields
- [ ] Verify 7-day calendar displays
- [ ] Check Day, Post Idea, Type, Time columns
- [ ] Test rate limit (3 requests, then 429)
- [ ] Verify error message appears

### Paid Tier
- [ ] Click "Get full calendar — $7.99"
- [ ] Complete Stripe payment flow
- [ ] Verify redirected to /success
- [ ] Verify calendar generates on success page
- [ ] Test platform filter tabs
- [ ] Download CSV and open in Excel
- [ ] Verify CSV headers and data

### Edge Cases
- [ ] Empty business name (should fail)
- [ ] Very long business name (should truncate)
- [ ] Rate limit at exactly 3 requests
- [ ] Webhook signature mismatch (should fail)
- [ ] Stripe API downtime (should show error)

---

## Future Enhancements

1. **User Accounts**
   - Store generated calendars
   - Allow calendar editing UI
   - Multi-calendar comparison

2. **More Platforms**
   - YouTube Shorts, Pinterest, Bluesky
   - SMS marketing
   - Email newsletter planning

3. **Advanced Features**
   - Calendar templates by industry
   - Competitor analysis
   - Content performance predictions
   - Social listening integration

4. **Monetization**
   - Subscription tier ($9.99/month)
   - API access for teams
   - White-label licensing

5. **Integrations**
   - Direct posting via Buffer/Hootsuite
   - Calendar sync to Google Calendar
   - Notion export

---

## Maintenance & Monitoring

### Daily
- Check error logs in Vercel
- Monitor Stripe transaction success rate

### Weekly
- Review analytics in Vercel dashboard
- Check Anthropic API status page
- Monitor cost (Claude + Stripe)

### Monthly
- Update dependencies: `npm update`
- Review user feedback
- Iterate on prompts based on feedback

---

## Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Stripe Checkout Documentation](https://stripe.com/docs/checkout)
- [Anthropic Claude API](https://docs.anthropic.com)
- [Vercel Documentation](https://vercel.com/docs)
