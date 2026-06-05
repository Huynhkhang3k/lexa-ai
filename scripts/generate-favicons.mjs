/**
 * Tải logo LEXA, trim khoảng trắng, tạo favicon đa kích thước (85–90% khung, nền trong suốt).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const LOGO_URL = "https://i.postimg.cc/28HXjRVM/logo.png";
const LOGO_FILL = 0.875; // ~87.5% khung — nằm trong khoảng 85–90%

const SIZES = [16, 32, 48, 180, 512];
const root = process.cwd();
const publicIcons = join(root, "public", "icons");
const appDir = join(root, "src", "app");

mkdirSync(publicIcons, { recursive: true });

async function downloadLogo() {
  const res = await fetch(LOGO_URL);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function trimLogo(input) {
  return sharp(input)
    .ensureAlpha()
    .trim({ threshold: 12, background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .trim({ threshold: 12 })
    .png()
    .toBuffer();
}

async function makeSquareIcon(trimmed, size) {
  const innerMax = Math.max(1, Math.round(size * LOGO_FILL));
  const resized = await sharp(trimmed)
    .resize(innerMax, innerMax, { fit: "inside", withoutEnlargement: false })
    .png()
    .toBuffer();

  const { width, height } = await sharp(resized).metadata();
  const left = Math.round((size - (width ?? size)) / 2);
  const top = Math.round((size - (height ?? size)) / 2);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, left, top }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

/** ICO chứa PNG (Windows Vista+) — hỗ trợ nhiều kích thước. */
function buildIco(pngBySize) {
  const entries = [];
  const images = [];

  for (const [size, png] of pngBySize) {
    entries.push({ size, png, offset: 0 });
    images.push(png);
  }

  const headerSize = 6 + entries.length * 16;
  let offset = headerSize;
  for (let i = 0; i < entries.length; i++) {
    entries[i].offset = offset;
    offset += images[i].length;
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const dirs = entries.map(({ size, png, offset: off }) => {
    const dir = Buffer.alloc(16);
    dir[0] = size >= 256 ? 0 : size;
    dir[1] = size >= 256 ? 0 : size;
    dir[2] = 0;
    dir[3] = 0;
    dir.writeUInt16LE(1, 4);
    dir.writeUInt16LE(32, 6);
    dir.writeUInt32LE(png.length, 8);
    dir.writeUInt32LE(off, 12);
    return dir;
  });

  return Buffer.concat([header, ...dirs, ...images]);
}

const raw = await downloadLogo();
const trimmed = await trimLogo(raw);
const trimMeta = await sharp(trimmed).metadata();
console.log(`Logo sau trim: ${trimMeta.width}x${trimMeta.height}px`);

const pngBySize = new Map();

for (const size of SIZES) {
  const png = await makeSquareIcon(trimmed, size);
  pngBySize.set(size, png);
  const out = join(publicIcons, `icon-${size}.png`);
  writeFileSync(out, png);
  console.log(`✓ public/icons/icon-${size}.png`);
}

// Next.js App Router — favicon.ico (16/32/48)
writeFileSync(join(appDir, "favicon.ico"), buildIco(icoSizes));
writeFileSync(join(publicIcons, "favicon.ico"), buildIco(icoSizes));
console.log("✓ src/app/favicon.ico + public/icons/favicon.ico (16, 32, 48)");

// Kiểm tra 16x16
const tiny = await sharp(pngBySize.get(16)).stats();
const alphaMax = tiny.channels[3]?.max ?? 255;
console.log(
  alphaMax > 0
    ? "16x16: logo có pixel hiển thị — OK"
    : "16x16: cảnh báo — logo có thể quá mỏng, xem lại trim",
);
