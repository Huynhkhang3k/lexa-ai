/**
 * Xoá nền đen quanh logo trường — giữ alpha trong suốt.
 */
import { renameSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const input = join(process.cwd(), "public", "binh-son-logo.png");
const tmp = join(process.cwd(), "public", "binh-son-logo-transparent.png");

const THRESHOLD = 42;

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r <= THRESHOLD && g <= THRESHOLD && b <= THRESHOLD) {
    data[i + 3] = 0;
  }
}

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toFile(tmp);

try {
  unlinkSync(input);
} catch {
  /* ignore */
}
renameSync(tmp, input);
console.log("[lexa-ai] Logo background removed → public/binh-son-logo.png");
