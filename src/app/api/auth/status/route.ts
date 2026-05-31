import { NextResponse } from "next/server";
import { bootstrapAuthEnv, getGoogleCredentials } from "@/lib/auth-env";

export const runtime = "nodejs";

/** Trạng thái cấu hình auth — client dùng để hiển thị nút Google */
export async function GET() {
  bootstrapAuthEnv();
  const { clientId, clientSecret } = getGoogleCredentials();
  return NextResponse.json({
    google: Boolean(clientId && clientSecret),
    hasClientId: Boolean(clientId),
    hasClientSecret: Boolean(clientSecret),
    hasSecret: Boolean(process.env.NEXTAUTH_SECRET),
    url: process.env.NEXTAUTH_URL ?? null,
  });
}
