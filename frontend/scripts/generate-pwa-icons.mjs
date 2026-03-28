import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const svgPath = join(publicDir, 'thekedaari-app-icon.svg');

await sharp(svgPath).resize(192, 192).png().toFile(join(publicDir, 'icon-192x192.png'));
await sharp(svgPath).resize(512, 512).png().toFile(join(publicDir, 'icon-512x512.png'));
await sharp(svgPath).resize(180, 180).png().toFile(join(publicDir, 'apple-touch-icon.png'));

console.log('PWA icons written: icon-192x192.png, icon-512x512.png, apple-touch-icon.png');
