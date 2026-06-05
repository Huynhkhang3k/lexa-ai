import { CAREERS } from "./careers";
import { getCareerImageUrl } from "./career-images";
import { getCareerRiasec } from "./careers-riasec";
import { HOLLAND_QUESTIONS } from "./holland-questions";
import {
  getRiasecType,
  RIASEC_GROUP_IMAGES,
  RIASEC_ORDER,
  RIASEC_TYPES,
  type RiasecCode,
} from "./holland-riasec";

export type RiasecScores = Record<RiasecCode, number>;

export type HollandAnswer = {
  questionId: string;
  selectedOptionIds: string[];
};

export type ScoredRiasecGroup = {
  code: RiasecCode;
  labelVi: string;
  labelEn: string;
  score: number;
  percent: number;
};

export type MatchedCareer = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  skills: string[];
  averageSalary: string;
  opportunities: string[];
  riasecPrimary: RiasecCode;
  riasecSecondary: RiasecCode;
  primaryLabel: string;
  groupImageUrl: string;
  careerImageUrl?: string;
  why: string;
  matchPercent: number;
};

export type GroupExplanation = {
  code: RiasecCode;
  labelVi: string;
  labelEn: string;
  score: number;
  shortDesc: string;
  personality: string;
  whyFit: string;
};

export type HollandResult = {
  hollandCode: string;
  scores: RiasecScores;
  totalSelections: number;
  groups: ScoredRiasecGroup[];
  topGroups: ScoredRiasecGroup[];
  groupExplanations: GroupExplanation[];
  radarValues: { code: RiasecCode; value: number }[];
  title: string;
  summary: string;
  scoringNote: string;
  strengths: string[];
  areasToImprove: string[];
  learningEnv: string;
  workEnv: string;
  skillsToDevelop: string[];
  suitableFields: string[];
  suitableMajors: string[];
  careers: MatchedCareer[];
  nextSteps: string[];
};

export function emptyRiasecScores(): RiasecScores {
  return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
}

export function scoreHollandAnswers(answers: HollandAnswer[]): RiasecScores {
  const scores = emptyRiasecScores();
  const questionById = new Map(HOLLAND_QUESTIONS.map((q) => [q.id, q]));

  for (const a of answers) {
    const question = questionById.get(a.questionId);
    if (!question) continue;
    const validIds = new Set(question.options.map((o) => o.id));
    for (const optId of a.selectedOptionIds) {
      if (validIds.has(optId)) scores[question.group] += 1;
    }
  }

  return scores;
}

function sortGroups(scores: RiasecScores): ScoredRiasecGroup[] {
  const max = Math.max(...RIASEC_ORDER.map((c) => scores[c]), 1);
  return RIASEC_ORDER.map((code) => {
    const t = getRiasecType(code);
    const score = scores[code];
    return {
      code,
      labelVi: t.labelVi,
      labelEn: t.labelEn,
      score,
      percent: Math.round((score / max) * 100),
    };
  }).sort((a, b) => b.score - a.score);
}

export function buildHollandCode(scores: RiasecScores): string {
  const sorted = sortGroups(scores);
  const top3 = sorted.slice(0, 3).filter((g) => g.score > 0);
  if (top3.length === 0) return "RIE";
  return top3.map((g) => g.code).join("");
}

function careerMatchScore(
  scores: RiasecScores,
  primary: RiasecCode,
  secondary: RiasecCode,
  code: string,
): number {
  let s = scores[primary] * 3 + scores[secondary] * 2;
  for (const letter of code) {
    if (letter === primary || letter === secondary) s += 4;
    else if (scores[letter as RiasecCode]) s += scores[letter as RiasecCode] * 0.5;
  }
  return s;
}

function buildCareerWhy(
  careerName: string,
  primary: RiasecCode,
  secondary: RiasecCode,
  topGroups: ScoredRiasecGroup[],
  hollandCode: string,
): string {
  const p = getRiasecType(primary);
  const top = topGroups[0];
  if (!top || top.score === 0) {
    return `${careerName} phù hợp với hồ sơ RIASEC tổng hợp của bạn.`;
  }
  return `${careerName} phù hợp vì bạn có điểm cao ở nhóm ${top.labelVi} (${top.code}). Nghề này thuộc nhóm ${p.labelVi} (chính) và ${getRiasecType(secondary).labelVi} (phụ), phù hợp mã Holland ${hollandCode} của bạn.`;
}

export function matchCareers(scores: RiasecScores, hollandCode: string, limit = 8): MatchedCareer[] {
  const topGroups = sortGroups(scores).slice(0, 3);

  const ranked = CAREERS.map((c) => {
    const { riasecPrimary, riasecSecondary } = getCareerRiasec(c.id);
    const raw = careerMatchScore(scores, riasecPrimary, riasecSecondary, hollandCode);
    return { career: c, riasecPrimary, riasecSecondary, raw };
  })
    .filter((x) => x.raw > 0)
    .sort((a, b) => b.raw - a.raw);

  const topRaw = ranked[0]?.raw ?? 1;

  return ranked.slice(0, limit).map((x, i) => {
    const p = getRiasecType(x.riasecPrimary);
    const matchPercent = Math.min(98, Math.max(55, Math.round((x.raw / topRaw) * 92 - i * 4)));
    return {
      id: x.career.id,
      name: x.career.name,
      tagline: x.career.tagline,
      description: x.career.description,
      skills: x.career.skills,
      averageSalary: x.career.averageSalary,
      opportunities: x.career.opportunities,
      riasecPrimary: x.riasecPrimary,
      riasecSecondary: x.riasecSecondary,
      primaryLabel: p.labelVi,
      groupImageUrl: RIASEC_GROUP_IMAGES[x.riasecPrimary],
      careerImageUrl: getCareerImageUrl(x.career.id),
      why: buildCareerWhy(x.career.name, x.riasecPrimary, x.riasecSecondary, topGroups, hollandCode),
      matchPercent,
    };
  });
}

