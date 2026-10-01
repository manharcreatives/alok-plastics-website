#!/usr/bin/env node
/**
 * gen-world-dots.mjs — builds src/components/sections/worldDots.ts
 *
 * Source: Natural Earth 1:10m Admin 0 Countries, "India point-of-view" edition
 *   (ne_10m_admin_0_countries_ind.geojson, public domain). This edition draws
 *   India's boundary as depicted by the Government of India (full Jammu & Kashmir
 *   and Ladakh). Fetched once and cached in scripts/.cache/ (gitignored).
 *
 * Output (all in one SVG coordinate space, 5 units per degree, plate carree):
 *   - WORLD_DOTS : run-length rows of land dots, 1.5deg grid, India cells excluded
 *   - INDIA_DOTS : run-length rows of India dots, 2/3deg grid (3x finer)
 *   - INDIA_OUTLINE : simplified mainland outline path (Douglas-Peucker 0.035deg)
 *   - INDIA_ISLANDS : Andaman, Nicobar and other islands as small filled shapes
 * Rows are encoded as horizontal segments; the component draws them with a
 * zero-length round-cap dash pattern, so one segment = a whole row of dots.
 *
 * Usage: node scripts/gen-world-dots.mjs [path/to/geojson]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const URL_SRC =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries_ind.geojson';
const CACHE = join(ROOT, 'scripts', '.cache', 'ne_10m_admin_0_countries_ind.geojson');
const OUT = join(ROOT, 'src', 'components', 'sections', 'worldDots.ts');

/* Frame (degrees) and scale */
const LON0 = -50, LON1 = 165, LAT_TOP = 66, LAT_BOT = -48;
/* India is enlarged in front of the world layer (a 2-layer composition): scale S about C. */
const S = 2.2, CLON = 80, CLAT = 22;
const K = 5; // svg units per degree
const W = (LON1 - LON0) * K, H = (LAT_TOP - LAT_BOT) * K;
const STEP_WORLD = 1.1, STEP_INDIA = 2 / 3;

async function load() {
  const arg = process.argv[2];
  if (arg) return JSON.parse(readFileSync(arg, 'utf8'));
  if (!existsSync(CACHE)) {
    console.log('fetching', URL_SRC);
    const res = await fetch(URL_SRC);
    if (!res.ok) throw new Error('fetch failed ' + res.status);
    mkdirSync(dirname(CACHE), { recursive: true });
    writeFileSync(CACHE, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(readFileSync(CACHE, 'utf8'));
}

/* ── geometry helpers ─────────────────────────────────────────── */
const polysOf = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
function bboxOf(rings) {
  let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
  for (const [x, y] of rings[0]) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); }
  return [a, b, c, d];
}
function inRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const inPoly = (x, y, rings) => inRing(x, y, rings[0]) && !rings.slice(1).some((h) => inRing(x, y, h));

function dp(pts, tol) {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1e-9;
  let max = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * (pts[i][0] - ax) - dx * (pts[i][1] - ay)) / len;
    if (d > max) { max = d; idx = i; }
  }
  if (max <= tol) return [pts[0], pts[pts.length - 1]];
  return [...dp(pts.slice(0, idx + 1), tol).slice(0, -1), ...dp(pts.slice(idx), tol)];
}
const area = (r) => Math.abs(r.reduce((s, p, i) => { const q = r[(i + 1) % r.length]; return s + (p[0] * q[1] - q[0] * p[1]); }, 0) / 2);

const px = (lon) => (lon - LON0) * K;
const py = (lat) => (LAT_TOP - lat) * K;
const f = (n) => (Math.round(n * 10) / 10).toString();

/* ── main ─────────────────────────────────────────────────────── */
const geo = await load();
const india = geo.features.find((x) => x.properties.ADMIN === 'India');
if (!india) throw new Error('India not found');
const indiaPolys = polysOf(india.geometry).map((rings) => ({ rings, bb: bboxOf(rings) }));
const others = [];
for (const ft of geo.features) {
  if (ft.properties.ADMIN === 'India' || ft.properties.ADMIN === 'Antarctica') continue;
  for (const rings of polysOf(ft.geometry)) others.push({ rings, bb: bboxOf(rings) });
}
const hit = (list, x, y) => list.some(({ rings, bb }) => x >= bb[0] && x <= bb[2] && y >= bb[1] && y <= bb[3] && inPoly(x, y, rings));

