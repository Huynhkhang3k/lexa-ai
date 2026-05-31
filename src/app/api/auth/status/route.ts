import { NextResponse } from "next/server";
import { bootstrapAuthEnv, isGoogleAuthConfigured } from "@/lib/auth-env";

export const runtime = "nodejs";

/** Trạng thái cấu hình auth — client dùng để hiển thị nút Google */
export async function GET() {
  bootstrapAuthEnv();
  return NextResponse.json({
    google: isGoogleAuthConfigured(),
    hasSecret: Boolean(process.env.NEXTAUTH_SECRET),
    url: process.env.NEXTAUTH_URL ?? null,
  });
}
