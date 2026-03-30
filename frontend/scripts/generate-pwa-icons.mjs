import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
/** Source asset (may be JPEG bytes with .png extension). */
const logoPath = join(publicDir, 'thekedaari-logo.png');
const brandOut = join(publicDir, 'thekedaari-logo.png');
/** Match logo canvas (white) for icon padding */
const bg = { r: 255, g: 255, b: 255, alpha: 1 };

const input = await sharp(logoPath).toBuffer();

await sharp(input).png().toFile(brandOut);

async function writeSquarePng(size, outName) {
  await sharp(input)
    .resize(size, size, { fit: 'contain', background: bg })
    .png()
    .toFile(join(publicDir, outName));
}

await writeSquarePng(192, 'icon-192x192.png');
await writeSquarePng(512, 'icon-512x512.png');
await writeSquarePng(180, 'apple-touch-icon.png');

console.log(
  'PWA icons written: thekedaari-logo.png (normalized), icon-192x192.png, icon-512x512.png, apple-touch-icon.png',
);
