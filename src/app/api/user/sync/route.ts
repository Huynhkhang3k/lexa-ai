import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  getStorageBackend,
  getUserSyncData,
  mergeUserSync,
  saveUserSyncData,
} from "@/lib/user-sync-store";
import { countSyncData } from "@/lib/user-sync-meta";
import type { UserSyncPayload } from "@/lib/user-sync-types";
import { USER_SYNC_VERSION, emptyUserSyncPayload } from "@/lib/user-sync-types";

export const runtime = "nodejs";

function isValidPayload(data: unknown): data is UserSyncPayload {
  if (!data || typeof data !== "object") return false;
  const p = data as UserSyncPayload;
  return p.version === USER_SYNC_VERSION || p.version === 1;
}

async function requireUserId() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;
  return userId;
}

function buildMeta(data: UserSyncPayload, device?: string) {
  return {
    lastSyncedAt: data.updatedAt,
    lastSyncDevice: device ?? null,
    pendingOffline: false,
    storageBackend: getStorageBackend(),
    counts: countSyncData(data.profile, data.history, data.activity),
  };
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Cần đăng nhập để đồng bộ dữ liệu." }, { status: 401 });
  }

  const data = (await getUserSyncData(userId)) ?? emptyUserSyncPayload();
  return NextResponse.json({ data, meta: buildMeta(data) });
}

async function handleSave(req: Request, device?: string) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Cần đăng nhập để đồng bộ dữ liệu." }, { status: 401 });
  }

  let body: { data?: UserSyncPayload; device?: string };
  try {
    body = (await req.json()) as { data?: UserSyncPayload; device?: string };
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const incoming = body.data;
  if (!isValidPayload(incoming)) {
    return NextResponse.json({ error: "Dữ liệu đồng bộ không hợp lệ." }, { status: 400 });
  }

  const existing = (await getUserSyncData(userId)) ?? emptyUserSyncPayload();
  const merged = mergeUserSync(existing, {
    ...incoming,
    version: USER_SYNC_VERSION,
    updatedAt: new Date().toISOString(),
  });

  await saveUserSyncData(userId, merged);
  const dev = device ?? body.device;
  return NextResponse.json({ data: merged, ok: true, meta: buildMeta(merged, dev) });
}

export async function PUT(req: Request) {
  return handleSave(req);
}

/** sendBeacon khi đóng tab — lưu nhanh dữ liệu học tập */
export async function POST(req: Request) {
  return handleSave(req);
}
