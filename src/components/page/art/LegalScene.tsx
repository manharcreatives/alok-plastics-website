/**
 * LegalScene: a dark, isometric 3D illustration for the legal pages. Each policy gets its own
 * stack of solid blocks with one symbol on top: privacy = a lock, terms = stacked sheets,
 * refunds = a returning loop. Pure SVG, no photographs, no text in the art.
 */
import type { ReactElement } from 'react';
import type { LegalSlug } from '@/content/legal';

const COS = 0.866;
const SIN = 0.5;
const K = 1.05;
const CX = 240;
const CY = 215;

/* isometric projection: plan (x, y) and height z to screen */
const P = (x: number, y: number, z: number): [number, number] => [CX + (x - y) * COS * K, CY + (x + y) * SIN * K - z * K];
const pts = (a: [number, number][]) => a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

type BlockProps = { x: number; y: number; z: number; w: number; d: number; h: number };

function Block({ x, y, z, w, d, h }: BlockProps) {
  const top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
  const left = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)];
  const right = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)];
  return (
    <g>
      <polygon points={pts(left)} fill="var(--burgundy)" fillOpacity="0.85" stroke="var(--rose-pale)" strokeOpacity="0.22" strokeWidth="1" strokeLinejoin="round" />
      <polygon points={pts(right)} fill="var(--burgundy-deep)" fillOpacity="0.95" stroke="var(--rose-pale)" strokeOpacity="0.22" strokeWidth="1" strokeLinejoin="round" />
      <polygon points={pts(top)} fill="var(--rose-pale)" fillOpacity="0.28" stroke="var(--rose-pale)" strokeOpacity="0.55" strokeWidth="1.2" strokeLinejoin="round" />
    </g>
  );
}

function Floor() {
  const lines: ReactElement[] = [];
  for (let i = -6; i <= 6; i++) {
    const a = P(i * 40, -240, 0);
    const b = P(i * 40, 240, 0);
    const c = P(-240, i * 40, 0);
    const d = P(240, i * 40, 0);
    lines.push(<line key={`a${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />);
    lines.push(<line key={`b${i}`} x1={c[0]} y1={c[1]} x2={d[0]} y2={d[1]} />);
  }
  return <g stroke="var(--rose-pale)" strokeOpacity="0.08" strokeWidth="1">{lines}</g>;
}

function Lock({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 9} ${y - 2} V${y - 12} A9 9 0 0 1 ${x + 9} ${y - 12} V${y - 2}`} fill="none" stroke="var(--surface)" strokeWidth="3" strokeLinecap="round" />
      <rect x={x - 15} y={y - 2} width="30" height="24" rx="4" fill="var(--surface)" />
      <circle cx={x} cy={y + 8} r="3" fill="var(--burgundy-deep)" />
      <rect x={x - 1.5} y={y + 8} width="3" height="7" fill="var(--burgundy-deep)" />
    </g>
  );
}

function Sheet({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 15} y={y - 22} width="30" height="38" rx="3" fill="var(--surface)" />
      {[-10, -3, 4, 11].map((o, i) => (
        <line key={i} x1={x - 9} y1={y + o} x2={x + (i === 3 ? 0 : 9)} y2={y + o} stroke="var(--burgundy)" strokeWidth="2" strokeLinecap="round" />
      ))}
    </g>
  );
}

function Loop({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 26} ${y + 4} A26 26 0 1 1 ${x + 14} ${y - 20}`} fill="none" stroke="var(--surface)" strokeWidth="3.5" strokeLinecap="round" />
      <polygon points={`${x + 14},${y - 30} ${x + 14},${y - 8} ${x + 36},${y - 19}`} fill="var(--surface)" />
    </g>
  );
}

export default function LegalScene({ slug }: { slug: LegalSlug }) {
  const top = P(0, 0, 0);
  let body: ReactElement;
  let icon: ReactElement;
  if (slug === 'privacy') {
    body = (
      <>
        <Block x={-80} y={-80} z={0} w={160} d={160} h={18} />
        <Block x={-56} y={-56} z={18} w={112} d={112} h={22} />
        <Block x={-30} y={-30} z={40} w={60} d={60} h={16} />
      </>
    );
    const t = P(0, 0, 56);
    icon = <Lock x={t[0]} y={t[1]} />;
  } else if (slug === 'terms') {
    body = (
      <>
        <Block x={-80} y={-64} z={0} w={160} d={128} h={6} />
        <Block x={-72} y={-56} z={6} w={144} d={112} h={6} />
        <Block x={-64} y={-48} z={12} w={128} d={96} h={6} />
        <Block x={-56} y={-40} z={18} w={112} d={80} h={6} />
        <Block x={-48} y={-32} z={24} w={96} d={64} h={14} />
      </>
    );
    const t = P(0, 0, 40);
    icon = <Sheet x={t[0]} y={t[1]} />;
  } else {
    body = (
      <>
        <Block x={-72} y={-72} z={0} w={144} d={144} h={12} />
        <Block x={-44} y={-44} z={12} w={88} d={88} h={44} />
      </>
    );
    const t = P(0, 0, 56);
    icon = <Loop x={t[0]} y={t[1]} />;
  }

  return (
    <svg className="lg-scene__svg" viewBox="0 0 480 400" role="img" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`lg-glow-${slug}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--rose)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--rose)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Floor />
      <ellipse cx={top[0]} cy={top[1] + 70} rx="190" ry="70" fill={`url(#lg-glow-${slug})`} />
      {body}
      {icon}
    </svg>
  );
}
