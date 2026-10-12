// Generates PWA icons with no third-party deps: rasterises the EnsoKit brush ring
// (same geometry as the in-app logo) over a glass-ink background, then PNG-encodes it.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { ensoPoints } = require('../../ensokit/src/brush.js');

/* ── PNG encoding ── */
const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return buf => {
    let c = -1;
    for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
})();

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ── geometry ── */
// Same seed and options as tools/make-brush.mjs so icon and in-app mark match.
const RING = ensoPoints('praxis-mark', { R: 33, w: 12, gap: 0.62, rot: -0.55, wob: 2.1 });

function inside(poly, x, y) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

const mix = (a, b, t) => a + (b - a) * t;
const clamp = v => Math.max(0, Math.min(255, Math.round(v)));

function draw(size, scale) {
  const buf = Buffer.alloc(size * size * 4);
  const SS = 3;                         // supersampling per axis
  const unit = size / 100;              // brush grid → pixels
  const pad = (1 - scale) * 50;         // shrink toward the centre for maskable padding
  const poly = RING.map(([x, y]) => [(x * scale + pad) * unit, (y * scale + pad) * unit]);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Ink background with an rose bloom behind the ring — the glass look of the app.
      const g = y / size;
      const dx = (x - size / 2) / size, dy = (y - size / 2) / size;
      const bloom = Math.max(0, 1 - Math.hypot(dx, dy) * 2.35) ** 2.2;
      let r = mix(16, 8, g) + bloom * 46;
      let gg = mix(14, 9, g) + bloom * 12;
      let b = mix(27, 16, g) + bloom * 24;

      let cov = 0;
      for (let sy = 0; sy < SS; sy++)
        for (let sx = 0; sx < SS; sx++)
          if (inside(poly, x + (sx + 0.5) / SS, y + (sy + 0.5) / SS)) cov += 1 / (SS * SS);

      if (cov > 0) {
        // rose ink, lighter at the top-left shoulder for a lit-glass feel
        const lit = 1 - Math.min(1, Math.hypot(dx + 0.12, dy + 0.14) * 1.9);
        r = mix(r, 238 + lit * 14, cov);
        gg = mix(gg, 96 + lit * 34, cov);
        b = mix(b, 124 + lit * 30, cov);
      }

      const i = (y * size + x) * 4;
      buf[i] = clamp(r); buf[i + 1] = clamp(gg); buf[i + 2] = clamp(b); buf[i + 3] = 255;
    }
  }
  return png(size, buf);
}

mkdirSync(new URL('../icons/', import.meta.url), { recursive: true });
const out = p => new URL('../icons/' + p, import.meta.url);
writeFileSync(out('icon-192.png'), draw(192, 1.0));
writeFileSync(out('icon-512.png'), draw(512, 1.0));
writeFileSync(out('maskable-512.png'), draw(512, 0.74)); // safe-zone padding for maskable
console.log('icons written');
