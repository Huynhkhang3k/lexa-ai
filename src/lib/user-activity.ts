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

type StoredActivity = {
  used: ActivityFeature[];
  snapshots: FeatureSnapshot;
  careerMap: CareerMapData | null;
  analyzedKey: string | null;
  mapSchemaVersion?: number;
};

const STORAGE_KEY = "lexa-user-activity";
export const MIN_FEATURES_FOR_MAP = 2;
export const MAP_SCHEMA_VERSION = 4;

export const EMPTY_MAP: CareerMapData = {
  traits: "__",
  style: "__",
  goal: "__",
};

function readStore(): StoredActivity {
  if (typeof window === "undefined") {
    return { used: [], snapshots: {}, careerMap: null, analyzedKey: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { used: [], snapshots: {}, careerMap: null, analyzedKey: null };
    const parsed = JSON.parse(raw) as StoredActivity;
    return {
      used: parsed.used ?? [],
      snapshots: parsed.snapshots ?? {},
      careerMap: parsed.careerMap ?? null,
      analyzedKey: parsed.analyzedKey ?? null,
      mapSchemaVersion: parsed.mapSchemaVersion,
    };
  } catch {
    return { used: [], snapshots: {}, careerMap: null, analyzedKey: null };
  }
}

function writeStore(data: StoredActivity) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("lexa-activity-updated"));
}

function activityKey(used: ActivityFeature[], snapshots: FeatureSnapshot): string {
  return JSON.stringify({ used: [...used].sort(), snapshots });
}

function isCompleteMap(map: CareerMapData | null): map is CareerMapData {
  if (!map) return false;
  return Boolean(
    map.traits?.trim() && map.traits !== "__" &&
      map.style?.trim() && map.style !== "__" &&
      map.goal?.trim() && map.goal !== "__",
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
