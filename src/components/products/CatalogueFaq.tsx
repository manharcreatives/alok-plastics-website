/**
 * CatalogueFaq: the /products FAQ as a ruled accordion in the drawing-sheet language
 * (sticky heading left, hairline rows right, burgundy rule + ↗ marker on the open row).
 * Answers come from FaqSection's buildCatalogueFaq (all assembled from src/content, nothing invented).
 * Native <details>: works without JS, keyboard operable, answers stay in the DOM for crawlers.
 */
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import JsonLd from '@/components/seo/JsonLd';
import { faqJsonLd } from '@/lib/seo';
import { buildCatalogueFaq } from '@/components/sections/FaqSection';
import './products.css';

export default function CatalogueFaq() {
  const items = buildCatalogueFaq();
  return (
    <section aria-labelledby="faq-h" className="pq">
      <div className="pw pq__in">
        <header className="pq__head">
          <p className="p-eyebrow">FAQ</p>
          <h2 id="faq-h" className="p-h2">Questions about our parts</h2>
          <p className="pq__lead">Short answers about the catalogue, quotes and dispatch.</p>
        </header>
        <ul className="pq__list">
          {items.map(i => (
            <li key={i.q}>
              <details className="pq__item">
                <summary className="pq__q">
                  <span>{i.q}</span>
                  <span className="pq__mark" aria-hidden="true"><ArrowUpRight size={22} weight="light" /></span>
                </summary>
                <p className="pq__a">{i.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
      <JsonLd data={faqJsonLd(items)} />
    </section>
  );
}
