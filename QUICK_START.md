# Quick Start Guide

## 5-Minute Setup

### 1. Clone & Install (1 min)
```bash
cd content-calendar-ai
npm install
```

### 2. Configure Environment (2 min)
```bash
cp .env.example .env.local
```

Edit `.env.local` and add:
```env
ANTHROPIC_API_KEY=sk-ant-...  # From anthropic.com/console
STRIPE_SECRET_KEY=sk_live_... # From stripe.com/dashboard
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Run Dev Server (2 min)
```bash
npm run dev
```

Open http://localhost:3000

---

## Testing the Tool

### Free Tier (No Payment)
1. Fill in form:
   - Business: "Digital marketing agency"
   - Audience: "Entrepreneurs"
   - Platform: "Instagram"
   - Goals: "Drive engagement"
2. Click "Generate free preview"
3. See 7-day calendar

### Paid Tier (Stripe Sandbox)
1. Fill form and scroll down
2. Click "Get full calendar — $7.99"
3. Use Stripe test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. Click "Pay $7.99"
7. See 30-day full calendar on success page

---

## Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Landing page, form, FAQ |
| `app/success/page.tsx` | Post-payment calendar display |
| `app/api/generate/route.ts` | AI generation logic |
| `app/api/checkout/route.ts` | Stripe session creation |
| `lib/anthropic.ts` | Claude API integration |
| `lib/stripe.ts` | Stripe client |
| `lib/rate-limit.ts` | Rate limiting |

---

## Common Tasks

### Change Pricing
Edit `app/api/checkout/route.ts`, line ~20:
```typescript
unit_amount: 1199, // Change to 1199 for $11.99
```

### Change Free Tier Limit
Edit `lib/rate-limit.ts`, line ~7:
```typescript
const REQUESTS_PER_HOUR = 5; // Change from 3 to 5
```

### Add a New Platform
Edit `app/page.tsx`, line ~137:
```jsx
<option value="YouTube">YouTube</option> // Add this
```

And update `lib/anthropic.ts` when generating full calendar.

### Customize Claude Prompt
Edit `lib/anthropic.ts` in `generateFreeCalendar()` or `generateFullCalendar()` functions.

**Tips:**
- Be specific about format (JSON required)
- Include examples in prompt
- Test locally first

---

## Deployment (10 min)

### To Vercel
```bash
npm i -g vercel
vercel
```

Then add environment variables in Vercel dashboard:
- ANTHROPIC_API_KEY
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_BASE_URL (set to your Vercel URL)

### Stripe Webhook Setup
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhook`
3. Select event: `checkout.session.completed`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

---

## Debugging

### Check if Claude is working
```bash
# In app/api/generate/route.ts, add:
console.log('Generated calendar:', calendar);
```

### Check if Stripe is working
```bash
# In app/api/checkout/route.ts, add:
console.log('Session created:', session.id);
```

### View Vercel logs
```bash
vercel logs --follow
```

### Check rate limiting
The rate limiter is in `lib/rate-limit.ts`. To disable it:
```typescript
// Comment out rate limit check
// if (!isPaid) {
//   const { allowed } = checkRateLimit(ip);
//   if (!allowed) return ...
// }
```

---

## Common Issues

### "ANTHROPIC_API_KEY is not defined"
- Copy your key from https://console.anthropic.com/account/keys
- Paste into `.env.local`
- Restart dev server

### "STRIPE_SECRET_KEY is not defined"
- Get from https://dashboard.stripe.com/apikeys
- Copy the "Secret key" (not publishable key)
- Paste into `.env.local`
- Restart dev server

### "Rate limit exceeded"
- Free tier allows 3 requests/hour
- Wait 1 hour or change limit in `lib/rate-limit.ts`
- Or upgrade to paid tier

### "Stripe checkout page blank"
- Check STRIPE_PUBLISHABLE_KEY is correct
- Make sure NEXT_PUBLIC_BASE_URL includes protocol (https://)
- Check Stripe is in test or live mode (must match key prefix)

### "Claude API times out"
- Check https://status.anthropic.com
- Try shorter prompt
- Check API key has credits

---

## Env Variables Checklist

Before deploying to Vercel, ensure all are set:

- [ ] ANTHROPIC_API_KEY (starts with `sk-ant-`)
- [ ] STRIPE_SECRET_KEY (starts with `sk_live_` or `sk_test_`)
- [ ] STRIPE_PUBLISHABLE_KEY (starts with `pk_live_` or `pk_test_`)
- [ ] STRIPE_WEBHOOK_SECRET (starts with `whsec_`)
- [ ] NEXT_PUBLIC_BASE_URL (your Vercel domain)

Missing any? The app will fail at runtime.

---

## Next Steps

1. **Test locally**: Verify free & paid tiers work
2. **Deploy to Vercel**: Push to git or use `vercel` CLI
3. **Set up Stripe webhook**: Add webhook endpoint in Stripe dashboard
4. **Submit to SEO**: Add to Google Search Console
5. **Promote**: Post on Reddit, Twitter, LinkedIn
6. **Iterate**: Improve prompts based on feedback

---

## Support

- Email: mudcrabwarrior@gmail.com
- Architecture docs: See `ARCHITECTURE.md`
- Deployment guide: See `DEPLOYMENT.md`

Happy building!
