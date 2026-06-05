import type { GradeLevelId } from "./grade-level";
import { GRADE_LEVEL_STORAGE_KEY, isValidGradeLevel } from "./grade-level";
import { getActivityState } from "./user-activity";
import { getUserHistory } from "./user-history";
import { getUserProfile } from "./user-profile";
import { CACHE_PREFIX, OFFLINE_QUEUE_KEY, type SyncMeta } from "./user-sync-meta";
import type { UserSyncPayload } from "./user-sync-types";
import { USER_SYNC_VERSION } from "./user-sync-types";

export type SyncStatus = "idle" | "syncing" | "synced" | "offline" | "error";

export type ClientSyncState = {
  status: SyncStatus;
  lastSyncedAt: string | null;
  lastError: string | null;
  loggedIn: boolean;
  pendingOffline: boolean;
  serverMeta: SyncMeta | null;
};

let serverPrimary = false;
let syncing = false;
let lastSyncedAt: string | null = null;
let lastError: string | null = null;
let serverMeta: SyncMeta | null = null;

const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

export function subscribeSyncState(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function setServerPrimaryMode(enabled: boolean) {
  serverPrimary = enabled;
  notify();
}

export function isServerPrimaryMode() {
  return serverPrimary;
}

export function getClientSyncState(): ClientSyncState {
  return {
    status: syncing
      ? "syncing"
      : lastError
        ? "error"
        : pendingOffline()
          ? "offline"
          : lastSyncedAt
            ? "synced"
            : "idle",
    lastSyncedAt,
    lastError,
    loggedIn: serverPrimary,
    pendingOffline: pendingOffline(),
    serverMeta,
  };
}

function deviceLabel() {
  if (typeof navigator === "undefined") return "server";
  const ua = navigator.userAgent;
  if (/Mobile|Android|iPhone/i.test(ua)) return "mobile";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  return "desktop";
}

function cacheKey(email: string) {
  return `${CACHE_PREFIX}:${email.toLowerCase()}`;
}

export function collectLocalSyncPayload(): UserSyncPayload {
  return {
    version: USER_SYNC_VERSION,
    updatedAt: new Date().toISOString(),
    profile: getUserProfile(),
    activity: getActivityState(),
    history: getUserHistory(),
    gradeLevel: readGradeLevelLocal(),
  };
}

function readGradeLevelLocal(): GradeLevelId | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(GRADE_LEVEL_STORAGE_KEY);
  return isValidGradeLevel(stored) ? stored : null;
}

/** Ghi cache tạm — không phải nguồn dữ liệu chính khi đã đăng nhập */
export function writeLocalCache(email: string, payload: UserSyncPayload) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(cacheKey(email), JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

export function readLocalCache(email: string): UserSyncPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(email));
    if (!raw) return null;
    return JSON.parse(raw) as UserSyncPayload;
  } catch {
    return null;
  }
}

function pendingOffline(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(OFFLINE_QUEUE_KEY));
}

function saveOfflineQueue(payload: UserSyncPayload) {
  if (typeof window === "undefined") return;
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(payload));
  notify();
}

function clearOfflineQueue() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
  notify();
}

function readOfflineQueue(): UserSyncPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSyncPayload;
  } catch {
    return null;
  }
}

export async function pullUserDataFromServer(email: string): Promise<UserSyncPayload | null> {
  syncing = true;
  lastError = null;
  notify();

  try {
    const res = await fetch("/api/user/sync", { credentials: "include" });
    if (!res.ok) {
      if (res.status === 401) return null;
      throw new Error("Không tải được dữ liệu từ máy chủ.");
    }

    const json = (await res.json()) as {
      data?: UserSyncPayload;
      meta?: SyncMeta;
    };

    if (json.meta) serverMeta = json.meta;
    if (json.data) {
      writeLocalCache(email, json.data);
      lastSyncedAt = json.data.updatedAt;
    }

    return json.data ?? null;
  } catch (e) {
    lastError = e instanceof Error ? e.message : "Lỗi đồng bộ";
    return readLocalCache(email);
  } finally {
    syncing = false;
    notify();
  }
}

export async function pushUserDataToServer(
  payload?: UserSyncPayload,
  email?: string,
): Promise<boolean> {
  if (!serverPrimary) return false;
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const data = payload ?? collectLocalSyncPayload();
    saveOfflineQueue(data);
    return false;
  }

  syncing = true;
  lastError = null;
  notify();

  try {
    const data = {
      ...(payload ?? collectLocalSyncPayload()),
      updatedAt: new Date().toISOString(),
    };

    const res = await fetch("/api/user/sync", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, device: deviceLabel() }),
    });

    if (!res.ok) {
      throw new Error("Không lưu được dữ liệu lên máy chủ.");
    }

    const json = (await res.json()) as { data?: UserSyncPayload; meta?: SyncMeta };
    if (json.data) {
      lastSyncedAt = json.data.updatedAt;
      if (email) writeLocalCache(email, json.data);
    }
    if (json.meta) serverMeta = json.meta;

    clearOfflineQueue();
    return true;
  } catch (e) {
    lastError = e instanceof Error ? e.message : "Lỗi lưu dữ liệu";
    saveOfflineQueue(payload ?? collectLocalSyncPayload());
    return false;
  } finally {
    syncing = false;
    notify();
  }
}

export async function flushOfflineQueue(email?: string): Promise<boolean> {
  const queued = readOfflineQueue();
  if (!queued || !serverPrimary) return false;
  const ok = await pushUserDataToServer(queued, email);
  if (ok) clearOfflineQueue();
  return ok;
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;
let chatTimer: ReturnType<typeof setTimeout> | null = null;

/** Ghi ngay lên server — dùng sau test, luyện tập, chọn nghề */
export function persistUserDataImmediate(email?: string) {
  if (!serverPrimary) return;
  if (persistTimer) clearTimeout(persistTimer);
  void pushUserDataToServer(undefined, email);
}

/** Debounce nhẹ cho chat (tránh spam API) */
export function persistUserDataDebounced(email?: string, ms = 2000) {
  if (!serverPrimary) return;
  if (chatTimer) clearTimeout(chatTimer);
  chatTimer = setTimeout(() => {
    chatTimer = null;
    void pushUserDataToServer(undefined, email);
  }, ms);
}

export function initServerDataListeners(email: string | null) {
  if (typeof window === "undefined") return () => {};

  const onOnline = () => {
    if (email) void flushOfflineQueue(email);
  };

  const onBeforeUnload = () => {
    if (!serverPrimary || !navigator.onLine) return;
    const payload = collectLocalSyncPayload();
    try {
      navigator.sendBeacon(
        "/api/user/sync",
        new Blob(
          [JSON.stringify({ data: payload, device: deviceLabel() })],
          { type: "application/json" },
        ),
      );
    } catch {
      /* ignore */
    }
  };

  window.addEventListener("online", onOnline);
  window.addEventListener("beforeunload", onBeforeUnload);

  return () => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("beforeunload", onBeforeUnload);
    if (persistTimer) clearTimeout(persistTimer);
    if (chatTimer) clearTimeout(chatTimer);
  };
}
