/** BlogFaq: native <details> accordion + FAQPage JSON-LD. Answers stay in the DOM for crawlers. */
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import JsonLd from '@/components/seo/JsonLd';
import { faqJsonLd } from '@/lib/seo';
import { stripMarkup, type BlogFaq as Faq } from '@/content/blogs';
import './blogs.css';

export default function BlogFaq({ items }: { items: Faq[] }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="bl-faq-h" className="bl-faq">
      <div className="bl-pw">
        <div className="bl-faq__in">
          <p className="bl-eyebrow">FAQ</p>
          <h2 id="bl-faq-h" className="bl-h2">Quick answers</h2>
          <ul className="bl-faq__list">
            {items.map(i => (
              <li key={i.q}>
                <details className="bl-faq__item">
                  <summary className="bl-faq__q">
                    <span>{i.q}</span>
                    <span className="bl-faq__mark" aria-hidden="true"><ArrowUpRight size={22} weight="light" /></span>
                  </summary>
                  <p className="bl-faq__a">{i.a}</p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <JsonLd data={faqJsonLd(items.map(i => ({ q: i.q, a: stripMarkup(i.a) })))} />
    </section>
  );
}
