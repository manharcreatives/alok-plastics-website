# Fix E - Logo trace

Source: public/brand/source/alok-logo-original.png (3000x3000 RGBA), cropped to 2620x957 (artwork + 60px padding).
Method: alpha-silhouette connected components; A and K split into base + fold-face regions (fold edge detected from luminance gradient); sub-pixel contours (skimage) fitted with Schneider cubic Beziers (tol 0.9px); gradients fitted by angle search + binned median colours (RMSE 0.8-1.6 for ribbons, ~4-5 for LO / PLASTICS).

Fidelity (colour SVG rendered in Chromium at 2620x957 on white vs original on white), iteration 1 (target met, no further iterations needed):
- pixels differing >24: 1.617%  agreement 98.383%
- SSIM 0.9765
- within-artwork diff >24: 4.933%

Residual diff is a thin ring along edges: the original has a faint soft drop-shadow / bevel that is not vectorised.
Side-by-side: docs/loop-log/logo-fidelity.png (original left, SVG right). Variants: docs/loop-log/logo-variants.png.

Sizes: color 15.0KB, white 11.0KB, bright 15.0KB, mark 8.8KB.
Caveats: Logo.tsx gradient stops are color-mix() of brand tokens (no hex in TSX) so they are a close approximation of the SVG asset's fitted hex stops; Logo uses useId for gradient ids (separate React roots could collide only if identifierPrefix is not unique).
