import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const targets = [
  ['public/icon.svg', 'public/icon-192.png', 192],
  ['public/icon.svg', 'public/icon-512.png', 512],
  ['public/icon.svg', 'public/apple-touch-icon.png', 180],
  ['public/icon-maskable.svg', 'public/icon-maskable-512.png', 512],
];
for (const [src, out, size] of targets) {
  await sharp(readFileSync(src), { density: 384 }).resize(size, size).png().toFile(out);
  console.log('généré', out);
}
