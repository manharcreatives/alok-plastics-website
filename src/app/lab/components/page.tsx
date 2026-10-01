// Lab — /lab/components
// UI primitive showcase: all variants and states for §15.1 primitives.

import Button from '@/components/ui/Button';
import TextLink from '@/components/ui/TextLink';
import MicroLabel from '@/components/ui/MicroLabel';
import SectionHeader from '@/components/ui/SectionHeader';
import Tag from '@/components/ui/Tag';
import Card from '@/components/ui/Card';
import Callout from '@/components/ui/Callout';
import Divider from '@/components/ui/Divider';
import SpecTable from '@/components/ui/SpecTable';
import type { SpecTableRow } from '@/components/ui/SpecTable';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 'var(--space-xl)' }}>
    <h2 style={{
      fontFamily: 'var(--font-mono, monospace)',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.16em',
      color: 'var(--muted)',
      marginBottom: 'var(--space-md)',
      paddingBottom: 12,
      borderBottom: '1px solid var(--grey-cloud)',
    }}>
      {title}
    </h2>
    {children}
  </section>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 'var(--space-md)' }}>
    <p style={{
      fontSize: '0.75rem',
      color: 'var(--muted)',
      marginBottom: 10,
      fontFamily: 'var(--font-mono)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    }}>
      {label}
    </p>
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
      {children}
    </div>
  </div>
);

const specRows: SpecTableRow[] = [
  { label: 'Diameter', values: ['12mm', '16mm', '20mm'] },
  { label: 'Height', values: ['24mm', '28mm', null] },
  { label: 'Material', values: ['Nylon', 'HDPE', 'PPCP'] },
  { label: 'Weight', values: ['8g', '11g', '14g'] },
];

export const metadata = { title: 'UI Components Lab' };

export default function ComponentsLabPage() {
  return (
    <div style={{
      padding: 'var(--space-xl) var(--grid-page-padding)',
      maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))',
      margin: '0 auto',
    }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <MicroLabel number="lab" showRule>UI Components</MicroLabel>
        <h1 style={{
          fontFamily: 'var(--font-archivo)',
          fontVariationSettings: '"wdth" 125',
          fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
          lineHeight: 1.1,
          color: 'var(--ink)',
          marginTop: 16,
          marginBottom: 8,
        }}>
          Primitive library
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9375rem' }}>
          §15.1 — all variants · hover to test light sweep · tab to verify focus rings
        </p>
      </div>

      {/* ── Buttons ──────────────────────────────────────────── */}
      <Section title="Button">
        <Row label="Variant">
          <Button variant="primary">Enquire Now</Button>
          <Button variant="secondary">Browse Products</Button>
          <Button variant="ghost">Learn more</Button>
          <Button variant="whatsapp">WhatsApp Us</Button>
          <div style={{ background: 'var(--burgundy)', padding: '12px 16px', borderRadius: 2, display: 'flex', gap: 12 }}>
            <Button variant="on-burgundy">Get a Quote</Button>
          </div>
        </Row>
        <Row label="Size (primary)">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </Row>
        <Row label="States">
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="secondary" disabled>Disabled</Button>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="secondary" loading>Loading</Button>
        </Row>
        <Row label="Size (secondary)">
          <Button variant="secondary" size="sm">Small</Button>
          <Button variant="secondary" size="md">Medium</Button>
          <Button variant="secondary" size="lg">Large</Button>
        </Row>
      </Section>

      {/* ── TextLink ─────────────────────────────────────────── */}
      <Section title="TextLink">
        <Row label="Default">
          <TextLink href="#">View full catalogue</TextLink>
          <TextLink href="#" showArrow={false}>Read more</TextLink>
        </Row>
      </Section>

      {/* ── MicroLabel ───────────────────────────────────────── */}
      <Section title="MicroLabel">
        <Row label="With rule">
          <MicroLabel>Our Products</MicroLabel>
        </Row>
        <Row label="With number">
          <MicroLabel number={1}>Sliding &amp; Door</MicroLabel>
          <MicroLabel number={2}>Water Control</MicroLabel>
          <MicroLabel number="03">Ventilation</MicroLabel>
        </Row>
        <Row label="No rule">
          <MicroLabel showRule={false}>Since 1998</MicroLabel>
        </Row>
      </Section>

      {/* ── SectionHeader ────────────────────────────────────── */}
      <Section title="SectionHeader">
        <SectionHeader
          label="Our Products"
          labelNumber="02"
          heading="Parts for water coolers, display counters and deep freezers."
          lead="Float valves, F-bushes, connecting bushes, ventilation jalli and more — in nylon, HDPE, PPCP and brass."
          link={{ href: '/products', label: 'All products' }}
        />
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <SectionHeader
            label="About Us"
            heading="Manufacturing precision since 1998."
            align="center"
          />
        </div>
      </Section>

      {/* ── Tags ─────────────────────────────────────────────── */}
      <Section title="Tag">
        <Row label="Default">
          <Tag>Water Cooler</Tag>
          <Tag>Display Counter</Tag>
          <Tag>Deep Freezer</Tag>
        </Row>
        <Row label="Material">
          <Tag material="nylon" />
          <Tag material="hdpe" />
          <Tag material="ppcp" />
          <Tag material="brass" />
          <Tag material="ss" />
        </Row>
        <Row label="Muted">
          <Tag variant="muted">OEM Supplier</Tag>
          <Tag variant="muted">Pan-Bharat Dispatch</Tag>
        </Row>
      </Section>

      {/* ── Cards ────────────────────────────────────────────── */}
      <Section title="Card">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--space-md)',
        }}>
          <Card variant="plain">
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
              Plain Card
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--body)', lineHeight: 1.6 }}>
              Surface background · 1px grey-warm border · lit top edge · hover lifts.
            </p>
            <div style={{ marginTop: 'var(--space-sm)', display: 'flex', gap: 8 }}>
              <Tag material="nylon" />
              <Tag material="brass" />
            </div>
          </Card>

          <Card variant="drawing">
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
              Drawing Card
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--body)', lineHeight: 1.6 }}>
              Adds crop marks at each corner — drawing-sheet engineering aesthetic.
            </p>
          </Card>

          <Card variant="feature">
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', marginBottom: 8 }}>
              Feature Card
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--rose-pale)', lineHeight: 1.6 }}>
              Burgundy background · white text · used for CTAs and anchor group cards.
            </p>
            <div style={{ marginTop: 'var(--space-sm)' }}>
              <Button variant="on-burgundy" size="sm">Enquire ↗</Button>
            </div>
          </Card>

          <Card variant="tint">
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
              Tint Card
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--body)', lineHeight: 1.6 }}>
              Blush background · burgundy-tinted top edge · for callout blocks and highlights.
            </p>
          </Card>
        </div>
      </Section>

      {/* ── Callout ──────────────────────────────────────────── */}
      <Section title="Callout">
        <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <Callout heading="Note">
            All prices are on request. Minimum order quantities apply — contact us for your requirement.
          </Callout>
          <Callout>
            Products are available in nylon, HDPE, PPCP and brass. Request a sample for material approval.
          </Callout>
        </div>
      </Section>

      {/* ── Divider ──────────────────────────────────────────── */}
      <Section title="Divider">
        <p style={{ fontSize: '0.875rem', color: 'var(--body)', marginBottom: 'var(--space-sm)' }}>
          Default horizontal rule
        </p>
        <Divider />

        <p style={{ fontSize: '0.875rem', color: 'var(--body)', marginBottom: 'var(--space-sm)' }}>
          Diagonal / folded-sheet variant (2px, rotated)
        </p>
        <Divider variant="diagonal" />

        <p style={{ fontSize: '0.875rem', color: 'var(--body)', marginBottom: 'var(--space-sm)' }}>
          With label
        </p>
        <Divider label="Water Control Parts" />
      </Section>

      {/* ── SpecTable ────────────────────────────────────────── */}
      <Section title="SpecTable">
        <div style={{ maxWidth: 600 }}>
          <SpecTable
            caption="F-Bush — Dimensions &amp; Variants"
            columns={['Size A', 'Size B', 'Size C']}
            rows={specRows}
          />
        </div>
      </Section>
    </div>
  );
}
