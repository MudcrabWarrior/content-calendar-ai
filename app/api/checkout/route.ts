import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { business, audience, platform, goals } = await request.json();

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: '30-Day Content Calendar (Full)',
              description:
                'Full 30-day calendar for all social media platforms with post copy, hashtags, best posting times, and content themes.',
              images: ['https://content-calendar-ai.vercel.app/calendar-icon.png'],
            },
            unit_amount: 799, // $7.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}`,
      metadata: {
        business: business || 'unknown',
        audience: audience || 'unknown',
        platform: platform || 'unknown',
        goals: goals || 'unknown',
      },
      customer_email: undefined,
    });

    if (!session.url) {
      throw new Error('No checkout URL returned from Stripe');
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}
