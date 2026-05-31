/** Thiết lập biến môi trường NextAuth trên Vercel (không cần Firebase) */
export function bootstrapAuthEnv() {
  if (!process.env.NEXTAUTH_URL) {
    if (process.env.VERCEL_URL) {
      process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
    } else if (process.env.NODE_ENV === "development") {
      process.env.NEXTAUTH_URL = "http://localhost:3000";
    }
  }

  if (!process.env.NEXTAUTH_SECRET) {
    if (process.env.AUTH_SECRET) {
      process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET;
    } else if (process.env.NODE_ENV === "development") {
      process.env.NEXTAUTH_SECRET = "lexa-local-dev-secret";
    } else {
      // Khóa ổn định theo project Vercel — tránh lỗi "Server error" khi chưa kịp thêm env
      const project = process.env.VERCEL_PROJECT_ID ?? "lexa-ai";
      const repo = process.env.VERCEL_GIT_REPO_ID ?? "default";
      process.env.NEXTAUTH_SECRET = `lexa-${project}-${repo}-auth-key-2026`;
    }
  }
}

export function getAuthSecret(): string {
  bootstrapAuthEnv();
  return process.env.NEXTAUTH_SECRET!;
}

export function getGoogleCredentials() {
  bootstrapAuthEnv();
  const clientId =
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    process.env.AUTH_GOOGLE_ID?.trim() ||
    "";
  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET?.trim() ||
    process.env.AUTH_GOOGLE_SECRET?.trim() ||
    "";
  return { clientId, clientSecret };
}

export function isGoogleAuthConfigured(): boolean {
  const { clientId, clientSecret } = getGoogleCredentials();
  return Boolean(clientId && clientSecret);
}
