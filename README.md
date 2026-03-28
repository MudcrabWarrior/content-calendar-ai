# Content Calendar AI — AI-Powered Social Media Planning

> **Tool #3** in the [GROW Program](../CLAUDE.md) — a series of high-ROI SaaS tools by Velocity Forge AI.

Generate a complete 30-day social media content calendar with AI. From post ideas to hashtags to posting times.

**Live:** https://content-calendar-ai.vercel.app
**Brand:** Velocity Forge AI — "Create Faster. Think Smarter. Scale Higher."

---

## Overview

### What It Does
- **Free tier:** Generate a 7-day content calendar for 1 platform (3 per hour)
- **Paid tier ($7.99):** Generate a full 30-day calendar for all platforms with full post copy, hashtags, best posting times, and content themes

### Target Audience
- Content creators & marketers
- Small business owners
- Social media managers
- Entrepreneurs

### Target Keywords
- "content calendar generator"
- "social media calendar"
- "AI content planner"
- "post scheduler"
- "content planning tool"

---

## Getting Started

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 3. Run dev server
npm run dev

# 4. Open browser
# http://localhost:3000
```

### Deploy to Vercel
```bash
# Option A: Git push (recommended)
git push origin main

# Option B: Vercel CLI
npm i -g vercel
vercel

# Option C: Vercel Dashboard
# https://vercel.com → Import Git repo → Add env vars → Deploy
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 + React 18 + Tailwind CSS | Landing page, form, calendar display |
| Backend | Next.js API Routes (serverless) | Generation, checkout, webhooks |
| AI | Anthropic Claude Haiku 4.5 | Content generation (fast + cheap) |
| Payments | Stripe Checkout (session-based) | One-time $7.99 purchase |
| Hosting | Vercel | Zero-config, auto-scaling |
| Database | None (stateless) | Generated on-demand |

---

## Project Structure

```
content-calendar-ai/
├── app/
│   ├── api/
│   │   ├── generate/       ← AI generation endpoint
│   │   ├── checkout/       ← Stripe session creation
│   │   ├── webhook/        ← Stripe webhook handler
│   │   └── download/       ← CSV export
│   ├── success/            ← Post-payment page
│   ├── page.tsx            ← Landing page
│   ├── layout.tsx          ← Root layout
│   └── globals.css         ← Design system
├── lib/
│   ├── anthropic.ts        ← Claude API integration
│   ├── stripe.ts           ← Stripe client
│   └── rate-limit.ts       ← IP-based rate limiting
├── QUICK_START.md          ← 5-minute setup guide
├── ARCHITECTURE.md         ← Technical deep dive
├── DEPLOYMENT.md           ← Deployment guide
└── README.md              ← This file
```

---

## Features

### Landing Page
- Hero section with pill badge ("Now with 30-day planning")
- Form with inputs: business, audience, platform, goals
- "Generate free preview" button
- Rate limit notice (3/hour)

### Free Tier Results
- 7-day content calendar
- Single platform (user's choice)
- Columns: Day, Post Idea, Type, Best Time
- Upsell card: upgrade to $7.99 for full calendar

### Paid Tier Results
- 30-day content calendar
- All 5 platforms: Instagram, Twitter/X, LinkedIn, TikTok, Facebook
- Columns: Day, Date, Platform, Type, Full Post Copy, Hashtags, Best Time, Theme
- Platform filter tabs
- CSV download button
- Monthly content themes

### How It Works Section
- 3-step visual guide: Describe → Generate → Execute
- Free vs Paid comparison
- 5-question FAQ accordion

### Navigation & Footer
- Sticky nav with links to other tools
- Footer with cross-promo to Pitch Deck and Cover Letter generators
- Support email link

---

## API Endpoints

### POST /api/generate
Generate a content calendar.

**Free tier:** 3 requests/hour per IP
**Paid tier:** Unlimited (after payment)

**Request:**
```json
{
  "business": "Digital marketing agency",
  "audience": "Entrepreneurs",
  "platform": "Instagram",
  "goals": "Increase engagement",
  "isPaid": false
}
```

**Response:**
```json
{
  "success": true,
  "calendar": [
    {
      "day": "Day 1",
      "platform": "Instagram",
      "postIdea": "Share a behind-the-scenes...",
      "type": "Behind-the-scenes",
      "time": "9:00 AM"
    }
  ]
}
```

---

### POST /api/checkout
Create a Stripe checkout session for $7.99.

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

---

### POST /api/webhook
Stripe webhook for payment verification.

**Events handled:**
- `checkout.session.completed` — Payment successful

---

### POST /api/download
Generate CSV file from calendar data.

**Request:**
```json
{
  "calendar": [...],
  "business": "Digital marketing agency"
}
```

**Response:**
- CSV file with headers: Day, Date, Platform, Type, Post Copy, Hashtags, Time, Theme

---

## Design System

### Colors (Dark Theme)
```css
--bg: #09090b;                    /* Page background */
--surface: #18181b;               /* Cards, containers */
--surface-elevated: #1f1f23;      /* Hover states, inputs */
--border: #27272a;                /* Dividers */
--text-primary: #fafafa;          /* Body text */
--text-secondary: #a1a1aa;        /* Subtext */
--accent: #6d28d9;                /* Buttons, highlights */
--accent-light: #8b5cf6;          /* Hover states */
--success: #22c55e;               /* Check marks */
```

### Typography
- **Headings:** Inter, 700 weight
- **Body:** Inter, 400 weight
- **Code:** JetBrains Mono

### Animations
- `fade-up`: Entrance (0.6s)
- `fade-in`: Opacity (0.6s)
- `spin`: Loader rotation
- `pulse`: Pulsing effect
- `.stagger-children`: Delayed child animations

---

## Configuration

### Environment Variables (Required)

| Variable | Source | Example |
|----------|--------|---------|
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com) | `sk-ant-...` |
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com) | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhooks | `whsec_...` |
| `NEXT_PUBLIC_BASE_URL` | Your domain | `https://content-calendar-ai.vercel.app` |

