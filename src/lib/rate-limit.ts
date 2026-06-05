/** Giới hạn số request theo IP — tránh spam API AI */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(
  key: string,
  limit = 30,
  windowMs = 60_000,
):
  | { ok: true; remaining: number; limit: number; resetAt: number }
  | { ok: false; retryAfterSec: number; limit: number } {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, limit, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000), limit };
  }

  entry.count += 1;
  return {
    ok: true,
    remaining: Math.max(0, limit - entry.count),
    limit,
    resetAt: entry.resetAt,
  };
}

export function rateLimitHeaders(
  limit: number,
  remaining: number,
  resetAt?: number,
): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
  };
  if (resetAt) {
    headers["X-RateLimit-Reset"] = String(Math.ceil(resetAt / 1000));
  }
  return headers;
}

export function rateLimitResponse(retryAfterSec: number, limit = 25) {
  return new Response(
    JSON.stringify({
      error: `Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfterSec} giây.`,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
        ...rateLimitHeaders(limit, 0),
      },
    },
  );
}
