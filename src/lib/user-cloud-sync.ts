import type { GradeLevelId } from "./grade-level";
import { GRADE_LEVEL_STORAGE_KEY, isValidGradeLevel } from "./grade-level";
import { applyRemoteActivity } from "./user-activity";
import { applyRemoteHistory } from "./user-history";
import { applyRemoteProfile } from "./user-profile";
import {
  collectLocalSyncPayload,
  flushOfflineQueue,
  initServerDataListeners,
  persistUserDataDebounced,
  persistUserDataImmediate,
  pullUserDataFromServer,
  pushUserDataToServer,
  readLocalCache,
  setServerPrimaryMode,
  writeLocalCache,
} from "./user-server-data";
import type { UserSyncPayload } from "./user-sync-types";
import { USER_SYNC_VERSION } from "./user-sync-types";

let syncing = false;
let loggedInEmail: string | null = null;

export function setCloudSyncEnabled(enabled: boolean, email?: string | null) {
  setServerPrimaryMode(enabled);
  loggedInEmail = enabled && email ? email : null;
}

export function getLoggedInEmail() {
  return loggedInEmail;
}

function writeGradeLevel(level: GradeLevelId | null) {
  if (typeof window === "undefined" || !level) return;
  localStorage.setItem(GRADE_LEVEL_STORAGE_KEY, level);
  window.dispatchEvent(new CustomEvent("lexa-grade-updated"));
}

export function applySyncPayload(data: UserSyncPayload, opts?: { silent?: boolean }) {
  syncing = true;
  try {
    applyRemoteProfile(data.profile);
    applyRemoteActivity(data.activity);
    applyRemoteHistory(data.history, { silent: opts?.silent });
    if (data.gradeLevel) writeGradeLevel(data.gradeLevel);
    if (loggedInEmail) writeLocalCache(loggedInEmail, data);
  } finally {
    syncing = false;
  }
}

function mergePayloads(remote: UserSyncPayload, local: UserSyncPayload): UserSyncPayload {
  const newer = remote.updatedAt >= local.updatedAt ? remote : local;
  const older = remote.updatedAt >= local.updatedAt ? local : remote;

  const profile =
    (newer.profile.testCompletedAt ?? "") >= (older.profile.testCompletedAt ?? "")
      ? { ...older.profile, ...newer.profile }
      : { ...newer.profile, ...older.profile };

  const used = [...new Set([...remote.activity.used, ...local.activity.used])];
  const activity = {
    used,
    snapshots: { ...older.activity.snapshots, ...newer.activity.snapshots },
    careerMap: newer.activity.careerMap ?? older.activity.careerMap,
    analyzedKey: newer.activity.analyzedKey ?? older.activity.analyzedKey,
    mapSchemaVersion: newer.activity.mapSchemaVersion ?? older.activity.mapSchemaVersion,
  };

  const byId = <T extends { id: string }>(items: T[]) => {
    const map = new Map<string, T>();
    for (const item of items) map.set(item.id, item);
    return map;
  };

  const tests = byId(remote.history.testAttempts);
  for (const t of local.history.testAttempts) tests.set(t.id, t);
  const trans = byId(remote.history.translateHistory);
  for (const t of local.history.translateHistory) trans.set(t.id, t);
  const chats = byId(remote.history.chatSessions);
  for (const c of local.history.chatSessions) chats.set(c.id, c);
  const practice = byId(remote.history.practiceHistory);
  for (const p of local.history.practiceHistory) practice.set(p.id, p);

  const sortNewest = <T extends { at?: string; completedAt?: string; updatedAt?: string }>(
    items: T[],
    field: keyof T,
  ) =>
    [...items].sort((x, y) => String(y[field] ?? "").localeCompare(String(x[field] ?? "")));

  const MAX = 40;
  return {
    version: USER_SYNC_VERSION,
    updatedAt: new Date().toISOString(),
    profile,
    activity,
    history: {
      testAttempts: sortNewest([...tests.values()], "completedAt").slice(0, MAX),
      translateHistory: sortNewest([...trans.values()], "at").slice(0, MAX),
      chatSessions: sortNewest([...chats.values()], "updatedAt").slice(0, MAX),
      practiceHistory: sortNewest([...practice.values()], "at").slice(0, MAX),
    },
    gradeLevel: newer.gradeLevel ?? older.gradeLevel,
  };
}

/** Đăng nhập: server là nguồn chính, gộp dữ liệu local chưa đẩy nếu cần */
export async function pullCloudSync(email: string): Promise<boolean> {
  if (!loggedInEmail) return false;

  const remote = await pullUserDataFromServer(email);
  const local = collectLocalSyncPayload();

  const hasRemote = Boolean(
    remote &&
      (remote.history.testAttempts.length > 0 ||
        remote.history.chatSessions.length > 0 ||
        remote.history.translateHistory.length > 0 ||
        remote.history.practiceHistory.length > 0 ||
        Boolean(remote.profile.testCompletedAt) ||
        Boolean(remote.profile.hollandResult) ||
        Boolean(remote.profile.targetCareer) ||
        remote.activity.used.length > 0),
  );

  const hasLocal =
    local.history.testAttempts.length > 0 ||
    local.history.chatSessions.length > 0 ||
    local.history.translateHistory.length > 0 ||
    local.history.practiceHistory.length > 0 ||
    Boolean(local.profile.testCompletedAt) ||
    Boolean(local.profile.hollandResult) ||
    Boolean(local.profile.targetCareer) ||
    local.activity.used.length > 0;

  if (hasRemote && hasLocal) {
    const merged = mergePayloads(remote!, local);
    applySyncPayload(merged, { silent: true });
    await pushUserDataToServer(merged, email);
  } else if (hasRemote && remote) {
    applySyncPayload(remote, { silent: true });
  } else if (hasLocal) {
    await pushUserDataToServer(local, email);
  } else {
    const cached = readLocalCache(email);
    if (cached) applySyncPayload(cached, { silent: true });
  }

  await flushOfflineQueue(email);

  window.dispatchEvent(new CustomEvent("lexa-history-updated"));
  window.dispatchEvent(new CustomEvent("lexa-profile-updated"));
  window.dispatchEvent(new CustomEvent("lexa-activity-updated"));
  window.dispatchEvent(new CustomEvent("lexa-sync-updated"));
  return true;
}

export async function pushCloudSyncNow(payload?: UserSyncPayload): Promise<boolean> {
  if (!loggedInEmail || syncing) return false;
  return pushUserDataToServer(payload, loggedInEmail);
}

/** @deprecated Dùng persistUserDataImmediate hoặc persistUserDataDebounced */
export function scheduleCloudPush() {
  if (!loggedInEmail || syncing) return;
  persistUserDataDebounced(loggedInEmail ?? undefined, 1500);
}

export function initCloudSyncListeners(email: string | null) {
  return initServerDataListeners(email);
}

export { collectLocalSyncPayload, persistUserDataImmediate, persistUserDataDebounced };