### Stripe Setup
1. Create a Product: "30-Day Content Calendar (Full)"
2. Set Price: $7.99 USD, one-time payment
3. Add Webhook endpoint: `/api/webhook`
4. Select event: `checkout.session.completed`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step.

---

## Rate Limiting

### Free Tier
- **Limit:** 3 requests per hour per IP
- **Window:** Hourly reset
- **Implementation:** In-memory Map with auto-cleanup

### Upgrade
- Purchase $7.99 calendar for unlimited generations (per session)

### Disable (Development Only)
Edit `app/api/generate/route.ts`:
```typescript
// Comment out rate check
// if (!isPaid) {
//   const { allowed } = checkRateLimit(ip);
//   ...
// }
```

---

## AI Generation

### Free Tier Prompt
Generates 7 days of content for 1 platform:
- Post idea (2-3 sentences)
- Content type (Educational, Promotional, Tutorial, etc.)
- Suggested posting time
- Returns JSON array

### Paid Tier Prompt
Generates 30 days for all 5 platforms:
- Full post copy (platform-specific)
- 5-10 relevant hashtags
- Best posting time for platform
- Content type and monthly theme
- Returns JSON with calendar + themes array

### Model
- **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`)
- Fast (< 5s response time)
- Cheap (~$0.01 per 30-day calendar)
- Sufficient quality for content ideas

---

## Cost Analysis

### Vercel (Free Tier)
- 100GB bandwidth/month
- 100K serverless functions/month
- Web Analytics included

### Stripe
- 2.9% + $0.30 per successful transaction
- Example: $7.99 → $5.00 profit (after fee)

### Anthropic
- ~$0.01 per 30-day calendar (using Haiku)
- Break-even: ~2 sales/month

### Monthly Profit Estimate
- 10 sales/month: ~$47 profit (10 × $5 - API costs)
- 50 sales/month: ~$240 profit
- 100 sales/month: ~$490 profit

---

## Monitoring & Maintenance

### Daily
- Check Vercel error logs
- Monitor Stripe transaction success rate
- Review rate limit status

### Weekly
- Check analytics in Vercel dashboard
- Review user feedback
- Monitor API costs

### Monthly
- Update dependencies: `npm update`
- Iterate on prompts
- A/B test landing page copy

### Debugging
```bash
# View Vercel logs
vercel logs --follow

# Check Stripe webhooks
# Dashboard → Developers → Webhooks → Logs

# Test locally with Stripe CLI
stripe listen --forward-to localhost:3000/api/webhook
stripe trigger checkout.session.completed
```

---

## Testing

### Free Tier
1. Fill form with sample data
2. Click "Generate free preview"
3. Verify 7-day calendar displays
4. Submit 3 times (verify rate limit on 4th)

### Paid Tier
1. Fill form and click "Get full calendar"
2. Use Stripe test card: `4242 4242 4242 4242`
3. Verify redirected to /success
4. Verify 30-day calendar generates
5. Test platform filter tabs
6. Download CSV and verify in Excel

### Edge Cases
- Empty business name (should fail)
- Very long inputs (should truncate)
- Missing API keys (should show error)
- Stripe API downtime (should show error)

---

## Customization

### Change Pricing
Edit `app/api/checkout/route.ts` line 20:
```typescript
unit_amount: 1199, // $11.99
```

### Change Free Tier Limit
Edit `lib/rate-limit.ts` line 7:
```typescript
const REQUESTS_PER_HOUR = 5;
```

### Add Platform
Edit `app/page.tsx` line ~137:
```jsx
<option value="YouTube">YouTube</option>
```

### Customize Prompts
Edit `lib/anthropic.ts` in `generateFreeCalendar()` or `generateFullCalendar()`.

### Change Colors
Edit `app/globals.css` CSS custom properties at top.

---

## Deployment

### Quick Deploy to Vercel
```bash
vercel
```

Then configure:
1. GitHub integration (optional)
2. Environment variables
3. Stripe webhook endpoint

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide.

---

## Next Steps

1. **Local testing:** Verify free & paid tiers work
2. **Deploy:** Push to Vercel
3. **Stripe webhook:** Add endpoint in Stripe dashboard
4. **SEO:** Submit to Google Search Console
5. **Promotion:** Post on Reddit, Twitter, LinkedIn
6. **Iterate:** Improve based on feedback

---

## Cross-Promotion

Every page links to other Velocity Forge tools:

- **Pitch Deck Generator:** https://pitch-deck-ai-nine.vercel.app
- **Cover Letter Generator:** https://cover-letter-ai-one.vercel.app
- **Content Calendar (this):** https://content-calendar-ai.vercel.app

---

## Resources

- **Docs:** [ARCHITECTURE.md](./ARCHITECTURE.md), [DEPLOYMENT.md](./DEPLOYMENT.md), [QUICK_START.md](./QUICK_START.md)
- **Next.js:** https://nextjs.org/docs
- **Stripe:** https://stripe.com/docs/checkout
- **Anthropic:** https://docs.anthropic.com
- **Vercel:** https://vercel.com/docs

---

## Support

**Email:** mudcrabwarrior@gmail.com
**Gumroad:** https://velocityforgeai.gumroad.com
**Brand:** Velocity Forge AI

---

## License

All code and content © 2025 Velocity Forge AI. All rights reserved.

---

**Built with Velocity Forge AI tools.** Create Faster. Think Smarter. Scale Higher.
