import {
  CATEGORY_WEIGHTS,
  flattenCurriculumSlots,
  getCurriculumForGrade,
  questionTypesForCategory,
} from "./practice-curriculum";
import type { QuestionCategory, QuestionType } from "./practice-types";

export type CurriculumSlot = {
  grade: number;
  gradeLabel: string;
  chapterId: string;
  chapter: string;
  topicId: string;
  topic: string;
  skillId: string;
  skill: string;
  category: QuestionCategory;
  questionType: QuestionType;
};

export type SessionHistory = {
  topics: string[];
  skills: string[];
  questionTypes: QuestionType[];
  chapters: string[];
  categories: QuestionCategory[];
};

const ALL_CATEGORIES: QuestionCategory[] = [
  "theory",
  "calculation",
  "geometry",
  "real_world",
];

function countCategories(history: SessionHistory): Record<QuestionCategory, number> {
  const counts: Record<QuestionCategory, number> = {
    theory: 0,
    calculation: 0,
    geometry: 0,
    real_world: 0,
  };
  for (const c of history.categories) counts[c]++;
  return counts;
}

function pickCategory(
  totalCount: number,
  history: SessionHistory,
): QuestionCategory {
  const used = countCategories(history);
  const targets = {
    theory: Math.round(totalCount * CATEGORY_WEIGHTS.theory),
    calculation: Math.round(totalCount * CATEGORY_WEIGHTS.calculation),
    geometry: Math.round(totalCount * CATEGORY_WEIGHTS.geometry),
    real_world: Math.max(1, Math.round(totalCount * CATEGORY_WEIGHTS.real_world)),
  };

  let best: QuestionCategory = "theory";
  let bestGap = -Infinity;
  for (const cat of ALL_CATEGORIES) {
    const gap = targets[cat] - used[cat];
    if (gap > bestGap) {
      bestGap = gap;
      best = cat;
    }
  }
  return best;
}

function scoreSlot(
  slot: ReturnType<typeof flattenCurriculumSlots>[number],
  history: SessionHistory,
): number {
  let score = 100;
  if (history.topics.includes(slot.topic)) score -= 40;
  if (history.skills.includes(slot.skill)) score -= 30;
  if (history.chapters.includes(slot.chapter)) score -= 15;
  const recentTopics = history.topics.slice(-3);
  if (recentTopics.includes(slot.topic)) score -= 50;
  return score;
}

function pickQuestionType(
  category: QuestionCategory,
  history: SessionHistory,
): QuestionType {
  const pool = questionTypesForCategory(category);
  const unused = pool.filter((t) => !history.questionTypes.slice(-4).includes(t));
  const candidates = unused.length ? unused : pool;
  const idx = history.questionTypes.length % candidates.length;
  return candidates[idx]!;
}

export function pickCurriculumSlot(
  gradeLabel: string,
  gradeNum: number,
  questionIndex: number,
  totalCount: number,
  history: SessionHistory,
): CurriculumSlot {
  const curriculum = getCurriculumForGrade(gradeNum);
  const allSlots = flattenCurriculumSlots(curriculum);
  const category = pickCategory(totalCount, history);

  const inCategory = allSlots.filter((s) => s.category === category);
  const pool = inCategory.length ? inCategory : allSlots;

  const ranked = [...pool].sort((a, b) => scoreSlot(b, history) - scoreSlot(a, history));
  const chosen = ranked[0] ?? allSlots[0]!;
  const questionType = pickQuestionType(category, history);

  return {
    grade: gradeNum,
    gradeLabel,
    chapterId: chosen.chapterId,
    chapter: chosen.chapter,
    topicId: chosen.topicId,
    topic: chosen.topic,
    skillId: chosen.skillId,
    skill: chosen.skill,
    category,
    questionType,
  };
}

export function emptySessionHistory(): SessionHistory {
  return { topics: [], skills: [], questionTypes: [], chapters: [], categories: [] };
}

export function appendHistory(
  history: SessionHistory,
  slot: CurriculumSlot,
): SessionHistory {
  return {
    topics: [...history.topics, slot.topic],
    skills: [...history.skills, slot.skill],
    questionTypes: [...history.questionTypes, slot.questionType],
    chapters: [...history.chapters, slot.chapter],
    categories: [...history.categories, slot.category],
  };
}
