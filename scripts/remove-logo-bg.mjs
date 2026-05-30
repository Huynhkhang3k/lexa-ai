/**
 * Xoá nền đen ở góc logo (flood-fill từ 4 góc) — giữ nguyên nội dung logo.
 */
import { renameSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const input = join(process.cwd(), "public", "binh-son-logo.png");
const tmp = join(process.cwd(), "public", "binh-son-logo-transparent.png");

const TOLERANCE = 28;

function colorKey(r, g, b) {
  return (r << 16) | (g << 8) | b;
}

function nearBlack(r, g, b) {
  return r <= TOLERANCE && g <= TOLERANCE && b <= TOLERANCE;
}

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height } = info;
const visited = new Uint8Array(width * height);
const queue = [];

function push(x, y) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const idx = y * width + x;
  if (visited[idx]) return;
  const i = idx * 4;
  if (!nearBlack(data[i], data[i + 1], data[i + 2])) return;
  visited[idx] = 1;
  queue.push(idx);
}

for (const [x, y] of [
  [0, 0],
  [width - 1, 0],
  [0, height - 1],
  [width - 1, height - 1],
]) {
  push(x, y);
}

while (queue.length) {
  const idx = queue.pop();
  const x = idx % width;
  const y = Math.floor(idx / width);
  push(x - 1, y);
  push(x + 1, y);
  push(x, y - 1);
  push(x, y + 1);
}

for (let idx = 0; idx < visited.length; idx++) {
  if (visited[idx]) {
    data[idx * 4 + 3] = 0;
  }
}

await sharp(data, { raw: { width, height, channels: 4 } }).png().toFile(tmp);

try {
  unlinkSync(input);
} catch {
  /* ignore */
}
renameSync(tmp, input);
console.log("[lexa-ai] Logo corner background removed → public/binh-son-logo.png");
