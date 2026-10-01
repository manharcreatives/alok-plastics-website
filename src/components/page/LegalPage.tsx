/**
 * LegalPage — layout + headings only. No legal text is written here (master prompt §8.2);
 * the body is a pending notice until the client supplies approved wording.
 */
import Link from 'next/link';
import PageHero from './PageHero';
import EnquiryBand from './EnquiryBand';

interface Props {
  slug: string;            // 'privacy' | 'terms' | 'refund'
  title: string;
  label: string;
  sections: string[];      // heading structure only
}

export default function LegalPage({ title, label, sections }: Props) {
  return (
    <>
      <PageHero crumbs={[{ label: title }]} label={label} title={title} />
      <div style={{ background: 'var(--canvas)', padding: 'var(--space-xl) var(--grid-page-padding)' }}>
        <div style={{ maxWidth: '72ch', margin: '0 auto' }}>
          <div role="note" style={{ background: 'var(--surface-alt)', border: '1px solid var(--grey-cloud)', borderLeft: '2px solid var(--burgundy)', borderRadius: 'var(--radius-card)', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
            <p style={{ color: 'var(--ink)', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
              This policy is being finalised and will be published here.
            </p>
            <p style={{ color: 'var(--body)', lineHeight: 1.65 }}>
              For any question in the meantime, please <Link href="/contact/" style={{ color: 'var(--burgundy)', fontWeight: 600 }}>contact us</Link>.
            </p>
          </div>
          {sections.map((s, i) => (
            <section key={s} aria-labelledby={`legal-h-${i}`} style={{ marginBottom: 'var(--space-md)', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--grey-cloud)' }}>
              <h2 id={`legal-h-${i}`} style={{ fontFamily: 'var(--font-archivo)', fontVariationSettings: '"wdth" 110', fontSize: '1.25rem', fontWeight: 650, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
                {s}
              </h2>
            </section>
          ))}
        </div>
      </div>
      <EnquiryBand heading="Questions about this page?" text="Get in touch and we will respond." />
    </>
  );
}
