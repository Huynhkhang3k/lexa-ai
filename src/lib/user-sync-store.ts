import { promises as fs } from "fs";
import path from "path";
import { head, put } from "@vercel/blob";
import type { UserSyncPayload } from "./user-sync-types";
import { USER_SYNC_VERSION, emptyUserSyncPayload } from "./user-sync-types";
import { isValidGradeLevel } from "./grade-level";

declare global {
  // eslint-disable-next-line no-var
  var __lexaUserSync: Map<string, UserSyncPayload> | undefined;
}

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = path.join(process.cwd(), "data");
const SYNC_FILE = IS_VERCEL
  ? path.join("/tmp", "lexa-user-sync.json")
  : path.join(DATA_DIR, "user-sync.json");

function blobPath(userId: string) {
  return `lexa-user-sync/${userId}.json`;
}

function useBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function getStorageBackend(): "blob" | "file" | "memory" {
  if (useBlob()) return "blob";
  if (IS_VERCEL) return "memory";
  return "file";
}

function memoryStore(): Map<string, UserSyncPayload> {
  if (!global.__lexaUserSync) {
    global.__lexaUserSync = new Map();
  }
  return global.__lexaUserSync;
}

function normalizePayload(raw: unknown): UserSyncPayload | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const p = raw as Partial<UserSyncPayload>;
  if (p.version !== USER_SYNC_VERSION && p.version !== 1) return null;
  return {
    version: USER_SYNC_VERSION,
    updatedAt: typeof p.updatedAt === "string" ? p.updatedAt : new Date(0).toISOString(),
    profile: p.profile && typeof p.profile === "object" ? p.profile : {},
    activity:
      p.activity && typeof p.activity === "object" && !Array.isArray(p.activity)
        ? {
            used: Array.isArray(p.activity.used) ? p.activity.used : [],
            snapshots:
              p.activity.snapshots && typeof p.activity.snapshots === "object"
                ? p.activity.snapshots
                : {},
            careerMap: p.activity.careerMap ?? null,
            analyzedKey:
              typeof p.activity.analyzedKey === "string" ? p.activity.analyzedKey : null,
            mapSchemaVersion: p.activity.mapSchemaVersion,
          }
        : emptyUserSyncPayload().activity,
    history:
      p.history && typeof p.history === "object" && !Array.isArray(p.history)
        ? {
            testAttempts: Array.isArray(p.history.testAttempts) ? p.history.testAttempts : [],
            translateHistory: Array.isArray(p.history.translateHistory)
              ? p.history.translateHistory
              : [],
            chatSessions: Array.isArray(p.history.chatSessions) ? p.history.chatSessions : [],
            practiceHistory: Array.isArray(p.history.practiceHistory)
              ? p.history.practiceHistory
              : [],
          }
        : emptyUserSyncPayload().history,
    gradeLevel: isValidGradeLevel(p.gradeLevel ?? null) ? p.gradeLevel! : null,
  };
}

async function loadFromFile(userId: string): Promise<UserSyncPayload | null> {
  const mem = memoryStore();
  if (mem.has(userId)) return mem.get(userId)!;

  try {
    const raw = await fs.readFile(SYNC_FILE, "utf8");
    const all = JSON.parse(raw) as Record<string, UserSyncPayload>;
    for (const [id, payload] of Object.entries(all)) {
      const normalized = normalizePayload(payload);
      if (normalized) mem.set(id, normalized);
    }
    return mem.get(userId) ?? null;
  } catch {
    return null;
  }
}

async function saveToFile(userId: string, payload: UserSyncPayload) {
  const mem = memoryStore();
  mem.set(userId, payload);

  const all: Record<string, UserSyncPayload> = {};
  for (const [id, data] of mem.entries()) {
    all[id] = data;
  }

  try {
    await fs.mkdir(path.dirname(SYNC_FILE), { recursive: true });
    await fs.writeFile(SYNC_FILE, JSON.stringify(all, null, 2), "utf8");
  } catch {
    // read-only / tmp — giữ trong bộ nhớ phiên
  }
}

async function loadFromBlob(userId: string): Promise<UserSyncPayload | null> {
  try {
    const meta = await head(blobPath(userId));
    const res = await fetch(meta.url);
    if (!res.ok) return null;
    const json = (await res.json()) as unknown;
    return normalizePayload(json);
  } catch {
    return null;
  }
}

async function saveToBlob(userId: string, payload: UserSyncPayload) {
  await put(blobPath(userId), JSON.stringify(payload), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function getUserSyncData(userId: string): Promise<UserSyncPayload | null> {
  if (useBlob()) {
    const blob = await loadFromBlob(userId);
    if (blob) {
      memoryStore().set(userId, blob);
      return blob;
    }
  }
  return loadFromFile(userId);
}

export async function saveUserSyncData(userId: string, payload: UserSyncPayload) {
  const normalized = normalizePayload(payload);
  if (!normalized) throw new Error("Dữ liệu đồng bộ không hợp lệ");

  memoryStore().set(userId, normalized);

  if (useBlob()) {
    await saveToBlob(userId, normalized);
  }
  await saveToFile(userId, normalized);
}

export function mergeUserSync(a: UserSyncPayload, b: UserSyncPayload): UserSyncPayload {
  const newer = a.updatedAt >= b.updatedAt ? a : b;
  const older = a.updatedAt >= b.updatedAt ? b : a;

  const profile =
    (newer.profile.testCompletedAt ?? "") >= (older.profile.testCompletedAt ?? "")
      ? { ...older.profile, ...newer.profile }
      : { ...newer.profile, ...older.profile };

  const used = [...new Set([...a.activity.used, ...b.activity.used])];
  const snapshots = { ...older.activity.snapshots, ...newer.activity.snapshots };
  const activity = {
    used,
    snapshots,
    careerMap: newer.activity.careerMap ?? older.activity.careerMap,
    analyzedKey: newer.activity.analyzedKey ?? older.activity.analyzedKey,
    mapSchemaVersion: newer.activity.mapSchemaVersion ?? older.activity.mapSchemaVersion,
  };

  const byId = <T extends { id: string }>(items: T[]) => {
    const map = new Map<string, T>();
    for (const item of items) map.set(item.id, item);
    return map;
  };

  const tests = byId(a.history.testAttempts);
  for (const t of b.history.testAttempts) tests.set(t.id, t);
  const trans = byId(a.history.translateHistory);
  for (const t of b.history.translateHistory) trans.set(t.id, t);
  const chats = byId(a.history.chatSessions);
  for (const c of b.history.chatSessions) chats.set(c.id, c);
  const practice = byId(a.history.practiceHistory);
  for (const p of b.history.practiceHistory) practice.set(p.id, p);

  const sortNewest = <T extends { at?: string; completedAt?: string; updatedAt?: string }>(
    items: T[],
    field: keyof T,
  ) =>
    [...items].sort((x, y) => String(y[field] ?? "").localeCompare(String(x[field] ?? "")));

  const MAX = 40;
  const history = {
    testAttempts: sortNewest([...tests.values()], "completedAt").slice(0, MAX),
    translateHistory: sortNewest([...trans.values()], "at").slice(0, MAX),
    chatSessions: sortNewest([...chats.values()], "updatedAt").slice(0, MAX),
    practiceHistory: sortNewest([...practice.values()], "at").slice(0, MAX),
  };

  return {
    version: USER_SYNC_VERSION,
    updatedAt: new Date().toISOString(),
    profile,
    activity,
    history,
    gradeLevel: newer.gradeLevel ?? older.gradeLevel,
  };
}
