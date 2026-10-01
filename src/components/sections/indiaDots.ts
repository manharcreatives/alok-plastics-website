/**
 * Dot-matrix schematic of India, rasterised at module load from a coarse
 * lon/lat outline. Deliberately schematic (not a survey boundary).
 * Output coordinates are in the 480×520 viewBox used by PanIndiaMap.
 */

const OUTLINE: [number, number][] = [
  [74.0, 36.8], [77.8, 35.5], [78.9, 34.3], [78.7, 32.5], [79.5, 31.0], [80.2, 30.2],
  [81.0, 30.0], [80.1, 28.8], [81.9, 27.8], [83.5, 27.4], [84.7, 27.0], [86.0, 26.6],
  [88.1, 26.5], [88.0, 27.2], [88.9, 27.3], [88.8, 28.0], [89.5, 26.8], [91.5, 26.8],
  [92.0, 27.8], [93.5, 28.6], [95.5, 29.2], [96.1, 28.3], [97.3, 28.2], [97.0, 27.2],
  [96.0, 26.6], [95.2, 26.0], [94.6, 24.5], [94.1, 23.8], [93.3, 23.0], [93.0, 22.5],
  [92.3, 23.3], [91.9, 24.2], [91.2, 25.2], [90.0, 25.2], [89.8, 26.0], [89.0, 25.3],
  [88.2, 24.6], [88.7, 23.2], [89.0, 22.0], [88.0, 21.6], [87.0, 21.0], [86.5, 20.0],
  [85.0, 19.3], [84.0, 18.3], [82.3, 16.7], [81.2, 16.3], [80.3, 15.5], [80.1, 13.5],
  [79.9, 11.8], [79.8, 10.3], [78.9, 9.3], [78.2, 8.9], [77.5, 8.1], [76.5, 9.0],
  [75.8, 11.5], [74.8, 13.0], [74.0, 15.0], [73.4, 16.8], [72.8, 19.0], [72.8, 20.5],
  [72.6, 21.2], [72.2, 21.0], [71.0, 20.8], [70.0, 21.0], [69.0, 22.3], [69.6, 22.8],
  [70.5, 22.9], [70.0, 23.5], [68.5, 23.4], [68.3, 23.8], [69.8, 24.4], [71.0, 25.8],
  [70.0, 26.8], [70.3, 28.0], [71.8, 27.8], [72.8, 29.0], [74.0, 29.8], [74.5, 31.0],
  [74.5, 32.0], [75.3, 32.8], [74.2, 34.0],
];

const LON0 = 68;
const LAT0 = 37.5;
const K = 15;      // px per degree
const PAD = 20;
const STEP = 0.55; // degrees between dots

export const MAP_W = 480;
export const MAP_H = 520;

export function project(lon: number, lat: number) {
  return { x: PAD + (lon - LON0) * K, y: PAD + (LAT0 - lat) * K };
}

function inside(lon: number, lat: number) {
  let c = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [xi, yi] = OUTLINE[i];
    const [xj, yj] = OUTLINE[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

export const INDIA_DOTS_PATH: string = (() => {
  const parts: string[] = [];
  let row = 0;
  for (let lat = 37; lat >= 7.5; lat -= STEP, row++) {
    const off = row % 2 ? STEP / 2 : 0; // hex-offset rows
    for (let lon = 68 + off; lon <= 97.5; lon += STEP) {
      if (inside(lon, lat)) {
        const p = project(lon, lat);
        parts.push(`M${p.x.toFixed(1)} ${p.y.toFixed(1)}h0`);
      }
    }
  }
  return parts.join('');
})();
