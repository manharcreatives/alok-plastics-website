/**
 * FaqSection — short, visible Q&A + FAQPage JSON-LD (§18).
 * Every answer is assembled from src/content (site.ts / products.ts) — nothing is invented.
 * Prices: answered as "on request" because site.showPrices is false.
 */
import JsonLd from '@/components/seo/JsonLd';
import { ENTITY_STATEMENT, faqJsonLd, type FaqItem } from '@/lib/seo';
import { MATERIAL_LABELS, productGroups, publishedProducts } from '@/content/products';
import '@/components/products/products.css';

function list(xs: string[]): string {
  return xs.length <= 1 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;
}

export function buildCatalogueFaq(): FaqItem[] {
  const groupNames = productGroups.map(g => g.name);
  const materials = Array.from(new Set(publishedProducts.flatMap(p => (p.material ? [MATERIAL_LABELS[p.material]] : []))));

  // COPY: drafted, needs client approval
  return [
    { q: 'What does Alok Plastics make?', a: ENTITY_STATEMENT },
    {
      q: 'How is the parts catalogue organised?',
      a: `By what the part does inside the machine: ${list(groupNames)}. Each group page lists its parts, and each part has its own page.`,
    },
    {
      q: 'Which materials are the parts made from?',
      a: `The catalogue includes parts in ${list(materials)}. The material is shown on each part page where it is confirmed.`,
    },
    {
      q: 'How do I ask for a quote?',
      a: `Use the Get a Quote form on this website. Tell us the part name, the quantity and where it will be used, and we will reply with a quote.`,
    },
    {
      q: 'Are prices listed on the website?',
      a: 'No. Prices depend on the part and the quantity, so we share them on request through a quote.',
    },
    {
      q: 'Do you dispatch outside Chandigarh?',
      a: 'Yes. Orders are dispatched through our Pan Bharat delivery network. Mention your location in the enquiry and we will confirm the details with the quote.',
    },
  ];
}

export default function FaqSection() {
  const items = buildCatalogueFaq();
  return (
    <section aria-labelledby="faq-h" className="p-section">
      <div className="pw">
        <div className="p-head">
          <div>
            <p className="p-eyebrow"><span>FAQ</span></p>
            <h2 id="faq-h" className="p-h2">Questions about our parts</h2>
          </div>
        </div>
        <dl className="p-faq">
          {items.map(i => (
            <div key={i.q} className="p-faq__item">
              <dt className="p-faq__q">{i.q}</dt>
              <dd className="p-faq__a">{i.a}</dd>
            </div>
          ))}
        </dl>
      </div>
      <JsonLd data={faqJsonLd(items)} />
    </section>
  );
}
