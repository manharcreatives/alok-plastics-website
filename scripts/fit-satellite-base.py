"""
fit-satellite-base.py: calibrates the satellite base image in PanIndiaMap.tsx.

The photo has no georeference, so this script fits an affine transform (scale, skew, offset) that
maps the India outline and the Sri Lanka outline (from indiaMapData.ts, already projected into the
760x420 SVG space) onto the coastline of the photo. The result is a 2x3 matrix that places the photo
in the same SVG space as the vector layers, so every geographic layer shares one transform.

Usage: python scripts/fit-satellite-base.py   (needs numpy, scipy, pillow)
"""
import re, math, json, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
from scipy.optimize import minimize

ROOT = Path(__file__).resolve().parent.parent
TS = ROOT / "src" / "components" / "sections" / "indiaMapData.ts"
RASTER = ROOT / "public" / "images" / "backgrounds" / "india-map-realistic.webp"
LON0, LAT1, K = 40.0, 42.0, 10.0
CX = math.cos(math.radians(22))

src = TS.read_text(encoding="utf-8")

def grab(name):
    m = re.search(r"export const %s = (\"[^\"]*\");" % name, src)
    return json.loads(m.group(1))

def rings(d):
    out = []
    for body in re.findall(r"M([^MZ]*)Z", d):
        pts = []
        for seg in body.split("L"):
            seg = seg.strip()
            if seg:
                x, y = seg.split()
                pts.append((float(x), float(y)))
        out.append(pts)
    return out

def densify(ring, step=1.5):
    out = []
    n = len(ring)
    for i in range(n):
        a = np.array(ring[i]); b = np.array(ring[(i + 1) % n])
        k = max(1, int(np.linalg.norm(b - a) / step))
        for t in np.linspace(0, 1, k, endpoint=False):
            out.append(a + (b - a) * t)
    return np.array(out)

def to_lonlat(p):
    return LON0 + p[:, 0] / (CX * K), LAT1 - p[:, 1] / K

# control points: peninsula coast (lat < 21.5) and the Sri Lanka outline
india = np.vstack([densify(r) for r in rings(grab("INDIA_BASE_PATH")) if len(r)])
lo, la = to_lonlat(india)
peninsula = india[(la < 21.5) & (lo > 66)]

sl = []
for r in rings(grab("LAND_PATH")):
    if not r:
        continue
    d = densify(r)
    lo, la = to_lonlat(d)
    if 79.4 < lo.mean() < 82.5 and 5.5 < la.mean() < 10.2:
        sl.append(d)
sl = np.vstack(sl)

# raster coastline distance field
img = np.asarray(Image.open(RASTER).convert("RGB")).astype(np.int16)
R, B = img[..., 0], img[..., 2]
land = (R - B) > -20
coast = land & ndimage.binary_dilation(~land)
dist = ndimage.distance_transform_edt(~coast)
H, W = land.shape
CAP = 25.0

def sample(pts, px, py):
    ok = (px >= 0) & (px < W - 1) & (py >= 0) & (py < H - 1)
    d = np.full(len(pts), CAP)
    d[ok] = dist[np.round(py[ok]).astype(int), np.round(px[ok]).astype(int)]
    return np.minimum(d, CAP)

def unpack(p):
    # svg -> pixel: [px, py] = A @ [x, y] + t
    A = np.array([[p[0], p[1]], [p[2], p[3]]])
    t = np.array([p[4], p[5]])
    return A, t

def cost_for(pts, p):
    A, t = unpack(p)
    q = pts @ A.T + t
    return float(np.mean(sample(pts, q[:, 0], q[:, 1])))

PEN_WEIGHT = 2.0  # India's own borders matter more than the small Sri Lanka outline

def total(p):
    return PEN_WEIGHT * cost_for(peninsula, p) + cost_for(sl, p)

# start: the current axis-aligned placement (x 54.5, y 9.98, w 627, h 397.25)
sx0, sy0 = 627.0 / W, 397.25 / H
p0 = np.array([1 / sx0, 0.0, 0.0, 1 / sy0, -54.5 / sx0, -9.98 / sy0])
print("start peninsula", round(cost_for(peninsula, p0), 2), "SL", round(cost_for(sl, p0), 2))

best = minimize(total, p0, method="Nelder-Mead",
                options={"xatol": 1e-6, "fatol": 1e-6, "maxiter": 20000, "maxfev": 20000})
p = best.x
print("fit peninsula", round(cost_for(peninsula, p), 2), "SL", round(cost_for(sl, p), 2))

# invert: pixel -> svg. Svg point s = Ainv @ (q - t). The photo's top-left pixel is at svg (x0, y0).
A, t = unpack(p)
Ainv = np.linalg.inv(A)
origin = Ainv @ (np.array([0.0, 0.0]) - t)
ax, bx = Ainv[0]
cx_, dy = Ainv[1]
print("RESULT matrix a=%.6f b=%.6f c=%.6f d=%.6f e=%.4f f=%.4f" % (ax, cx_, bx, dy, origin[0], origin[1]))
print("RESULT_JSON", json.dumps({"a": ax, "b": cx_, "c": bx, "d": dy, "e": origin[0], "f": origin[1], "w": W, "h": H}))
