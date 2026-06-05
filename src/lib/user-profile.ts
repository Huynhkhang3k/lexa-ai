import type { GradeLevelId } from "./grade-level";
import type { RiasecCode } from "./holland-riasec";
import type { RoadmapStep } from "./roadmap";
import type { TraitId, TraitScores } from "./test-scoring";
import { asArray } from "./safe-storage";
import {
  ALL_FEATURES,
  getActivityState,
  type ActivityFeature,
  type FeatureSnapshot,
} from "./user-activity";

export type HollandProfileResult = {
  hollandCode: string;
  radarValues: { code: RiasecCode; value: number }[];
  groups: { code: RiasecCode; labelVi: string; score: number; percent: number }[];
  topGroups: { code: RiasecCode; labelVi: string; score: number }[];
  completedAt: string;
};

export type UserProfile = {
  displayName?: string;
  gradeLevel?: GradeLevelId;
  traitScores?: TraitScores;
  topTraits?: TraitId[];
  insights?: string[];
  strengths?: string[];
  suggestedCareers?: { id: string; name: string; matchPercent: number; why: string }[];
  /** Kết quả Holland RIASEC mới nhất (hiển thị radar trang chủ). */
  hollandResult?: HollandProfileResult;
  targetCareer?: { id: string; name: string };
  roadmap?: RoadmapStep[];
  skillsToDevelop?: string[];
  careerGoal?: string;
  testCompletedAt?: string;
};

const PROFILE_KEY = "lexa-user-profile";
const ANON_KEY = PROFILE_KEY;

let activeProfileKey = ANON_KEY;

function storageKeyForEmail(email: string) {
  return `${PROFILE_KEY}:${email.toLowerCase()}`;
}

function normalizeProfile(raw: unknown): UserProfile {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const p = raw as UserProfile;
  const roadmap = asArray<RoadmapStep>(p.roadmap).filter(
    (s) => s && typeof s.label === "string",
  );
  return {
    ...p,
    roadmap: roadmap.length ? roadmap : undefined,
    topTraits: asArray<TraitId>(p.topTraits),
    insights: asArray<string>(p.insights),
    strengths: asArray<string>(p.strengths),
    skillsToDevelop: asArray<string>(p.skillsToDevelop),
    suggestedCareers: asArray<NonNullable<UserProfile["suggestedCareers"]>[number]>(
      p.suggestedCareers,
    ),
  };
}

