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

/** Tín hiệu ngữ cảnh từ nội dung câu trả lời (không gán nghề trực tiếp từ một từ khóa). */
export type ContextSignals = {
  care: number;
  helping: number;
  meticulous: number;
  calm: number;
  naturalScience: number;
  engineering: number;
  programming: number;
  humanities: number;
};

export function emptyContextSignals(): ContextSignals {
  return {
    care: 0,
    helping: 0,
    meticulous: 0,
    calm: 0,
    naturalScience: 0,
    engineering: 0,
    programming: 0,
    humanities: 0,
  };
}

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

type SignalRule = { pattern: RegExp; signal: keyof ContextSignals; weight: number };

const SIGNAL_RULES: SignalRule[] = [
  { pattern: /chăm sóc|điều dưỡng|y tế|bệnh viện|sức khỏe/, signal: "care", weight: 3 },
  { pattern: /giúp đỡ|giúp ích|phục vụ|tình nguyện|cộng đồng/, signal: "helping", weight: 3 },
  { pattern: /tỉ mỉ|cẩn thận|chính xác|kiên nhẫn với chi tiết/, signal: "meticulous", weight: 2.5 },
  { pattern: /bình tĩnh|điềm tĩnh|giữ bình tĩnh|ổn định cảm xúc/, signal: "calm", weight: 2 },
  {
    pattern: /hóa|lý|sinh|khoa học tự nhiên|thí nghiệm|y khoa|sinh học/,
    signal: "naturalScience",
    weight: 2.5,
  },
  { pattern: /lập trình|code|phần mềm|máy tính|game|ai\b|công nghệ số/, signal: "programming", weight: 3 },
  { pattern: /lắp ráp|máy móc|cơ khí|kỹ thuật|xưởng|robot|điện/, signal: "engineering", weight: 2 },
  { pattern: /văn học|ngữ văn|lịch sử|triết|nhân văn|đọc sách|viết lách/, signal: "humanities", weight: 2 },
];

/** Trích tín hiệu có trọng số từ văn bản câu trả lời. */
export function extractSignalsFromText(text: string): ContextSignals {
  const signals = emptyContextSignals();
  const t = text.toLowerCase().normalize("NFC");
  if (!t.trim()) return signals;

  for (const { pattern, signal, weight } of SIGNAL_RULES) {
    if (pattern.test(t)) signals[signal] += weight;
  }

  // "Lắp ráp" trong ngữ cảnh chăm sóc (mô hình y khoa, dụng cụ) — không cộng kỹ thuật
  if (/lắp ráp|ghép|lắp/.test(t) && /chăm sóc|y tế|bệnh|giúp|bác sĩ|điều dưỡng/.test(t)) {
    signals.engineering = Math.max(0, signals.engineering - 1.5);
    signals.care += 1.5;
    signals.meticulous += 1;
  }

  return signals;
}

function traitsToSignals(traits: TraitId[]): ContextSignals {
  const s = emptyContextSignals();
  for (const trait of traits) {
    if (trait === "social") s.helping += 0.8;
    if (trait === "communication") s.helping += 0.5;
    if (trait === "practical" && !traits.includes("tech")) s.naturalScience += 0.4;
    if (trait === "tech") s.programming += 0.6;
    if (trait === "math" || trait === "logic") s.meticulous += 0.3;
    if (trait === "creative" || trait === "art") s.humanities += 0.5;
  }
  return s;
}

export function mergeSignals(a: ContextSignals, b: ContextSignals, scale = 1): ContextSignals {
  const out = emptyContextSignals();
  for (const key of Object.keys(a) as (keyof ContextSignals)[]) {
    out[key] = a[key] + b[key] * scale;
  }
  return out;
}

export type AnswerForScoring = {
  selectedLabel: string;
  customText?: string;
  traits?: TraitId[];
};

/** Gộp tín hiệu từ toàn bộ bài test (mỗi câu có trọng số bằng nhau). */
export function aggregateContextSignals(answers: AnswerForScoring[]): ContextSignals {
  let total = emptyContextSignals();
  for (const a of answers) {
    const text = [a.selectedLabel, a.customText].filter(Boolean).join(" ");
    const fromText = extractSignalsFromText(text);
    const fromTraits = a.traits?.length ? traitsToSignals(a.traits) : emptyContextSignals();
    total = mergeSignals(total, mergeSignals(fromText, fromTraits));
  }
  return applyContextualBalance(total);
}

