import type { GradeLevelId } from "./grade-level";
import type { TraitId } from "./test-scoring";
import { asArray } from "./safe-storage";

const HISTORY_KEY = "lexa-user-history";
const MAX_PER_SECTION = 40;

export type TestAttemptRecord = {
  id: string;
  completedAt: string;
  gradeLevel?: GradeLevelId;
  title: string;
  summary: string;
  strengths: string[];
  careers: string[];
  topTraits: TraitId[];
  insights: string[];
};

export type TranslateRecord = {
  id: string;
  at: string;
  mode: string;
  input: string;
  output: string;
};

export type ChatSessionRecord = {
  id: string;
  title: string;
  updatedAt: string;
  messages: { role: "user" | "assistant"; content: string }[];
};

export type PracticeRecord = {
  id: string;
  at: string;
  sessionId?: string;
  grade: string;
  subject: string;
  difficulty: string;
  count?: number;
  correct: number;
  total: number;
  wrong?: number;
  score: string;
  accuracy?: number;
  durationMs?: number;
  topicsStrong?: string[];
  topicsWeak?: string[];
  topicsReview?: string[];
  knowledgeGaps?: string[];
};

export type UserHistory = {
  testAttempts: TestAttemptRecord[];
  translateHistory: TranslateRecord[];
  chatSessions: ChatSessionRecord[];
  practiceHistory: PracticeRecord[];
};

const EMPTY: UserHistory = {
  testAttempts: [],
  translateHistory: [],
  chatSessions: [],
  practiceHistory: [],
};

let activeHistoryKey = HISTORY_KEY;

function storageKeyForEmail(email: string) {
  return `${HISTORY_KEY}:${email.toLowerCase()}`;
}

function readRaw(key: string): UserHistory {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<UserHistory>;
    return {
      testAttempts: asArray<TestAttemptRecord>(parsed.testAttempts),
      translateHistory: asArray<TranslateRecord>(parsed.translateHistory),
      chatSessions: asArray<ChatSessionRecord>(parsed.chatSessions),
      practiceHistory: asArray<PracticeRecord>(parsed.practiceHistory),
    };
  } catch {
    return { ...EMPTY };
  }
}

function writeRaw(key: string, data: UserHistory, opts?: { silent?: boolean }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
  if (!opts?.silent) {
    window.dispatchEvent(new CustomEvent("lexa-history-updated"));
  }
}

function readHistory(): UserHistory {
  return readRaw(activeHistoryKey);
}

function writeHistory(data: UserHistory, opts?: { silent?: boolean }) {
  writeRaw(activeHistoryKey, data, opts);
}

/** Áp dụng dữ liệu từ cloud sync */
export function applyRemoteHistory(data: UserHistory, opts?: { silent?: boolean }) {
  writeHistory(data, opts);
}

function mergeHistory(a: UserHistory, b: UserHistory): UserHistory {
  const byId = <T extends { id: string }>(items: T[]) => {
    const map = new Map<string, T>();
    for (const item of items) map.set(item.id, item);
    return map;
  };

  const tests = byId(a.testAttempts);
  for (const t of b.testAttempts) tests.set(t.id, t);
  const trans = byId(a.translateHistory);
  for (const t of b.translateHistory) trans.set(t.id, t);
  const chats = byId(a.chatSessions);
  for (const c of b.chatSessions) chats.set(c.id, c);
  const practice = byId(a.practiceHistory);
  for (const p of b.practiceHistory) practice.set(p.id, p);

  const sortNewest = <T extends { at?: string; completedAt?: string; updatedAt?: string }>(
    items: T[],
    field: keyof T,
  ) =>
    [...items].sort((x, y) => {
      const ax = String(x[field] ?? "");
      const ay = String(y[field] ?? "");
      return ay.localeCompare(ax);
    });

  return {
    testAttempts: sortNewest([...tests.values()], "completedAt").slice(0, MAX_PER_SECTION),
    translateHistory: sortNewest([...trans.values()], "at").slice(0, MAX_PER_SECTION),
    chatSessions: sortNewest([...chats.values()], "updatedAt").slice(0, MAX_PER_SECTION),
    practiceHistory: sortNewest([...practice.values()], "at").slice(0, MAX_PER_SECTION),
  };
}

