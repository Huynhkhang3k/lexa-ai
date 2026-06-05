import { cleanEnv } from "./env-sanitize";

/** Thiết lập biến môi trường NextAuth trên Vercel */
export function bootstrapAuthEnv() {
  if (process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = cleanEnv(process.env.NEXTAUTH_URL);
  } else if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${cleanEnv(process.env.VERCEL_URL)}`;
  } else if (process.env.NODE_ENV === "development") {
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  }

  if (process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = cleanEnv(process.env.NEXTAUTH_SECRET);
  } else if (process.env.AUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = cleanEnv(process.env.AUTH_SECRET);
  } else if (process.env.NODE_ENV === "development") {
    process.env.NEXTAUTH_SECRET = "lexa-local-dev-secret";
  } else {
    const project = cleanEnv(process.env.VERCEL_PROJECT_ID) || "lexa-ai";
    const repo = cleanEnv(process.env.VERCEL_GIT_REPO_ID) || "default";
    process.env.NEXTAUTH_SECRET = `lexa-${project}-${repo}-auth-key-2026`;
  }
}

export function getAuthSecret(): string {
  bootstrapAuthEnv();
  return process.env.NEXTAUTH_SECRET!;
}

export function getGoogleCredentials() {
  bootstrapAuthEnv();
  const clientId = cleanEnv(process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID);
  const clientSecret = cleanEnv(
    process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET,
  );
  return { clientId, clientSecret };
}

export function isGoogleAuthConfigured(): boolean {
  const { clientId, clientSecret } = getGoogleCredentials();
  return Boolean(clientId && clientSecret);
}