function rows(step, test) {
  const out = [];
  const nx = Math.floor((LON1 - LON0) / step), ny = Math.floor((LAT_TOP - LAT_BOT) / step);
  for (let j = 0; j < ny; j++) {
    const lat = LAT_TOP - (j + 0.5) * step;
    let start = -1;
    for (let i = 0; i <= nx; i++) {
      const lon = LON0 + (i + 0.5) * step;
      const on = i < nx && test(lon, lat);
      if (on && start < 0) start = i;
      if (!on && start >= 0) {
        const x1 = px(LON0 + (start + 0.5) * step), x2 = px(LON0 + (i - 0.5) * step);
        out.push([x1, py(lat), x2]);
        start = -1;
      }
    }
  }
  return out;
}
const rowsToPath = (rs) =>
  rs.map(([x1, y, x2]) => `M${f(x1)} ${f(y)}H${f(x2 + 0.01)}`).join('');

const IND_BB = [67, 5, 99, 38];
const inIndia = (x, y) => x >= IND_BB[0] && x <= IND_BB[2] && y >= IND_BB[1] && y <= IND_BB[3] && hit(indiaPolys, x, y);

/* clear the world dots under the enlarged India (plus a small halo) so the silhouette stands in front */
const under = (lon, lat) => inIndia(CLON + (lon - CLON) / S, CLAT + (lat - CLAT) / S);
const HALO = 1.6;
const nearIndia = (lon, lat) => under(lon, lat) || under(lon + HALO, lat) || under(lon - HALO, lat) || under(lon, lat + HALO) || under(lon, lat - HALO);
const worldRows = rows(STEP_WORLD, (x, y) => !nearIndia(x, y) && hit(others, x, y));
const indiaRows = rows(STEP_INDIA, (x, y) => inIndia(x, y));

/* outline: the mainland only (heavy stroke); islands are drawn separately as small filled shapes
   so the Andaman and Nicobar chains read as islands, not as stray marks */
const ringPath = (r) => 'M' + r.map(([lo, la]) => `${f(px(lo))} ${f(py(la))}`).join('L') + 'Z';
const simplify = (ring, tol) => {
  const mid = Math.floor(ring.length / 2);
  return [...dp(ring.slice(0, mid + 1), tol).slice(0, -1), ...dp(ring.slice(mid), tol)];
};
const sorted = indiaPolys.map(({ rings }) => rings[0]).sort((a, b) => area(b) - area(a));
const mainland = simplify(sorted[0], 0.035);
const outline = ringPath(mainland);
const islands = sorted.slice(1).filter((r) => area(r) >= 0.005).map((r) => simplify(r, 0.012)).filter((r) => r.length >= 4).map(ringPath).join('');

const worldPath = rowsToPath(worldRows);
const indiaPath = rowsToPath(indiaRows);

const ts = `/* AUTO-GENERATED by scripts/gen-world-dots.mjs — do not edit.
 * Natural Earth 1:10m admin-0 (India point-of-view edition), public domain.
 * India boundary = Government of India depiction. See docs/credits.md. */

export const WORLD_W = ${W};
export const WORLD_H = ${H};
export const WORLD_K = ${K}; // svg units per degree (plate carree)
export const WORLD_LON0 = ${LON0};
export const WORLD_LAT_TOP = ${LAT_TOP};
export const INDIA_SCALE = ${S};
export const INDIA_CLON = ${CLON};
export const INDIA_CLAT = ${CLAT};
export const STEP_WORLD_U = ${f(STEP_WORLD * K)};
export const STEP_INDIA_U = ${(STEP_INDIA * K).toFixed(3)};

export const WORLD_DOTS = '${worldPath}';
export const INDIA_DOTS = '${indiaPath}';
export const INDIA_OUTLINE = '${outline}';
export const INDIA_ISLANDS = '${islands}';

/** lon/lat -> svg user units */
export const project = (lon: number, lat: number) => ({
  x: (lon - WORLD_LON0) * WORLD_K,
  y: (WORLD_LAT_TOP - lat) * WORLD_K,
});
`;
writeFileSync(OUT, ts);
console.log('wrote', OUT, (ts.length / 1024).toFixed(1) + ' KB', 'world rows', worldRows.length, 'india rows', indiaRows.length, 'islands', islands.split('M').length - 1);
