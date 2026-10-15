// Generate PNG icons (16/48/128) with zero deps: raw PNG via zlib + CRC32.
// Icon = abstract front page: ink field, paper masthead bar, vermilion photo
// block, thin story lines. Run: node tools/gen-icons.js

const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// CRC32
const table = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(size, px) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    raw[row] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = px(x, y);
      const o = row + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const INK = [0x18, 0x18, 0x1b, 0xff];
const PAPER = [0xf7, 0xf7, 0xf8, 0xff];
const ACCENT = [0x2f, 0x57, 0xd9, 0xff];

// u/v in 0..1 - minimal modern mark: ink field, vermilion diamond
function paint(u, v) {
  const du = Math.abs(u - 0.5);
  const dv = Math.abs(v - 0.5);
  if (du + dv < 0.30) {
    // hollow core of the diamond
    if (du + dv < 0.11) return PAPER;
    return ACCENT;
  }
  return INK;
}

const outDir = path.join(__dirname, '..', 'icons');
for (const size of [16, 48, 128]) {
  const png = encodePNG(size, (x, y) =>
    paint((x + 0.5) / size, (y + 0.5) / size));
  const file = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(file, png);
  console.log(`wrote ${file} (${png.length} bytes)`);
}
