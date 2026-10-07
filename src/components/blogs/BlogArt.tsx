/**
 * BlogArt: the drawn placeholder for a blog cover. Plain line drawing on the burgundy field,
 * one scene per post. currentColor only (the parent sets the tint). A real photograph is
 * layered over this by PhotoBg and the drawing stays underneath.
 */
import type { BlogArt as BlogArtId } from '@/content/blogs';

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'square', strokeLinejoin: 'miter' } as const;

function Scene({ art }: { art: BlogArtId }) {
  switch (art) {
    case 'float-valve':
      return (
        <g {...S}>
          {/* tank, water line, inlet pipe */}
          <path d="M 120 40 L 120 150 L 300 150 L 300 40" />
          <path d="M 120 92 L 300 92" strokeDasharray="6 5" />
          <path d="M 96 56 L 190 56 L 190 70" />
          <path d="M 96 48 L 190 48 L 190 44" />
          {/* valve body, rod, float ball */}
          <path d="M 184 70 L 196 70 L 196 82 L 184 82 Z" />
          <path d="M 190 82 L 190 100 L 250 112" />
          <circle cx="262" cy="114" r="14" />
          <path d="M 248 114 L 276 114" strokeDasharray="3 4" />
          {/* ripples */}
          <path d="M 140 118 Q 150 112 160 118 T 180 118" />
          <path d="M 200 134 Q 210 128 220 134 T 240 134" />
        </g>
      );
    case 'display-counter':
      return (
        <g {...S}>
          <path d="M 70 70 L 330 70 L 330 150 L 70 150 Z" />
          <path d="M 70 86 L 330 86" />
          {/* two sliding door panels on a rail */}
          <path d="M 86 96 L 196 96 L 196 138 L 86 138 Z" />
          <path d="M 204 96 L 314 96 L 314 138 L 204 138 Z" />
          <path d="M 80 142 L 320 142" strokeDasharray="4 4" />
          {/* bush markers */}
          <circle cx="98" cy="142" r="4" />
          <circle cx="184" cy="142" r="4" />
          <circle cx="216" cy="142" r="4" />
          <circle cx="302" cy="142" r="4" />
          {/* travel arrow */}
          <path d="M 120 118 L 170 118 M 160 110 L 170 118 L 160 126" />
          {/* lock */}
          <path d="M 196 112 L 204 112 L 204 124 L 196 124 Z" />
        </g>
      );
    case 'materials':
      return (
        <g {...S}>
          {/* pipe section */}
          <circle cx="110" cy="76" r="26" />
          <circle cx="110" cy="76" r="16" />
          {/* flanged bush */}
          <path d="M 190 56 L 230 56 L 230 96 L 190 96 Z" />
          <path d="M 180 64 L 190 64 L 190 88 L 180 88 Z" />
          <circle cx="210" cy="76" r="8" />
          {/* tap */}
          <path d="M 270 60 L 316 60 L 316 70 L 292 70 L 292 100 L 280 100 L 280 70 L 270 70 Z" />
          {/* leg insert: square in square */}
          <path d="M 96 122 L 140 122 L 140 160 L 96 160 Z" />
          <path d="M 106 132 L 130 132 L 130 150 L 106 150 Z" />
          {/* hex nut */}
          <path d="M 214 122 L 238 122 L 250 141 L 238 160 L 214 160 L 202 141 Z" />
          <circle cx="226" cy="141" r="8" />
          {/* ticks */}
          <path d="M 270 160 L 330 160 M 270 154 L 270 166 M 330 154 L 330 166" />
        </g>
      );
    case 'deep-freezer':
      return (
        <g {...S}>
          {/* chest body and lid with hinge */}
          <path d="M 80 100 L 320 100 L 320 156 L 80 156 Z" />
          <path d="M 80 100 L 100 72 L 340 72 L 320 100" />
          <path d="M 92 106 L 308 106" strokeDasharray="5 4" />
          {/* hinge */}
          <path d="M 128 100 L 128 90 L 148 90 L 148 100" />
          <circle cx="138" cy="95" r="2.5" />
          {/* gasket detail callout */}
          <circle cx="280" cy="104" r="20" />
          <path d="M 266 104 Q 274 96 282 104 T 296 104" />
          {/* frost ticks */}
          <path d="M 200 128 L 200 140 M 194 134 L 206 134 M 240 128 L 240 140 M 234 134 L 246 134" />
        </g>
      );
    case 'custom':
    default:
      return (
        <g {...S}>
          {/* sample part */}
          <path d="M 70 70 L 120 70 L 120 90 L 100 90 L 100 130 L 70 130 Z" />
          <circle cx="84" cy="104" r="5" />
          {/* arrow */}
          <path d="M 136 100 L 176 100 M 166 92 L 176 100 L 166 108" />
          {/* two mould halves with cavity */}
          <path d="M 194 60 L 270 60 L 270 98 L 252 98 L 252 108 L 270 108 L 270 146 L 194 146 Z" />
          <path d="M 282 60 L 330 60 L 330 146 L 282 146 L 282 108 L 300 108 L 300 98 L 282 98 Z" />
          {/* dimension line */}
          <path d="M 70 150 L 120 150 M 70 144 L 70 156 M 120 144 L 120 156" />
          {/* parting line */}
          <path d="M 276 50 L 276 156" strokeDasharray="4 4" />
        </g>
      );
  }
}

export default function BlogArt({ art }: { art: BlogArtId }) {
  return (
    <svg viewBox="0 0 400 200" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">
      <Scene art={art} />
    </svg>
  );
}
