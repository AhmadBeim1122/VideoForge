import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
  // Simple uncompressed or deflate PNG generator
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type RGBA (6)
  ihdrData.writeUInt8(0, 10); // compression method 0
  ihdrData.writeUInt8(0, 11); // filter method 0
  ihdrData.writeUInt8(0, 12); // interlace method 0
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.38;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Dark background #121212
      let pr = 18;
      let pg = 18;
      let pb = 18;
      let pa = 255;

      // Inside circle/squircle draw gold accent #FFC800
      if (dist < radius) {
        // Gold accent center box/symbol
        const isCenterSquare = Math.abs(dx) < radius * 0.65 && Math.abs(dy) < radius * 0.65;
        if (isCenterSquare) {
          pr = 255;
          pg = 200;
          pb = 0;
        } else {
          pr = 32;
          pg = 32;
          pb = 32;
        }
      }

      rawData[offset++] = pr;
      rawData[offset++] = pg;
      rawData[offset++] = pb;
      rawData[offset++] = pa;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const typeBuf = Buffer.from(type, 'ascii');
  const buf = Buffer.alloc(4 + 4 + length + 4);

  buf.writeUInt32BE(length, 0);
  typeBuf.copy(buf, 4);
  data.copy(buf, 8);

  const crc = crc32(Buffer.concat([typeBuf, data]));
  buf.writeInt32BE(crc, 8 + length);

  return buf;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc = crc ^ byte;
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return ~crc;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, 255, 200, 0));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, 255, 200, 0));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 255, 200, 0));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, 255, 200, 0));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(32, 32, 255, 200, 0));

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="110" fill="#121212"/>
  <rect x="76" y="76" width="360" height="360" rx="72" fill="#1e1e1e" stroke="#2e2e2e" stroke-width="12"/>
  <path d="M156 160 H230 L280 290 L330 160 H404 L318 360 H242 Z" fill="#FFC800"/>
  <circle cx="280" cy="190" r="24" fill="#FFC800" opacity="0.3"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

console.log('Successfully generated PWA icon assets in public/');
