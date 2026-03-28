# Deployment Guide — Content Calendar AI

## Quick Start

### 1. Local Development

```bash
# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Update environment variables in .env.local with:
# - ANTHROPIC_API_KEY (from Anthropic console)
# - STRIPE_SECRET_KEY (from Stripe dashboard)
# - STRIPE_PUBLISHABLE_KEY (from Stripe dashboard)
# - STRIPE_WEBHOOK_SECRET (from Stripe webhook endpoint)

# Run dev server
npm run dev

# App runs on http://localhost:3000
```

### 2. Build & Test

```bash
npm run build
npm start
```

### 3. Deploy to Vercel

#### Option A: Git Push (Recommended)

```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys from main branch
# (setup in Vercel dashboard)
```

#### Option B: Vercel CLI

```bash
npm i -g vercel
vercel

# Follow prompts to connect to Vercel
# Select "Yes" to set up environment variables
# Paste environment variable values when prompted
```

#### Option C: Vercel Dashboard

1. Visit [vercel.com](https://vercel.com)
2. Create new project
3. Import Git repository
4. Add environment variables under Settings → Environment Variables
5. Click Deploy

## Environment Variables

### Required for Production

| Variable | Value | Source |
|----------|-------|--------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | [Anthropic Console](https://console.anthropic.com) |
| `STRIPE_SECRET_KEY` | `sk_live_...` | [Stripe Dashboard](https://dashboard.stripe.com) → API Keys |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe Dashboard → Webhooks |
| `NEXT_PUBLIC_BASE_URL` | `https://content-calendar-ai.vercel.app` | Your deployed URL |

### How to Get Each Key

#### Anthropic API Key
1. Go to https://console.anthropic.com
2. Click "API Keys" in left sidebar
3. Click "Create Key"
4. Copy the key (starts with `sk-ant-`)
5. Paste into `ANTHROPIC_API_KEY`

#### Stripe Keys
1. Go to https://dashboard.stripe.com
2. Click "Developers" in left sidebar
3. Click "API Keys"
4. Copy `Secret key` → `STRIPE_SECRET_KEY`
5. Copy `Publishable key` → `STRIPE_PUBLISHABLE_KEY`

#### Stripe Webhook Secret
1. In Stripe Dashboard, go to Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://content-calendar-ai.vercel.app/api/webhook`
4. Events to send: Select `checkout.session.completed`
5. Copy the signing secret → `STRIPE_WEBHOOK_SECRET`

## Stripe Setup

### Create a Product and Price

1. Go to Stripe Dashboard → Products
2. Click "Create Product"
3. Name: "30-Day Content Calendar (Full)"
4. Description: "Full 30-day calendar for all social media platforms..."
5. Price: $7.99 USD
6. Billing period: One-time payment
7. Click "Create product"

### Update Code (Optional)

The API uses a hardcoded price of 799 cents ($7.99). To use a dynamic Stripe price ID:

1. Copy the Price ID from your Stripe product
2. Add to environment variables: `STRIPE_PRICE_ID=price_xxx`
3. Update `/app/api/checkout/route.ts` to use `process.env.STRIPE_PRICE_ID`

## Vercel Configuration

### Performance Settings

- **Edge Functions:** Enabled (free tier)
- **Serverless Functions:** Enabled (free tier)
- **Auto Scaling:** Enabled

### Domain Setup

1. In Vercel Dashboard, go to Settings → Domains
2. Add custom domain (optional): `content-calendar-ai.com` (must be registered)
3. Or use default: `content-calendar-ai.vercel.app`

### Analytics

Vercel provides free Web Analytics:

1. Go to Settings → Analytics
2. Enable Web Analytics
3. View metrics at: https://vercel.com/dashboard

## Monitoring & Maintenance

### Health Checks

- **API Status:** Monitor `/api/generate` latency
- **Stripe Webhooks:** Check Stripe Dashboard → Webhooks → Logs
- **Error Logs:** Check Vercel Deployments → Logs

### Common Issues

| Issue | Solution |
|-------|----------|
| 429 Rate Limit | Free tier allows 3 requests/hour per IP. Upgrade for more. |
| Stripe checkout fails | Verify `STRIPE_PUBLISHABLE_KEY` and webhook endpoint URL |
| AI generation slow | Check Anthropic API status at status.anthropic.com |
| Build fails | Run `npm install` locally, commit lock file, push again |

### Debugging

```bash
# View Vercel logs
vercel logs --follow

# Check for errors in Stripe
# Dashboard → Webhooks → Logs

# Check Anthropic API status
# https://status.anthropic.com
```

## Cost Estimation

### Vercel (Free Tier)
- 100GB bandwidth/month
- 100K serverless function invocations/month
- Web Analytics included

### Stripe
- 2.9% + $0.30 per successful transaction
- Example: $7.99 payment = $0.53 fee

### Anthropic
- ~$0.25/million input tokens
- ~$1.25/million output tokens
- Estimated cost per 30-day calendar: ~$0.01

### Monthly Breakeven
At $7.99 per calendar, with 80% success rate:
- 1 sale = ~$5.00 profit after Stripe fee
- Need ~2 sales/month to cover API costs (~$0.02)

## Deployment Checklist

- [ ] Environment variables configured in Vercel
- [ ] Stripe product and price created
- [ ] Stripe webhook endpoint added
- [ ] Custom domain registered and configured (optional)
- [ ] Email support configured (mudcrabwarrior@gmail.com)
- [ ] Cross-links to other tools verified
- [ ] Free tier rate limiting tested
- [ ] Paid checkout flow tested end-to-end
- [ ] CSV download tested
- [ ] Success page loads and generates calendar
- [ ] Error handling tested
- [ ] Google Search Console verified (SEO)

## Post-Deployment

1. **Submit to Search Engines**
   - Google Search Console: Add site → Wait for indexing
   - Bing Webmaster Tools: Add site

2. **Monitor Performance**
   - Check daily analytics in Vercel dashboard
   - Monitor Stripe transaction success rate
   - Track user feedback

3. **Iterate**
   - Improve prompts based on user feedback
   - Add new platforms or features
   - Optimize landing page copy

## Support & Maintenance

- **Email:** mudcrabwarrior@gmail.com
- **Gumroad:** velocityforgeai.gumroad.com
- **Monitoring:** Set up Sentry for error tracking (optional)

## Rollback

If deployment breaks:

```bash
# View recent deployments
vercel deployments

# Rollback to previous deployment
vercel rollback [deployment-url]
```
