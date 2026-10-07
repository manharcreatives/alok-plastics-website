/**
 * BlogsSection: home teaser for /blogs/. One large guide + two compact ones, then a link to all.
 * Full-bleed on --surface-alt (the page places its own fold edge). Covers are the drawn
 * placeholder with the photograph fading in over it. Entrance via Reveal (rise); content is fully
 * visible without JS and under reduced motion.
 */
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import Reveal from '@/components/ui/Reveal';
import BlogCover from '@/components/blogs/BlogCover';
import BlogMeta from '@/components/blogs/BlogMeta';
import { blogPath, getBlog, type BlogPost } from '@/content/blogs';
import '@/components/blogs/blogs.css';

/** Highest-intent guides first: the large card, then the two beside it. */
const HIGHLIGHT = [
  'water-cooler-float-valve-overflow-leakage',
  'display-counter-sliding-door-parts-guide',
  'deep-freezer-door-gasket-hinge-replacement-guide',
];

const CSS = `
.bs { background: var(--surface-alt); padding: var(--section-y) var(--grid-page-padding); }
.bs__in { max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding)); margin: 0 auto; }
.bs__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: var(--space-md); margin-bottom: var(--space-lg); }
.bs__h { max-width: 22ch; }
.bs__lede { margin: var(--space-sm) 0 0; color: var(--body); line-height: 1.65; max-width: 50ch; }
.bs__all { display: inline-flex; align-items: center; gap: var(--space-xs); min-height: 48px; font-weight: 650; color: var(--burgundy); text-decoration: none; border-bottom: 1px solid var(--burgundy); }
.bs__all:hover { color: var(--burgundy-bright); border-bottom-color: var(--burgundy-bright); }
.bs__all:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 3px; }
.bs__all svg { transition: transform 200ms var(--ease-expo-out); }
.bs__all:hover svg { transform: translate3d(2px, -2px, 0); }
.bs__grid { display: grid; gap: var(--space-md); grid-template-columns: minmax(0, 1fr); }
.bs__side { display: grid; gap: var(--space-md); grid-template-columns: minmax(0, 1fr); align-content: stretch; }
.bs__side > * { min-width: 0; }
.bs-card { position: relative; display: flex; flex-direction: column; height: 100%; background: var(--surface); border: 1px solid var(--grey-warm); border-radius: var(--radius-card); overflow: hidden; transition: border-color 220ms var(--ease-expo-out), box-shadow 220ms var(--ease-expo-out); }
.bs-card:hover { border-color: var(--grey-metal); box-shadow: 0 16px 40px color-mix(in srgb, var(--burgundy-night) 10%, transparent); }
.bs-card::before { content: ''; position: absolute; z-index: 3; top: 0; left: 0; width: 0; height: 2px; background: var(--burgundy); transition: width 700ms var(--ease-expo-out); }
.bs-card:hover::before, .bs-card:focus-within::before { width: 100%; }
.bs-card__b { display: flex; flex-direction: column; gap: var(--space-xs); padding: var(--space-md); flex: 1; }
.bs-card__t { font-family: var(--font-archivo); font-variation-settings: "wdth" 115; font-weight: 650; letter-spacing: -0.015em; line-height: 1.2; color: var(--ink); margin: 0; text-wrap: balance; font-size: 1.3125rem; }
.bs-card--lead .bs-card__t { font-size: var(--fs-h3); line-height: var(--lh-h3); }
.bs-card__t a { color: inherit; text-decoration: none; }
.bs-card__t a::after { content: ''; position: absolute; inset: 0; z-index: 2; }
.bs-card__t a:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.bs-card__x { margin: 0; color: var(--body); font-size: 0.9375rem; line-height: 1.6; }
.bs-card__go { margin-top: auto; padding-top: var(--space-xs); display: inline-flex; align-items: center; gap: var(--space-xs); font-weight: 650; font-size: 0.9375rem; color: var(--burgundy); }
.bs-card:hover .bs-card__go svg { transform: translate3d(2px, -2px, 0); }
.bs-card__go svg { transition: transform 200ms var(--ease-expo-out); }
/* compact cards sit as thumb + text on wider phones and up */
.bs-card--row .bl-cover { aspect-ratio: 16 / 9; }
.bs-card--row .bs-card__x { display: none; }
@media (min-width: 560px) {
  .bs__side { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .bs-card--row .bs-card__x { display: block; }
}
@media (min-width: 1024px) {
  .bs__grid { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); align-items: stretch; }
  .bs__side { grid-template-columns: minmax(0, 1fr); grid-template-rows: repeat(2, minmax(0, 1fr)); }
  .bs-card--row { flex-direction: row; }
  .bs-card--row .bl-cover { flex: 0 0 42%; aspect-ratio: auto; min-height: 100%; }
  .bs-card--row .bs-card__x { display: none; }
  .bs-card--row .bs-card__b { justify-content: center; }
}
@media (prefers-reduced-motion: reduce) { .bs-card, .bs-card::before, .bs__all svg, .bs-card__go svg { transition: none; } }
`;

function Card({ post, variant }: { post: BlogPost; variant: 'lead' | 'row' }) {
  return (
    <article className={`bs-card bs-card--${variant}`}>
      <BlogCover post={post} />
      <div className="bs-card__b">
        <BlogMeta post={post} />
        <h3 className="bs-card__t"><Link href={blogPath(post.slug)}>{post.title}</Link></h3>
        <p className="bs-card__x">{post.excerpt}</p>
        <span className="bs-card__go" aria-hidden="true">Read the guide <ArrowUpRight size={18} weight="light" /></span>
      </div>
    </article>
  );
}

export default function BlogsSection() {
  const [lead, ...others] = HIGHLIGHT.map(getBlog).filter((p): p is BlogPost => !!p);
  if (!lead) return null;
  return (
    <section aria-labelledby="blogs-h" className="bs">
      <style>{CSS}</style>
      <div className="bs__in">
        <Reveal className="bs__head">
          <div>
            <p className="bl-eyebrow">From the workshop</p>
            <h2 id="blogs-h" className="bl-h2 bs__h">Why do coolers leak, doors stick and freezers frost up?</h2>
            <p className="bs__lede">Short, practical guides from the people who mould the parts: what fails, how to tell, and how to order the right replacement.</p>
          </div>
          <Link href="/blogs/" className="bs__all">View all blogs <ArrowUpRight size={18} weight="light" aria-hidden="true" /></Link>
        </Reveal>
        <div className="bs__grid">
          <Reveal><Card post={lead} variant="lead" /></Reveal>
          <div className="bs__side">
            {others.map((p, i) => <Reveal key={p.slug} delay={120 * (i + 1)}><Card post={p} variant="row" /></Reveal>)}
          </div>
        </div>
      </div>
    </section>
  );
}
