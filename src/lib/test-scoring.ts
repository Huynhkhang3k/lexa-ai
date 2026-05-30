export type TraitId =
  | "logic"
  | "tech"
  | "math"
  | "creative"
  | "art"
  | "design"
  | "communication"
  | "leadership"
  | "business"
  | "social"
  | "practical";

export const TRAIT_LABELS: Record<TraitId, string> = {
  logic: "Tư duy logic",
  tech: "Công nghệ",
  math: "Toán học",
  creative: "Sáng tạo",
  art: "Nghệ thuật",
  design: "Thiết kế",
  communication: "Giao tiếp",
  leadership: "Lãnh đạo",
  business: "Kinh doanh",
  social: "Kết nối xã hội",
  practical: "Thực hành",
};

export type TraitScores = Record<TraitId, number>;

export function emptyTraitScores(): TraitScores {
  return {
    logic: 0,
    tech: 0,
    math: 0,
    creative: 0,
    art: 0,
    design: 0,
    communication: 0,
    leadership: 0,
    business: 0,
    social: 0,
    practical: 0,
  };
}

export function addTraits(scores: TraitScores, traits: TraitId[], weight = 1) {
  for (const t of traits) {
    scores[t] += weight;
  }
}

export type ScoredCareer = {
  id: string;
  name: string;
  score: number;
  matchPercent: number;
};

const CAREER_WEIGHTS: { id: string; name: string; weights: Partial<Record<TraitId, number>> }[] = [
  { id: "ai-eng", name: "Kỹ sư AI / Học máy", weights: { logic: 3, tech: 3, math: 2 } },
  { id: "se", name: "Kỹ sư phần mềm", weights: { logic: 3, tech: 3, math: 1 } },
  { id: "da", name: "Phân tích dữ liệu", weights: { logic: 2, math: 3, tech: 2 } },
  { id: "ux", name: "Thiết kế UI/UX", weights: { design: 3, creative: 2, art: 2, tech: 1 } },
  { id: "mk", name: "Marketing số", weights: { creative: 2, communication: 3, business: 2 } },
  { id: "pm", name: "Quản lý sản phẩm", weights: { leadership: 2, communication: 2, business: 2, logic: 1 } },
  { id: "med", name: "Bác sĩ / Y khoa", weights: { logic: 2, practical: 3, social: 1 } },
  { id: "teacher", name: "Giáo viên", weights: { communication: 3, social: 2, creative: 1 } },
  { id: "law", name: "Luật sư", weights: { logic: 3, communication: 2, leadership: 1 } },
  { id: "arch", name: "Kiến trúc sư", weights: { design: 2, art: 2, math: 2, creative: 2 } },
];

export function scoreCareers(traitScores: TraitScores): ScoredCareer[] {
  const ranked = CAREER_WEIGHTS.map((c) => {
    let score = 0;
    let max = 0;
    for (const [trait, w] of Object.entries(c.weights) as [TraitId, number][]) {
      max += w * 5;
      score += (traitScores[trait] ?? 0) * w;
    }
    const matchPercent = max > 0 ? Math.min(95, Math.max(55, Math.round((score / max) * 100))) : 60;
    return { id: c.id, name: c.name, score, matchPercent };
  })
    .sort((a, b) => b.score - a.score)
    .filter((c) => c.score > 0);

  return ranked.slice(0, 5);
}

export function topTraits(traitScores: TraitScores, n = 3): TraitId[] {
  return (Object.entries(traitScores) as [TraitId, number][])
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0)
    .slice(0, n)
    .map(([k]) => k);
}

export function buildInsights(traitScores: TraitScores): string[] {
  const top = topTraits(traitScores, 4);
  const insights: string[] = [];

  if (traitScores.logic >= 2) {
    insights.push("Bạn có xu hướng thích giải quyết vấn đề có hệ thống.");
  }
  if (traitScores.tech >= 2) {
    insights.push("Bạn quan tâm đến công nghệ và công cụ số.");
  }
  if (traitScores.math >= 2) {
    insights.push("Bạn học tốt với môn có tính logic và con số.");
  }
  if (traitScores.creative >= 2 || traitScores.art >= 2) {
    insights.push("Bạn thể hiện sở thích sáng tạo và biểu đạt ý tưởng.");
  }
  if (traitScores.communication >= 2) {
    insights.push("Bạn thoải mái khi giao tiếp và làm việc với người khác.");
  }
  if (traitScores.leadership >= 2 || traitScores.business >= 2) {
    insights.push("Bạn có dấu hiệu phù hợp với vai trò điều phối và ra quyết định.");
  }
  if (traitScores.practical >= 2) {
    insights.push("Bạn học hiệu quả qua thực hành và trải nghiệm trực tiếp.");
  }

  if (insights.length === 0 && top.length > 0) {
    for (const t of top.slice(0, 3)) {
      insights.push(`Điểm nổi bật: ${TRAIT_LABELS[t]}.`);
    }
  }

  return insights.slice(0, 4);
}

/** Gợi ý lý do nghề từ trait scores */
export function careerWhy(name: string, traitScores: TraitScores): string {
  const top = topTraits(traitScores, 2).map((t) => TRAIT_LABELS[t].toLowerCase());
  if (top.length === 0) return `Phù hợp với hồ sơ sở thích và năng lực bạn thể hiện trong bài đánh giá.`;
  return `Phù hợp vì bạn thiên về ${top.join(" và ")} — phù hợp với yêu cầu của ${name}.`;
}
