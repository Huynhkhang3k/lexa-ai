import type { GradeLevelId } from "./grade-level";
import { gradeLevelLabel } from "./grade-level";
import type { HollandResult } from "./holland-scoring";
import { getRiasecType } from "./holland-riasec";
import { buildRoadmap, type RoadmapStep } from "./roadmap";

/** Lộ trình cá nhân từ kết quả RIASEC thật — không hard-code kết quả. */
export function buildHollandRoadmap(
  result: HollandResult,
  gradeLevel: GradeLevelId,
): RoadmapStep[] {
  const steps: RoadmapStep[] = [];
  const gradeLabel = gradeLevelLabel(gradeLevel);
  const topCareer = result.careers[0];

  steps.push({
    label: gradeLabel,
    focus: `Xuất phát từ khối ${gradeLabel} — mã Holland ${result.hollandCode}`,
  });

  if (result.topGroups.length > 0) {
    steps.push({
      label: `Nhóm tính cách nổi bật: ${result.hollandCode}`,
      focus: result.topGroups
        .map((g) => `${g.labelVi} (${g.code}): ${g.score} điểm`)
        .join(" · "),
    });
  }

  for (const g of result.topGroups) {
    const t = getRiasecType(g.code);
    steps.push({
      label: `${g.code} — ${g.labelVi}`,
      focus: t.personality,
    });
  }

  if (result.suitableFields.length > 0) {
    steps.push({
      label: "Lĩnh vực phù hợp",
      focus: result.suitableFields.slice(0, 6).join(" · "),
    });
  }

  if (result.suitableMajors.length > 0) {
    steps.push({
      label: "Gợi ý ngành học",
      focus: result.suitableMajors.slice(0, 6).join(" · "),
    });
  }

  if (result.skillsToDevelop.length > 0) {
    steps.push({
      label: "Kỹ năng cần phát triển",
      focus: result.skillsToDevelop.slice(0, 8).join(" · "),
    });
  }

  if (topCareer) {
    const careerSteps = buildRoadmap(topCareer.id, topCareer.name, gradeLevel);
    const careerTail = careerSteps.filter((s, i) => i > 0 && !s.isGoal);
    steps.push(...careerTail);
    const goal = careerSteps.find((s) => s.isGoal);
    if (goal) steps.push(goal);
  } else if (result.topGroups[0]) {
    const primary = getRiasecType(result.topGroups[0].code);
    steps.push({
      label: `Định hướng ${primary.labelVi}`,
      focus: `Khám phá nghề thuộc nhóm ${primary.labelVi} trong thư viện LEXA`,
      isGoal: true,
    });
  }

  return steps;
}