/** Cân bằng ngữ cảnh: ưu tiên chăm sóc khi nhiều tín hiệu nhân văn / y tế. */
export function applyContextualBalance(signals: ContextSignals): ContextSignals {
  const careCluster =
    signals.care + signals.helping + signals.meticulous + signals.calm * 0.8 + signals.naturalScience * 0.6;
  const techCluster = signals.programming + signals.engineering * 0.9;

  if (careCluster >= 4 && careCluster >= techCluster * 0.75) {
    return {
      ...signals,
      care: signals.care * 1.15,
      helping: signals.helping * 1.1,
      meticulous: signals.meticulous * 1.1,
      engineering: signals.engineering * 0.55,
      programming: signals.programming * 0.6,
    };
  }

  if (techCluster >= 5 && techCluster > careCluster * 1.4) {
    return {
      ...signals,
      engineering: signals.engineering * 1.1,
      programming: signals.programming * 1.1,
    };
  }

  return signals;
}

export type ScoredCareer = {
  id: string;
  name: string;
  score: number;
  matchPercent: number;
};

type CareerDef = {
  id: string;
  name: string;
  traits: Partial<Record<TraitId, number>>;
  signals: Partial<Record<keyof ContextSignals, number>>;
};

const CAREER_DEFS: CareerDef[] = [
  {
    id: "med",
    name: "Bác sĩ / Y khoa",
    traits: { logic: 2, practical: 2, social: 1 },
    signals: { care: 3, helping: 2, meticulous: 2.5, calm: 2, naturalScience: 3 },
  },
  {
    id: "nurse",
    name: "Y tá",
    traits: { social: 2, practical: 2, communication: 1 },
    signals: { care: 3.5, helping: 3, meticulous: 2, calm: 2 },
  },
  {
    id: "pharm",
    name: "Dược sĩ",
    traits: { logic: 2, math: 1, practical: 2 },
    signals: { care: 2, meticulous: 2.5, naturalScience: 2.5 },
  },
  {
    id: "psych",
    name: "Bác sĩ tâm lý",
    traits: { communication: 3, social: 2, logic: 1 },
    signals: { helping: 3, calm: 2, care: 2, humanities: 1 },
  },
  {
    id: "physio",
    name: "Vật lý trị liệu",
    traits: { practical: 3, social: 1, logic: 1 },
    signals: { care: 2, helping: 2, naturalScience: 1.5, meticulous: 1.5 },
  },
  {
    id: "teacher",
    name: "Giáo viên",
    traits: { communication: 3, social: 2, creative: 1 },
    signals: { helping: 2.5, humanities: 2, calm: 1 },
  },
  {
    id: "social-worker",
    name: "Nhân viên xã hội",
    traits: { social: 3, communication: 2 },
    signals: { helping: 3.5, care: 2.5, calm: 1.5 },
  },
  {
    id: "mech",
    name: "Kỹ sư cơ khí",
    traits: { practical: 3, math: 2, logic: 2 },
    signals: { engineering: 3, meticulous: 1 },
  },
  {
    id: "civil-eng",
    name: "Kỹ sư xây dựng",
    traits: { math: 2, practical: 2, logic: 2 },
    signals: { engineering: 2.5, meticulous: 1.5 },
  },
  {
    id: "elec-eng",
    name: "Kỹ sư điện",
    traits: { math: 2, logic: 2, practical: 2, tech: 1 },
    signals: { engineering: 2.5, programming: 0.5 },
  },
  {
    id: "arch",
    name: "Kiến trúc sư",
    traits: { design: 2, art: 2, math: 2, creative: 2 },
    signals: { engineering: 1, humanities: 1, meticulous: 1.5 },
  },
  {
    id: "law",
    name: "Luật sư",
    traits: { logic: 3, communication: 2, leadership: 1 },
    signals: { humanities: 2, meticulous: 1.5, calm: 1 },
  },
  {
    id: "ux",
    name: "Thiết kế UI/UX",
    traits: { design: 3, creative: 2, art: 2, tech: 1 },
    signals: { humanities: 1, meticulous: 1 },
  },
  {
    id: "mk",
    name: "Marketing",
    traits: { creative: 2, communication: 3, business: 2 },
    signals: { humanities: 1 },
  },
  {
    id: "se",
    name: "Kỹ sư phần mềm",
    traits: { logic: 2, tech: 2, math: 1 },
    signals: { programming: 3, meticulous: 1 },
  },
  {
    id: "ai-eng",
    name: "Kỹ sư AI / Học máy",
    traits: { logic: 2, tech: 2, math: 2 },
    signals: { programming: 3, naturalScience: 0.5 },
  },
  {
    id: "da",
    name: "Phân tích dữ liệu",
    traits: { logic: 2, math: 3, tech: 1 },
    signals: { programming: 1.5, meticulous: 2 },
  },
];

