interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const REQUESTS_PER_HOUR = 3;
const HOUR_IN_MS = 60 * 60 * 1000;

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    // First request from this IP
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + HOUR_IN_MS,
    });
    return { allowed: true, remaining: REQUESTS_PER_HOUR - 1 };
  }

  if (now > entry.resetTime) {
    // Hour has passed, reset
    entry.count = 1;
    entry.resetTime = now + HOUR_IN_MS;
    return { allowed: true, remaining: REQUESTS_PER_HOUR - 1 };
  }

  if (entry.count >= REQUESTS_PER_HOUR) {
    // Rate limited
    return { allowed: false, remaining: 0 };
  }

  // Increment and allow
  entry.count += 1;
  return { allowed: true, remaining: REQUESTS_PER_HOUR - entry.count };
}

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, HOUR_IN_MS);
