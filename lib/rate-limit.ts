type Bucket = { count: number; resetAt: number };

// In-memory, per-isolate best-effort limiter. Resets on cold start and isn't
// shared across regions/instances, but stops a single sustained client from
// hammering Supabase/Vercel image optimization within a warm instance.
const buckets = new Map<string, Bucket>();

const MAX_TRACKED_KEYS = 5000;

function prune(now: number) {
  if (buckets.size < MAX_TRACKED_KEYS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  prune(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count < limit) {
    existing.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return headers.get('x-real-ip') ?? 'unknown';
}