const TRAIT_CAP = 12;
const SIGNAL_CAP = 28;

function careerRawScore(
  def: CareerDef,
  traitScores: TraitScores,
  signals: ContextSignals,
): number {
  let score = 0;
  for (const [trait, w] of Object.entries(def.traits) as [TraitId, number][]) {
    score += Math.min(traitScores[trait] ?? 0, TRAIT_CAP) * w;
  }
  for (const [sig, w] of Object.entries(def.signals) as [keyof ContextSignals, number][]) {
    score += Math.min(signals[sig] ?? 0, SIGNAL_CAP) * w;
  }
  return score;
}

function assignMatchPercents(ranked: { id: string; name: string; score: number }[]): ScoredCareer[] {
  if (!ranked.length) return [];
  const top = ranked[0]!.score;
  const second = ranked[1]?.score ?? 0;

  return ranked.map((c, i) => {
    if (i === 0) {
      const lead = top > 0 ? Math.min(98, Math.max(84, Math.round(82 + (c.score / (top + 8)) * 14))) : 88;
      return { ...c, matchPercent: lead };
    }
    const ratio = top > 0 ? c.score / top : 0.5;
    const gapBoost = top - second > 3 ? 6 : 0;
    const pct = Math.min(82, Math.max(48, Math.round(ratio * 78 - i * 5 - gapBoost)));
    return { ...c, matchPercent: pct };
  });
}

