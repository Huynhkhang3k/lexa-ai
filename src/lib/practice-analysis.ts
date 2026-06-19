import type { PracticeAnswer, PracticeQuestion, PracticeSessionResult } from "./practice-types";
import { hasAnswer } from "./practice-helpers";
import { isAnswerCorrect } from "./practice-scoring";

function questionAt(
  questions: PracticeQuestion[],
  index: number,
): PracticeQuestion | undefined {
  const id = `q${index + 1}`;
  return questions.find((q) => q.id === id) ?? questions[index];
}

/** (correct / total) × 100, làm tròn 2 chữ số thập phân */
export function computeScorePercent(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 10000) / 100;
}

export function formatScorePercent(percent: number): string {
  if (Number.isInteger(percent)) return `${percent}%`;
  return `${percent.toFixed(2)}%`;
}

/**
 * Chấm theo totalQuestions (20/30).
 * - wrong: chỉ câu đã trả lời nhưng sai
 * - unanswered: chưa làm (kể cả chưa tải câu)
 * - notCorrect: total - correct (= sai + chưa làm)
 */
export function analyzePracticeSession(
  questions: PracticeQuestion[],
  answers: Record<string, PracticeAnswer>,
  durationMs: number,
  totalQuestions: number,
): PracticeSessionResult {
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let unansweredQuestions = 0;
  const topicStats = new Map<string, { ok: number; fail: number }>();

  const total = Math.max(totalQuestions, 1);

  for (let i = 0; i < total; i++) {
    const q = questionAt(questions, i);

    if (!q) {
      unansweredQuestions++;
      continue;
    }

    const ans = answers[q.id];
    if (!hasAnswer(q, ans)) {
      unansweredQuestions++;
      const topic = q.topic || "Tổng hợp";
      const stat = topicStats.get(topic) ?? { ok: 0, fail: 0 };
      stat.fail++;
      topicStats.set(topic, stat);
      continue;
    }

    const ok = isAnswerCorrect(q, ans);
    const topic = q.topic || "Tổng hợp";
    const stat = topicStats.get(topic) ?? { ok: 0, fail: 0 };

    if (ok) {
      correctAnswers++;
      stat.ok++;
    } else {
      wrongAnswers++;
      stat.fail++;
    }
    topicStats.set(topic, stat);
  }

  const answeredQuestions = correctAnswers + wrongAnswers;
  const notCorrect = total - correctAnswers;
  const finalScore = computeScorePercent(correctAnswers, total);

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const topicsReview: string[] = [];
  const knowledgeGaps: string[] = [];

  if (unansweredQuestions > 0) {
    weaknesses.push(`Còn ${unansweredQuestions} câu chưa làm — không được tính điểm`);
    topicsReview.push("Hoàn thành đủ số câu trong thời gian quy định");
  }

  for (const [topic, stat] of topicStats) {
    const rate = stat.ok + stat.fail > 0 ? stat.ok / (stat.ok + stat.fail) : 0;
    if (rate >= 0.75 && stat.ok >= 2) {
      strengths.push(`${topic} (${Math.round(rate * 100)}% đúng)`);
    }
    if (rate < 0.5 && stat.fail >= 1) {
      weaknesses.push(`${topic} (${Math.round(rate * 100)}% đúng)`);
      topicsReview.push(topic);
      knowledgeGaps.push(`Ôn lại kiến thức ${topic.toLowerCase()} — cần luyện thêm bài nhiều bước.`);
    } else if (rate < 0.75 && stat.fail >= 1) {
      topicsReview.push(topic);
    }
  }

  if (strengths.length === 0 && correctAnswers > 0) {
    strengths.push("Hoàn thành bài với một số câu đúng — tiếp tục duy trì nhịp luyện tập.");
  }
  if (weaknesses.length === 0 && notCorrect > 0) {
    weaknesses.push("Một số câu sai hoặc bỏ trống — xem lại giải thích từng câu để củng cố.");
  }
  if (topicsReview.length === 0 && notCorrect > 0) {
    topicsReview.push("Vận dụng và suy luận nhiều bước");
  }
  if (knowledgeGaps.length === 0 && wrongAnswers > 0 && unansweredQuestions === 0) {
    knowledgeGaps.push("Đọc lại lý thuyết chương liên quan và làm thêm 5–10 câu cùng dạng.");
  }

  return {
    totalQuestions: total,
    correctAnswers,
    wrongAnswers,
    unansweredQuestions,
    answeredQuestions,
    notCorrect,
    finalScore,
    correct: correctAnswers,
    wrong: wrongAnswers,
    total,
    answered: answeredQuestions,
    unanswered: unansweredQuestions,
    accuracy: finalScore,
    scorePercent: finalScore,
    durationMs,
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
    topicsReview: [...new Set(topicsReview)].slice(0, 5),
    knowledgeGaps: knowledgeGaps.slice(0, 5),
  };
}

export function formatDuration(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatTimer(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
