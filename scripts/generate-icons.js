const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crc = zlib.crc32(crcInput);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createIHDR(width, height) {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0);
  data.writeUInt32BE(height, 4);
  data[8] = 8;  // bit depth: 8 bits per channel
  data[9] = 6;  // color type: RGBA
  data[10] = 0; // deflate
  data[11] = 0; // filter method
  data[12] = 0; // no interlace
  return createChunk('IHDR', data);
}

function generateIconBuffer(size) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = createIHDR(size, size);

  const rawBytesPerRow = 1 + size * 4;
  const raw = Buffer.alloc(rawBytesPerRow * size);

  const cornerRadius = size * 0.22;
  const cxAmber = size * 0.77;
  const cyAmber = size * 0.23;
  const rAmber = size * 0.045;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rawBytesPerRow;
    raw[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < size; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Check rounded rectangle bounds
      let inBounds = true;
      const dxCorner = Math.max(0, Math.max(cornerRadius - x, x - (size - 1 - cornerRadius)));
      const dyCorner = Math.max(0, Math.max(cornerRadius - y, y - (size - 1 - cornerRadius)));
      if (dxCorner > 0 && dyCorner > 0) {
        if (Math.hypot(dxCorner, dyCorner) > cornerRadius) {
          inBounds = false;
        }
      }

      if (!inBounds) {
        // Transparent outside rounded corners
        raw[pxOffset] = 0;
        raw[pxOffset + 1] = 0;
        raw[pxOffset + 2] = 0;
        raw[pxOffset + 3] = 0;
        continue;
      }

      // Default background: #0B0F17
      let r = 11, g = 15, b = 23, a = 255;

      // Cyan Border glow: 3px inset
      const borderDist = Math.min(x, size - 1 - x, y, size - 1 - y);
      if (borderDist >= size * 0.02 && borderDist <= size * 0.035) {
        r = 6; g = 182; b = 212; a = 180; // #06B6D4
      }

      // Amber dot (#F59E0B)
      const distToAmber = Math.hypot(x - cxAmber, y - cyAmber);
      if (distToAmber <= rAmber) {
        r = 245; g = 158; b = 11; a = 255;
      } else if (distToAmber <= rAmber + 1.5) {
        // Soft edge
        const t = (distToAmber - rAmber) / 1.5;
        r = Math.round(245 * (1 - t) + 11 * t);
        g = Math.round(158 * (1 - t) + 15 * t);
        b = Math.round(11 * (1 - t) + 23 * t);
      }

      // Center High-Tech Sound Wave & Calligraphic Rhythm Bars
      // Draw 5 vertical harmonic bars representing Chao 5-level pitch and "韵" rhythm
      const barWidth = size * 0.055;
      const barGap = size * 0.04;
      const totalWidth = 5 * barWidth + 4 * barGap;
      const startX = (size - totalWidth) / 2;

      // Bar heights representing tone contours (1: 40%, 2: 60%, 3: 75%, 4: 55%, 5: 35%)
      const barHeights = [0.35, 0.55, 0.68, 0.50, 0.38];
      const centerY = size * 0.52;

      for (let i = 0; i < 5; i++) {
        const bx = startX + i * (barWidth + barGap);
        const bh = size * barHeights[i];
        const by1 = centerY - bh / 2;
        const by2 = centerY + bh / 2;

        if (x >= bx && x <= bx + barWidth && y >= by1 && y <= by2) {
          // Cyan tone gradient (#06B6D4 to #38BDF8)
          const normY = (y - by1) / bh;
          r = Math.round(6 + (56 - 6) * normY);
          g = Math.round(182 + (189 - 182) * normY);
          b = Math.round(212 + (248 - 212) * normY);
          a = 255;
        }
      }

      // Horizontal central bridge line connecting the waveforms
      const lineY = centerY;
      if (x >= startX - size * 0.06 && x <= startX + totalWidth + size * 0.06) {
        if (Math.abs(y - lineY) <= size * 0.015) {
          r = 6; g = 182; b = 212; a = 230;
        }
      }

      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  const idat = createChunk('IDAT', compressed);
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const icon192 = generateIconBuffer(192);
const icon512 = generateIconBuffer(512);

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), icon192);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), icon512);

console.log(`Generated icon-192.png (${icon192.length} bytes)`);
console.log(`Generated icon-512.png (${icon512.length} bytes)`);
