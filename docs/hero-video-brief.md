# Alok Plastics — Hero Video Brief

**For the client / video production team / AI-footage commission.**

---

## Goal

A looping background video for the website hero section. This is a **supporting actor** — low contrast, never fighting the headline. The visitor reads the headline; the video creates atmosphere and authenticity.

## Visual Direction

**Bright, warm, high-key, slow.**

Think: morning light through a clean moulding hall. Not a moody dark factory with lens flares.

The feeling should be: **precision, craft, light on material**. The same feeling as the logo — two burgundy ribbons catching light around a grey-metal core.

## Suggested Shots (in order of preference)

1. **Granules pouring** — plastic granules (HDPE, PPCP, nylon) cascading in bright top light; close-up macro, very slow pan
2. **Mould opening** — the slow separation of a mould tool, a freshly formed part being lifted out, catching a specular highlight
3. **Part inspection** — hands checking a float valve or F-bush against light; focus pull from hands to the part
4. **Parts in a crate** — a tray of neatly laid-out finished parts (leg inserts, jalli grids, push cocks) under strong overhead light; slight tilt or pullback
5. **The moulding hall** — a wide shot of a clean production area, soft focus, machines operating rhythmically, Chandigarh morning light from above

## Rules

| What to do | What NOT to do |
|---|---|
| Bright, clean, well-lit | Dark, moody, dramatic shadows |
| Real Indian moulding unit aesthetic | Fake-looking AI environments |
| Focus on material, parts, light | Factory drama, sparks, smoke |
| **The lower-left third must stay calm** — that is where the headline sits | Action or contrast in the lower-left |
| Warm, white, morning light | Cool blue-toned light |
| No audio needed | No audio (autoplay is muted) |

## Technical Specs

- **Duration:** 8–12 seconds of source footage
- **Resolution:** 1080p (1920×1080)
- **Frame rate:** 24 or 30fps
- **Audio:** None required
- **Encoding:** See `scripts/encode-hero.sh` — the site will process this into a seamless boomerang loop

## Encoding Pipeline (once footage is received)

```bash
# Place raw footage at: scripts/raw-hero.mp4
# Then run:
bash scripts/encode-hero.sh

# Output:
# public/media/hero.mp4    ≤ 2.5 MB, seamless loop
# public/media/hero.webm   ≤ 1.5 MB, seamless loop
# public/media/hero-poster.jpg  (first keyframe, used as LCP element)
```

## Activating the Video

Once `public/media/hero.mp4` and `public/media/hero.webm` exist, update `src/content/site.ts`:

```ts
hero: {
  media: {
    mode: 'auto',                          // ← change from 'poster' or 'ambient'
    video: {
      webm: '/media/hero.webm',           // ← fill these in
      mp4: '/media/hero.mp4',
      mobileMp4: null,
    },
    poster: '/media/hero-poster.jpg',
    tone: 'light',                         // 'light' or 'dark' — set based on footage
  },
  ...
}
```

The site will then auto-detect device capability and serve the video on qualifying devices (≥768px, fine pointer, no reduced motion, no Save-Data), and fall back to the poster on mobile and tablets.

## AI-Generated Footage Note

If AI-generated footage is used, it must:
- Look like a real Indian moulding unit with real equipment
- Contain no fake signage or fake brand names
- Not feature any people whose identities aren't cleared for use
- Match the visual direction above

The client must review and approve all footage before it goes live.
