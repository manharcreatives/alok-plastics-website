# fix-B — Home sections layout (Agent B)

Iteration 1 (implement) -> tsc clean; check-spacing passes; check-forbidden/glass/hex failures are all in files outside Agent B scope (Hero.tsx 100vh, Drawer/glass-nav/forms backdrop-filter, #25D366 in enquiry/footer/FAB).

Changes
- ProofStrip: local count-up with format option; year (1998) renders without thousands separator; CSS grid 4-up desktop, 2x2 <1024; secondary row 3-up / stacked, value above label so long items wrap cleanly; register marks sit on column dividers (hidden on first column).
- ProductGroups: 12-col bento 7+5 / 5+7, stretch to equal row heights; each card = header + drawing-grid pictogram panel (scaled anchor-part pictograms, stroke compensated) + material tags (only where material is defined) + part list (4, or all when expanded) + footer. Expand-in-place, View parts, Enquire, View group, Get a quote preserved. All arrows carry U+FE0E. Parts without a drawn pictogram get a neutral diamond marker. Two-path block stacks on <1024.
- RequirementToRepeat: 5 equal columns spanning full grid at >=1024 with rising diagonal (spacing-token steps), chain-link connector in the gap, dashed loop bracket; 2-col 640-1023; single stack on mobile; pull quote in 1fr/3fr grid with balanced text.
- IndustriesBento: 12-col grid: core tile 4x2, 3 rows... row1 four 2-span tiles, row2 two 2-span + one 4-span; 2-col at 640-1023 (core + last span 2); 1-col mobile. Client-sourced application line now always visible (no hover-only content). 

Remaining: none known in scope; visual check at 375/768/1440 not run (no build allowed).
