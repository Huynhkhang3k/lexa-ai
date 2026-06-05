import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserSyncData, mergeUserSync, saveUserSyncData } from "@/lib/user-sync-store";
import { emptyUserSyncPayload } from "@/lib/user-sync-types";
import type { PracticeRecord } from "@/lib/user-history";

export const runtime = "nodejs";

type Body = Omit<PracticeRecord, "id" | "at">;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ ok: false, reason: "anonymous" }, { status: 200 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const record: PracticeRecord = {
    ...body,
    id: `pr-${Date.now()}`,
    at: new Date().toISOString(),
  };

  const existing = (await getUserSyncData(userId)) ?? emptyUserSyncPayload();
  const history = existing.history;
  history.practiceHistory = [record, ...history.practiceHistory].slice(0, 40);

  const merged = mergeUserSync(existing, {
    ...existing,
    history,
    updatedAt: new Date().toISOString(),
  });

  await saveUserSyncData(userId, merged);
  return NextResponse.json({ ok: true, record });
}
