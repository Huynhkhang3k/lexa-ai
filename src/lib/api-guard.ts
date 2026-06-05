import { checkRateLimit, getClientIp, rateLimitResponse, rateLimitHeaders } from "@/lib/rate-limit";

const CHAT_LIMIT = 20;

/** Áp dụng giới hạn request cho API AI — trả Response nếu bị chặn, null nếu OK */
export function applyAiRateLimit(req: Request, route: string, limit = CHAT_LIMIT) {
  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent")?.trim();
  if (process.env.NODE_ENV === "production" && !ua) {
    return new Response(JSON.stringify({ error: "Yêu cầu không hợp lệ." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = checkRateLimit(`${route}:${ip}`, limit, 60_000);
  if (!result.ok) return rateLimitResponse(result.retryAfterSec, result.limit);
  return null;
}

/** Chặn POST từ origin lạ trên production */
export function assertAllowedOrigin(req: Request): Response | null {
  if (process.env.NODE_ENV !== "production") return null;

  const origin = req.headers.get("origin");
  if (!origin) return null;

  const allowed = new Set<string>([
    "https://lexa-ai-beryl.vercel.app",
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter(Boolean) as string[]);

  if (allowed.has(origin)) return null;

  return new Response(JSON.stringify({ error: "Origin không được phép." }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}