function buildGroupExplanations(topGroups: ScoredRiasecGroup[]): GroupExplanation[] {
  return topGroups.map((g, i) => {
    const t = getRiasecType(g.code);
    const rank = i === 0 ? "cao nhất" : i === 1 ? "thứ hai" : "thứ ba";
    return {
      code: g.code,
      labelVi: t.labelVi,
      labelEn: t.labelEn,
      score: g.score,
      shortDesc: t.shortDesc,
      personality: t.personality,
      whyFit: `Nhóm ${t.labelVi} (${g.code}) đạt ${g.score} điểm — xếp ${rank} trong mã Holland của bạn, phản ánh sở thích ${t.labelEn.toLowerCase()} nổi bật.`,
    };
  });
}

function buildAreasToImprove(scores: RiasecScores, topGroups: ScoredRiasecGroup[]): string[] {
  const topCodes = new Set(topGroups.map((g) => g.code));
  const weaker = sortGroups(scores)
    .filter((g) => !topCodes.has(g.code))
    .slice(-3)
    .reverse();
  if (weaker.length === 0) {
    return ["Tiếp tục cân bằng trải nghiệm ở cả 6 nhóm RIASEC qua hoạt động học tập đa dạng."];
  }
  return weaker.map((g) => {
    const t = getRiasecType(g.code);
    return `Nhóm ${t.labelVi} (${g.code}, ${g.score} điểm): có thể thử thêm hoạt động liên quan — ${t.fields.slice(0, 2).join(", ")}.`;
  });
}

export function buildHollandResult(answers: HollandAnswer[]): HollandResult {
  const scores = scoreHollandAnswers(answers);
  const totalSelections = Object.values(scores).reduce((a, b) => a + b, 0);
  const groups = sortGroups(scores);
  const topGroups = groups.slice(0, 3).filter((g) => g.score > 0);
  const hollandCode = buildHollandCode(scores);
  const careers = matchCareers(scores, hollandCode);

  const primary = topGroups[0]?.code ?? "I";
  const secondary = topGroups[1]?.code ?? "A";
  const tertiary = topGroups[2]?.code ?? "S";

  const pType = getRiasecType(primary);
  const fields = new Set<string>();
  const majors = new Set<string>();
  const skills = new Set<string>();
  for (const g of topGroups) {
    const t = getRiasecType(g.code);
    t.fields.forEach((f) => fields.add(f));
    t.majors.forEach((m) => majors.add(m));
    t.skills.forEach((s) => skills.add(s));
  }

  return {
    hollandCode,
    scores,
    totalSelections,
    groups,
    topGroups,
    groupExplanations: buildGroupExplanations(topGroups),
    radarValues: RIASEC_ORDER.map((code) => ({
      code,
      value: groups.find((g) => g.code === code)?.percent ?? 0,
    })),
    title: `Mã Holland: ${hollandCode}`,
    summary: `Bạn làm bài test Holland (RIASEC) của LEXA AI với ${totalSelections} lựa chọn. Ba nhóm nổi bật: ${getRiasecType(primary).labelVi}, ${getRiasecType(secondary).labelVi}, ${getRiasecType(tertiary).labelVi} → mã ${hollandCode}.`,
    scoringNote:
      "Mỗi đáp án bạn chọn được cộng +1 điểm cho nhóm RIASEC của câu đó (R/I/A/S/E/C). Mã Holland = 3 chữ cái của 3 nhóm điểm cao nhất. Gợi ý ngành/nghề so khớp điểm của bạn với nhóm chính/phụ của từng nghề trong thư viện LEXA.",
    strengths: topGroups.flatMap((g) => getRiasecType(g.code).skills.slice(0, 2)).slice(0, 6),
    areasToImprove: buildAreasToImprove(scores, topGroups),
    learningEnv: topGroups.map((g) => getRiasecType(g.code).learningEnv).join(" "),
    workEnv: topGroups.map((g) => getRiasecType(g.code).workEnv).join(" "),
    skillsToDevelop: [...skills].slice(0, 8),
    suitableFields: [...fields].slice(0, 10),
    suitableMajors: [...majors].slice(0, 10),
    careers,
    nextSteps: [
      `Đọc kỹ giải thích 3 nhóm ${hollandCode} và lĩnh vực phù hợp bên trên`,
      `Khám phá thư viện nghề theo nhóm ${primary} tại LEXA (không cần chọn nghề ngay)`,
      "Trao đổi kết quả với giáo viên, phụ huynh hoặc tư vấn hướng nghiệp",
      "Khi đã có hướng rõ hơn, vào mục Lộ trình trên trang chủ để đặt mục tiêu nghề",
    ],
  };
}

/** Gộp insights từ 3 nhóm hàng đầu cho profile cũ */
export function hollandToLegacyInsights(result: HollandResult): string[] {
  return [
    result.summary,
    ...result.topGroups.map(
      (g) => `Nhóm ${g.labelVi} (${g.code}): ${g.score} điểm — ${getRiasecType(g.code).shortDesc}`,
    ),
  ].slice(0, 4);
}
