import { asArray } from "./safe-storage";

export type ActivityFeature = "test" | "translate" | "chat" | "practice";

export type CareerMapData = {
  traits: string;
  style: string;
  goal: string;
};

export type FeatureSnapshot = {
  test?: {
    title: string;
    summary: string;
    strengths: string[];
    careers: string[];
    nextSteps?: string[];
    answers?: { question: string; answer: string }[];
  };
  translate?: {
    lastInput: string;
    lastOutput: string;
    mode: string;
  };
  chat?: {
    recentQuestions: string[];
  };
  practice?: {
    grade: string;
    subject: string;
    difficulty: string;
    score?: string;
  };
};

export type StoredActivityPayload = {
  used: ActivityFeature[];
  snapshots: FeatureSnapshot;
  careerMap: CareerMapData | null;
  analyzedKey: string | null;
  mapSchemaVersion?: number;
};

type StoredActivity = StoredActivityPayload;

const STORAGE_KEY = "lexa-user-activity";
export const MIN_FEATURES_FOR_MAP = 2;
export const MAP_SCHEMA_VERSION = 4;

let activeActivityKey = STORAGE_KEY;

function storageKeyForEmail(email: string) {
  return `${STORAGE_KEY}:${email.toLowerCase()}`;
}

export const EMPTY_MAP: CareerMapData = {
  traits: "Chưa phân tích",
  style: "Chưa phân tích",
  goal: "Chưa phân tích",
};

const VALID_FEATURES = new Set<ActivityFeature>(["test", "translate", "chat", "practice"]);

function normalizeActivity(raw: unknown): StoredActivity {
  const empty: StoredActivity = {
    used: [],
    snapshots: {},
    careerMap: null,
    analyzedKey: null,
  };
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return empty;
  const p = raw as StoredActivity;
  const used = asArray<unknown>(p.used).filter(
    (f): f is ActivityFeature => typeof f === "string" && VALID_FEATURES.has(f as ActivityFeature),
  );
  const snapshots =
    p.snapshots && typeof p.snapshots === "object" && !Array.isArray(p.snapshots)
      ? p.snapshots
      : {};
  return {
    used,
    snapshots,
    careerMap: p.careerMap ?? null,
    analyzedKey: typeof p.analyzedKey === "string" ? p.analyzedKey : null,
    mapSchemaVersion: p.mapSchemaVersion,
  };
}

function parseActivityJson(raw: string | null): StoredActivity {
  if (!raw) return { used: [], snapshots: {}, careerMap: null, analyzedKey: null };
  try {
    return normalizeActivity(JSON.parse(raw));
  } catch {
    return { used: [], snapshots: {}, careerMap: null, analyzedKey: null };
  }
}

function readStore(): StoredActivity {
  if (typeof window === "undefined") {
    return { used: [], snapshots: {}, careerMap: null, analyzedKey: null };
  }
  return parseActivityJson(localStorage.getItem(activeActivityKey));
}

function writeStore(data: StoredActivity) {
  localStorage.setItem(activeActivityKey, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("lexa-activity-updated"));
  if (typeof window !== "undefined") {
    void import("./user-cloud-sync").then((m) => {
      const email = m.getLoggedInEmail();
      if (email) m.persistUserDataDebounced(email, 2000);
    });
  }
}

/** Áp dụng dữ liệu từ cloud sync */
export function applyRemoteActivity(data: StoredActivityPayload) {
  writeStore(data);
}

function mergeActivity(a: StoredActivity, b: StoredActivity): StoredActivity {
  const used = [...new Set([...a.used, ...b.used])];
  const snapshots: FeatureSnapshot = { ...b.snapshots, ...a.snapshots };
  return {
    used,
    snapshots,
    careerMap: a.careerMap ?? b.careerMap,
    analyzedKey: null,
    mapSchemaVersion: MAP_SCHEMA_VERSION,
  };
}

/** Gắn hoạt động với email đăng nhập */
export function bindActivityToUser(email: string | null) {
  if (typeof window === "undefined") return;

  if (!email) {
    activeActivityKey = STORAGE_KEY;
    window.dispatchEvent(new CustomEvent("lexa-activity-updated"));
    return;
  }

  const userKey = storageKeyForEmail(email);
  const anon = parseActivityJson(localStorage.getItem(STORAGE_KEY));
  const existing = parseActivityJson(localStorage.getItem(userKey));

  const merged = mergeActivity(existing, anon);
  if (merged.used.length || Object.keys(merged.snapshots).length) {
    localStorage.setItem(userKey, JSON.stringify(merged));
    localStorage.removeItem(STORAGE_KEY);
  }
  activeActivityKey = userKey;
  window.dispatchEvent(new CustomEvent("lexa-activity-updated"));
}

function activityKey(used: ActivityFeature[], snapshots: FeatureSnapshot): string {
  return JSON.stringify({ used: [...used].sort(), snapshots });
}

function isCompleteMap(map: CareerMapData | null): map is CareerMapData {
  if (!map) return false;
  const locked = "Chưa phân tích";
  return Boolean(
    map.traits?.trim() && map.traits !== locked &&
      map.style?.trim() && map.style !== locked &&
      map.goal?.trim() && map.goal !== locked,
  );
}

export function getActivityState(): StoredActivity {
  return readStore();
}

export function getUsedFeatureCount(): number {
  return readStore().used.length;
}

export function canGenerateCareerMap(): boolean {
  return getUsedFeatureCount() >= MIN_FEATURES_FOR_MAP;
}

export function recordActivity(
  feature: ActivityFeature,
  snapshot: FeatureSnapshot[ActivityFeature],
) {
  const store = readStore();
  if (!store.used.includes(feature)) {
    store.used.push(feature);
  }
  store.snapshots = { ...store.snapshots, [feature]: snapshot };
  const key = activityKey(store.used, store.snapshots);
  if (store.analyzedKey !== key || store.mapSchemaVersion !== MAP_SCHEMA_VERSION) {
    store.careerMap = null;
  }
  writeStore(store);
}

export function saveCareerMap(map: CareerMapData) {
  const store = readStore();
  store.careerMap = map;
  store.analyzedKey = activityKey(store.used, store.snapshots);
  store.mapSchemaVersion = MAP_SCHEMA_VERSION;
  writeStore(store);
  if (typeof window !== "undefined") {
    void import("./user-cloud-sync").then((m) => {
      const email = m.getLoggedInEmail();
      if (email) m.persistUserDataImmediate(email);
    });
  }
}

export function getCareerMap(): CareerMapData {
  const store = readStore();
  if (store.careerMap && canGenerateCareerMap() && isCompleteMap(store.careerMap)) {
    return store.careerMap;
  }
  return EMPTY_MAP;
}

export function needsCareerMapAnalysis(): boolean {
  const store = readStore();
  if (store.used.length < MIN_FEATURES_FOR_MAP) return false;
  const key = activityKey(store.used, store.snapshots);
  if (store.mapSchemaVersion !== MAP_SCHEMA_VERSION) return true;
  return store.analyzedKey !== key || !isCompleteMap(store.careerMap);
}

export function getActivityPayload() {
  const store = readStore();
  return {
    featuresUsed: store.used,
    snapshots: store.snapshots,
  };
}

export const FEATURE_LABELS: Record<ActivityFeature, string> = {
  test: "Bài test",
  translate: "Dịch thuật",
  chat: "Trợ lý học tập",
  practice: "Luyện tập",
};

export const ALL_FEATURES: ActivityFeature[] = [
  "test",
  "translate",
  "chat",
  "practice",
];
