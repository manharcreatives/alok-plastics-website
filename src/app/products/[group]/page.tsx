/** /products/[group]/ — group blueprint hero, part grid, other groups (§8.2). */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { ArrowDown } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import PageHero, { type HeroSpec } from '@/components/page/PageHero';
import EnquiryBand from '@/components/page/EnquiryBand';
import FoldEdge, { FOLD_SECTION_CSS } from '@/components/sections/FoldEdge';
import GroupRange from '@/components/products/GroupRange';
import { GroupBlueprintArt } from '@/components/products/art';
import { describe } from '@/lib/seo';
import { MACHINE_LABELS, MATERIAL_LABELS, getGroupBySlug, knownMachines, productGroups, productsByGroup } from '@/content/products';
import '@/components/products/products.css';

export const dynamicParams = false;

/** Hero copy + photo slot per group id. Kicker lines describe what the parts do (no claims); photo slugs match docs/images/manifest.hero-inner.json. */
const HERO: Record<string, { kicker: string; photo: string; position: string; cta: string }> = {
  '01': { kicker: 'The small parts behind every glass of cool water', photo: 'group-water-cooler', position: '68% center', cta: 'Get a quote' },
  '02': { kicker: 'Doors that slide, seal and stay shut', photo: 'group-deep-freezer-display-counter', position: '66% center', cta: 'Get a quote' },
  '03': { kicker: 'Spare parts for kitchens that run all day', photo: 'group-commercial-kitchen', position: '64% center', cta: 'Ask for a part' },
  '04': { kicker: 'Wheels under the equipment that keeps moving', photo: 'group-caster-wheel', position: '66% center', cta: 'Ask for a size' },
  '05': { kicker: 'Your sample or drawing, made into a part', photo: 'group-on-demand', position: '66% center', cta: 'Send us your part' },
};

const uniq = <T,>(a: T[]) => [...new Set(a)];

export function generateStaticParams() {
  return productGroups.map(g => ({ group: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ group: string }> }): Promise<Metadata> {
  const { group: slug } = await params;
  const g = getGroupBySlug(slug);
  if (!g) return {};
  return {
    title: g.name,
    description: describe(g.description, 'Request a quote from Alok Plastics.'),
    alternates: { canonical: `/products/${g.slug}/` },
  };
}

export default async function GroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group: slug } = await params;
  const g = getGroupBySlug(slug);
  if (!g) notFound();
  const items = productsByGroup(g.id);
  const custom = g.id === '05';
  const others = productGroups.filter(o => o.id !== g.id);
  const hero = HERO[g.id] ?? { kicker: 'Part group', photo: '', position: 'center', cta: 'Get a quote' };
  const materials = uniq(items.flatMap(p => (p.material ? [MATERIAL_LABELS[p.material]] : [])));
  const machines = uniq(items.flatMap(p => knownMachines(p).map(m => MACHINE_LABELS[m])));
  const specs: HeroSpec[] = items.length
    ? [
        { k: 'Parts listed', v: String(items.length) },
        ...(materials.length ? [{ k: 'Materials', v: materials.join(', ') }] : []),
        ...(machines.length ? [{ k: 'Used in', v: machines.join(', ') }] : []),
      ]
    : [{ k: 'Parts', v: 'Quoted on request' }, { k: 'How to ask', v: 'Send the part details' }];

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Products', href: '/products/' }, { label: g.name }]}
        label={hero.kicker}
        title={g.name}
        size="md"
        lead={`${g.tagline} ${g.description}`}
        specs={specs}
        art={<GroupBlueprintArt group={g} />}
        photo={hero.photo ? { src: `/images/heroes/${hero.photo}.webp`, position: hero.position } : undefined}
        enter="draw"
        layout="spec"
      >
        <Link href="/enquiry/" className="ph__btn">{hero.cta} <ArrowUpRight size={18} weight="light" aria-hidden="true" /></Link>
        <a href={items.length ? '#parts-h' : '#empty-h'} className="ph__btn ph__btn--ghost">{items.length ? 'See the parts' : 'How to ask'} <ArrowDown size={18} weight="light" aria-hidden="true" /></a>
      </PageHero>

      <GroupRange group={{ id: g.id, name: g.name }} items={items} />

      {others.length > 0 && (
        <section aria-labelledby="sib-h" className="p-section p-section--canvas fold-sec fold-sec--step">
          <style>{FOLD_SECTION_CSS}</style>
          <FoldEdge variant="step" />
          <div className="pw">
            <p className="p-eyebrow">Keep looking</p>
            <h2 id="sib-h" className="p-h2">Other part groups</h2>
            <ul className="pg-others">
              {others.map(o => (
                <li key={o.id}>
                  <Link href={`/products/${o.slug}/`}>
                    <span>
                      <strong>{o.name}</strong>
                      <small>{o.tagline}</small>
                    </span>
                    <ArrowUpRight size={32} weight="light" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <EnquiryBand variant="lock" fold="diag" heading={custom ? 'Have a part in mind?' : `Looking for ${g.name.toLowerCase()}?`} text="Share the part name, quantity and use, and we will reply with a quote." />
    </>
  );
}
