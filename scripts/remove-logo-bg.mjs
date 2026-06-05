/**
 * Xoá nền đen quanh logo trường — flood-fill từ toàn bộ cạnh ảnh.
 */
import { renameSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const input = join(process.cwd(), "public", "binh-son-logo.png");
const tmp = join(process.cwd(), "public", "binh-son-logo-transparent.png");

function isBackground(r, g, b) {
  return r <= 40 && g <= 40 && b <= 40;
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
  if (!isBackground(data[i], data[i + 1], data[i + 2])) return;
  visited[idx] = 1;
  queue.push(idx);
}

// Flood từ mọi pixel trên 4 cạnh
for (let x = 0; x < width; x++) {
  push(x, 0);
  push(x, height - 1);
}
for (let y = 0; y < height; y++) {
  push(0, y);
  push(width - 1, y);
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

await sharp(data, { raw: { width, height, channels: 4 } })
  .resize(256, 256, { fit: "inside", withoutEnlargement: true })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(tmp);

try {
  unlinkSync(input);
} catch {
  /* ignore */
}
renameSync(tmp, input);
console.log("[lexa-ai] Logo background removed → public/binh-son-logo.png");
