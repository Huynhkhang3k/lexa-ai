import type { PracticeAnswer, PracticeQuestion, PracticeSessionResult } from "./practice-types";
import { isAnswerCorrect } from "./practice-scoring";

export function analyzePracticeSession(
  questions: PracticeQuestion[],
  answers: Record<string, PracticeAnswer>,
  durationMs: number,
): PracticeSessionResult {
  let correct = 0;
  const topicStats = new Map<string, { ok: number; fail: number }>();

  for (const q of questions) {
    const ok = isAnswerCorrect(q, answers[q.id]);
    if (ok) correct++;
    const topic = q.topic || "Tổng hợp";
    const stat = topicStats.get(topic) ?? { ok: 0, fail: 0 };
    if (ok) stat.ok++;
    else stat.fail++;
    topicStats.set(topic, stat);
  }

  const total = questions.length;
  const wrong = total - correct;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const topicsReview: string[] = [];
  const knowledgeGaps: string[] = [];

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

  if (strengths.length === 0 && correct > 0) {
    strengths.push("Hoàn thành bài với một số câu đúng — tiếp tục duy trì nhịp luyện tập.");
  }
  if (weaknesses.length === 0 && wrong > 0) {
    weaknesses.push("Một số câu sai — xem lại giải thích từng câu để củng cố.");
  }
  if (topicsReview.length === 0 && wrong > 0) {
    topicsReview.push("Vận dụng và suy luận nhiều bước");
  }
  if (knowledgeGaps.length === 0 && wrong > 0) {
    knowledgeGaps.push("Đọc lại lý thuyết chương liên quan và làm thêm 5–10 câu cùng dạng.");
  }

  return {
    correct,
    wrong,
    total,
    accuracy,
    scorePercent: accuracy,
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