function readRaw(key: string): UserProfile {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(key);
    return raw ? normalizeProfile(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function readProfile(): UserProfile {
  return readRaw(activeProfileKey);
}

function writeProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(activeProfileKey, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent("lexa-profile-updated"));
}

/** Áp dụng dữ liệu từ cloud sync */
export function applyRemoteProfile(profile: UserProfile) {
  writeProfile(profile);
}

/** Gắn hồ sơ với email đăng nhập; gộp dữ liệu ẩn danh nếu có */
export function bindProfileToUser(email: string | null, displayName?: string) {
  if (typeof window === "undefined") return;

  const prevKey = activeProfileKey;

  if (!email) {
    activeProfileKey = ANON_KEY;
    window.dispatchEvent(new CustomEvent("lexa-profile-updated"));
    return;
  }

  const userKey = storageKeyForEmail(email);
  const anon = readRaw(ANON_KEY);
  const existing = readRaw(userKey);

  const merged: UserProfile = {
    ...existing,
    ...(Object.keys(existing).length === 0 ? anon : {}),
    displayName: displayName ?? existing.displayName ?? anon.displayName,
  };

  if (Object.keys(merged).length > 0) {
    localStorage.setItem(userKey, JSON.stringify(merged));
  }

  activeProfileKey = userKey;
  if (prevKey !== userKey) {
    window.dispatchEvent(new CustomEvent("lexa-profile-updated"));
  }
}

export function getUserProfile(): UserProfile {
  return readProfile();
}

export function saveUserProfile(patch: Partial<UserProfile>) {
  writeProfile({ ...readProfile(), ...patch });
  if (typeof window !== "undefined") {
    void import("./user-cloud-sync").then((m) => {
      if (m.getLoggedInEmail()) m.persistUserDataImmediate(m.getLoggedInEmail() ?? undefined);
    });
  }
}

export function hasCompletedAssessment(): boolean {
  const p = readProfile();
  return Boolean(p.testCompletedAt && (p.hollandResult?.hollandCode || p.suggestedCareers?.length));
}

export function hasTargetCareer(): boolean {
  return Boolean(readProfile().targetCareer?.id);
}

export function hasRoadmap(): boolean {
  const p = readProfile();
  return Boolean(Array.isArray(p.roadmap) && p.roadmap.length > 0 && p.targetCareer?.id);
}

export type ProgressMetric = {
  label: string;
  value: number;
  color: string;
};

export function computeProgressMetrics(): ProgressMetric[] {
  const store = getActivityState();
  const profile = readProfile();

  const assessmentDone = hasCompletedAssessment() ? 100 : store.used.includes("test") ? 40 : 0;

  let careerExplore = 0;
  if (profile.targetCareer) careerExplore += 50;
  if (store.used.includes("test") && profile.suggestedCareers?.length) careerExplore += 30;
  if (store.snapshots.test?.careers?.length) careerExplore += 20;
  careerExplore = Math.min(100, careerExplore);

  let skills = 0;
  if (store.used.includes("practice")) skills += 40;
  if (store.used.includes("chat")) skills += 30;
  if (store.used.includes("translate")) skills += 20;
  if (profile.skillsToDevelop?.length) skills += 10;
  skills = Math.min(100, skills);

  let goal = 0;
  if (profile.targetCareer) goal += 40;
  if (profile.roadmap?.length) goal += 40;
  if (profile.careerGoal) goal += 20;
  goal = Math.min(100, goal);

  return [
    { label: "Đánh giá bản thân", value: assessmentDone, color: "bg-sky-500" },
    { label: "Khám phá nghề nghiệp", value: careerExplore, color: "bg-violet-500" },
    { label: "Kỹ năng cần học", value: skills, color: "bg-fuchsia-500" },
    { label: "Mục tiêu nghề nghiệp", value: goal, color: "bg-blue-500" },
  ];
}

export function profileFromTestSnapshot(
  snapshot: NonNullable<FeatureSnapshot["test"]>,
  extra: {
    traitScores: TraitScores;
    topTraits: TraitId[];
    insights: string[];
    suggestedCareers: UserProfile["suggestedCareers"];
    gradeLevel?: GradeLevelId;
    displayName?: string;
  },
) {
  saveUserProfile({
    strengths: snapshot.strengths,
    insights: extra.insights,
    traitScores: extra.traitScores,
    topTraits: extra.topTraits,
    suggestedCareers: extra.suggestedCareers,
    displayName: extra.displayName,
    careerGoal: snapshot.careers?.[0]
      ? `Hướng tới ${snapshot.careers[0]} — phát triển theo lộ trình LEXA`
      : undefined,
    skillsToDevelop: deriveSkills(extra.topTraits),
    testCompletedAt: new Date().toISOString(),
    gradeLevel: extra.gradeLevel,
  });
}

function deriveSkills(traits: TraitId[]): string[] {
  const map: Partial<Record<TraitId, string>> = {
    logic: "Tư duy logic",
    tech: "Lập trình cơ bản",
    math: "Toán nâng cao",
    creative: "Sáng tạo & ý tưởng",
    design: "Thiết kế",
    communication: "Giao tiếp",
    leadership: "Làm việc nhóm",
    business: "Tư duy kinh doanh",
  };
  return traits.map((t) => map[t]).filter(Boolean) as string[];
}

export function featureUsageSummary(): ActivityFeature[] {
  return getActivityState().used;
}

export { ALL_FEATURES };
