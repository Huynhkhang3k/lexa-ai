import { CAREERS } from "./careers";

/** Danh sách nghề rút gọn để gửi AI phân tích */
export function careerCatalogForAi(limit = 64): string {
  return CAREERS.slice(0, limit)
    .map((c) => `- ${c.id}: ${c.name} (${c.tagline})`)
    .join("\n");
}

const VALID_IDS = new Set(CAREERS.map((c) => c.id));

export function resolveCareerId(id: string, name?: string): string | null {
  if (VALID_IDS.has(id)) return id;
  if (name) {
    const byName = CAREERS.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (byName) return byName.id;
  }
  return null;
}

export function careerNameById(id: string): string {
  return CAREERS.find((c) => c.id === id)?.name ?? id;
}