/** Gắn lịch sử với email đăng nhập; gộp dữ liệu ẩn danh nếu có */
export function bindHistoryToUser(email: string | null) {
  if (typeof window === "undefined") return;

  if (!email) {
    activeHistoryKey = HISTORY_KEY;
    window.dispatchEvent(new CustomEvent("lexa-history-updated"));
    return;
  }

  const userKey = storageKeyForEmail(email);
  const anon = readRaw(HISTORY_KEY);
  const existing = readRaw(userKey);
  const merged = mergeHistory(existing, anon);

  if (
    merged.testAttempts.length ||
    merged.translateHistory.length ||
    merged.chatSessions.length ||
    merged.practiceHistory.length
  ) {
    writeRaw(userKey, merged);
  }

  activeHistoryKey = userKey;
  window.dispatchEvent(new CustomEvent("lexa-history-updated"));
}

export function getUserHistory(): UserHistory {
  return readHistory();
}

function triggerServerPersist(immediate = true) {
  if (typeof window === "undefined") return;
  void import("./user-cloud-sync").then((m) => {
    const email = m.getLoggedInEmail();
    if (!email) return;
    if (immediate) m.persistUserDataImmediate(email);
    else m.persistUserDataDebounced(email);
  });
}

export function appendTestAttempt(record: Omit<TestAttemptRecord, "id" | "completedAt">) {
  const h = readHistory();
  h.testAttempts.unshift({
    ...record,
    id: `test-${Date.now()}`,
    completedAt: new Date().toISOString(),
  });
  h.testAttempts = h.testAttempts.slice(0, MAX_PER_SECTION);
  writeHistory(h);
  triggerServerPersist(true);
}

export function appendTranslateRecord(record: Omit<TranslateRecord, "id" | "at">) {
  const h = readHistory();
  h.translateHistory.unshift({
    ...record,
    id: `tr-${Date.now()}`,
    at: new Date().toISOString(),
  });
  h.translateHistory = h.translateHistory.slice(0, MAX_PER_SECTION);
  writeHistory(h);
  triggerServerPersist(true);
}

export function saveChatSessions(
  sessions: ChatSessionRecord[],
  opts?: { silent?: boolean },
) {
  const h = readHistory();
  h.chatSessions = sessions.slice(0, MAX_PER_SECTION);
  writeHistory(h, opts);
  triggerServerPersist(!opts?.silent);
}

export function loadChatSessions(): ChatSessionRecord[] {
  return readHistory().chatSessions;
}

export function appendPracticeRecord(record: Omit<PracticeRecord, "id" | "at">) {
  const h = readHistory();
  h.practiceHistory.unshift({
    ...record,
    id: `pr-${Date.now()}`,
    at: new Date().toISOString(),
  });
  h.practiceHistory = h.practiceHistory.slice(0, MAX_PER_SECTION);
  writeHistory(h);
  triggerServerPersist(true);
}

/** Tóm tắt lịch sử để AI phân tích lộ trình */
export function getHistorySummaryForAi() {
  const h = readHistory();
  return {
    testCount: h.testAttempts.length,
    latestTest: h.testAttempts[0] ?? null,
    translateCount: h.translateHistory.length,
    recentTranslate: h.translateHistory.slice(0, 5),
    chatCount: h.chatSessions.length,
    recentChatTopics: h.chatSessions.slice(0, 3).map((s) => s.title),
    practiceCount: h.practiceHistory.length,
    recentPractice: h.practiceHistory.slice(0, 5),
  };
}