export function scoreCareers(
  traitScores: TraitScores,
  signals: ContextSignals = emptyContextSignals(),
): ScoredCareer[] {
  const ranked = CAREER_DEFS.map((def) => ({
    id: def.id,
    name: def.name,
    score: careerRawScore(def, traitScores, signals),
  }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  return assignMatchPercents(ranked).slice(0, 5);
}

export function topTraits(traitScores: TraitScores, n = 3): TraitId[] {
  return (Object.entries(traitScores) as [TraitId, number][])
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0)
    .slice(0, n)
    .map(([k]) => k);
}

const CAREER_NARRATIVES: Record<string, (signals: ContextSignals) => string> = {
  med: (s) =>
    s.naturalScience >= 3
      ? "Bạn hướng tới công việc kết hợp khoa học tự nhiên với việc chăm sóc con người — đúng tinh thần ngành Y."
      : "Bạn thể hiện mong muốn giúp đỡ và chăm sóc người khác một cách kiên nhẫn, phù hợp với con đường Bác sĩ.",
  nurse: () =>
    "Bạn phù hợp với vai trò y tá — đồng hành cùng bệnh nhân, chăm sóc tận tình và giữ bình tĩnh trong áp lực.",
  pharm: () =>
    "Sự tỉ mỉ và quan tâm đến sức khỏe qua khoa học cho thấy bạn có thể phát triển tốt trong ngành Dược.",
  psych: () =>
    "Bạn có xu hướng lắng nghe, đồng cảm và hỗ trợ người khác vượt qua khó khăn tâm lý — phù hợp con đường Bác sĩ tâm lý.",
  physio: () =>
    "Kết hợp thực hành và mong muốn cải thiện sức khỏe cho người khác phù hợp với Vật lý trị liệu.",
  teacher: () =>
    "Bạn thích chia sẻ kiến thức và truyền cảm hứng — phù hợp với nghề Giáo viên.",
  "social-worker": () =>
    "Ưu tiên giúp đỡ cộng đồng và những người cần hỗ trợ cho thấy hướng đi Nhân viên xã hội.",
  mech: () =>
    "Sở thích làm việc với máy móc, lắp ráp và giải quyết bài toán kỹ thuật cụ thể phù hợp Kỹ sư cơ khí.",
  "civil-eng": () =>
    "Bạn hợp với công việc thiết kế, xây dựng và đảm bảo chất lượng công trình thực tế.",
  "elec-eng": () =>
    "Tư duy hệ thống kết hợp kỹ thuật điện — mạch và thiết bị phù hợp với Kỹ sư điện.",
  arch: () =>
    "Cân bằng giữa sáng tạo và tính toán trong không gian sống phù hợp Kiến trúc sư.",
  law: () =>
    "Khả năng lập luận và giao tiếp rõ ràng hỗ trợ bạn trên con đường Luật.",
  ux: () =>
    "Bạn quan tâm trải nghiệm người dùng và thẩm mỹ giao diện — hướng UI/UX.",
  mk: () =>
    "Sáng tạo nội dung và kết nối với khách hàng phù hợp Marketing.",
  se: () =>
    "Bạn thích xây dựng giải pháp số có logic rõ ràng — phù hợp Kỹ sư phần mềm.",
  "ai-eng": () =>
    "Hứng thú với công nghệ tiên tiến và mô hình toán học gợi ý hướng AI / Học máy.",
  da: () =>
    "Thích làm việc với dữ liệu, con số và kết luận có căn cứ — Phân tích dữ liệu.",
};

export function careerWhyFromProfile(
  careerId: string,
  careerName: string,
  signals: ContextSignals,
  traitScores: TraitScores,
): string {
  const narrative = CAREER_NARRATIVES[careerId];
  if (narrative) return narrative(signals);

  const tops = topTraits(traitScores, 2).map((t) => TRAIT_LABELS[t].toLowerCase());
  if (tops.length) {
    return `Hồ sơ năng lực của bạn nổi bật ở ${tops.join(" và ")} — phù hợp với yêu cầu của ${careerName}.`;
  }
  return `Tổng hợp câu trả lời cho thấy ${careerName} là hướng đi phù hợp với bạn nhất lúc này.`;
}

export function buildSummaryForCareer(
  careerName: string,
  signals: ContextSignals,
  traitScores: TraitScores,
): string {
  const careLean =
    signals.care + signals.helping + signals.meticulous >=
    signals.programming + signals.engineering + (traitScores.tech ?? 0);

  if (careLean) {
    return `Qua bài đánh giá, bạn thiên về hỗ trợ con người và làm việc có trách nhiệm. ${careerName} là hướng nghề nghiệp phù hợp nhất với hồ sơ này.`;
  }
  if (signals.programming + (traitScores.tech ?? 0) >= 4) {
    return `Bạn thể hiện sở thích với công nghệ và giải quyết vấn đề có hệ thống. ${careerName} là lựa chọn nổi bật từ kết quả bài test.`;
  }
  if (signals.engineering >= 3) {
    return `Bạn hướng tới công việc kỹ thuật, thực hành và ứng dụng khoa học vào đời sống. ${careerName} phản ánh đúng xu hướng đó.`;
  }
  return `Dựa trên toàn bộ câu trả lời, ${careerName} là nghề phù hợp nhất với cách bạn học, làm việc và định hướng tương lai.`;
}

export function buildInsights(traitScores: TraitScores, signals?: ContextSignals): string[] {
  const insights: string[] = [];
  const s = signals ?? emptyContextSignals();

  if (s.helping + s.care >= 4) {
    insights.push("Bạn ưu tiên công việc có ý nghĩa với con người và cộng đồng.");
  } else if (traitScores.social >= 2) {
    insights.push("Bạn thoải mái khi làm việc và hỗ trợ người khác.");
  }

  if (s.meticulous >= 3 || s.calm >= 2) {
    insights.push("Bạn có điểm mạnh về sự tỉ mỉ và giữ bình tĩnh khi gặp áp lực.");
  }

  if (s.naturalScience >= 3) {
    insights.push("Bạn hứng thú với khoa học tự nhiên và học qua trải nghiệm thực tế.");
  } else if (traitScores.practical >= 2 && (traitScores.tech ?? 0) < 2) {
    insights.push("Bạn học hiệu quả qua thực hành và quan sát trực tiếp.");
  }

  if (s.programming + (traitScores.tech ?? 0) >= 4 && s.helping + s.care < 4) {
    insights.push("Bạn quan tâm đến công nghệ và giải pháp số.");
  } else if (s.engineering >= 3 && s.helping + s.care < 4) {
    insights.push("Bạn thích làm việc với máy móc và bài toán kỹ thuật cụ thể.");
  }

  if (traitScores.creative >= 2 || traitScores.art >= 2) {
    insights.push("Bạn thể hiện sở thích sáng tạo và biểu đạt ý tưởng.");
  }

  if (traitScores.logic >= 2 && insights.length < 3) {
    insights.push("Bạn có xu hướng thích giải quyết vấn đề có hệ thống.");
  }

  if (insights.length === 0) {
    const top = topTraits(traitScores, 3);
    for (const t of top) {
      insights.push(`Điểm nổi bật: ${TRAIT_LABELS[t]}.`);
    }
  }

  return insights.slice(0, 4);
}

/** @deprecated Dùng careerWhyFromProfile */
export function careerWhy(name: string, traitScores: TraitScores): string {
  return careerWhyFromProfile("", name, emptyContextSignals(), traitScores);
}
