import { rmSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), ".next");

try {
  rmSync(dir, { recursive: true, force: true });
  console.log("[lexa-ai] Removed .next (fixes stale chunk errors on Windows)");
} catch {
  console.warn("[lexa-ai] Could not remove .next — stop `npm run dev` first, then retry.");
}
