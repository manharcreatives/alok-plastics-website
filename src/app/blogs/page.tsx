/**
 * /blogs/: guides index. Own header (light), one featured guide, category chips + grid,
 * Blog + BreadcrumbList JSON-LD and the shared enquiry band. Static: every post is in the
 * HTML; the chips are a light client filter.
 */
import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/page/Breadcrumbs';
import EnquiryBand from '@/components/page/EnquiryBand';
import BlogCover from '@/components/blogs/BlogCover';
import BlogMeta from '@/components/blogs/BlogMeta';
import BlogFilterGrid from '@/components/blogs/BlogFilterGrid';
import Link from 'next/link';
import { blogsByDate, blogPath, getBlog } from '@/content/blogs';
import { blogJsonLd, OG_IMAGE_PATH } from '@/lib/seo';
import { site } from '@/content/site';
import '@/components/blogs/blogs.css';

const TITLE = 'Cooler & Freezer Spare Parts Guides | Alok Plastics';
const DESCRIPTION =
  'Practical guides on water cooler, display counter and deep freezer spare parts: float valves, F-bushes, gaskets, hinges, materials and custom parts.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/blogs/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: 'en_IN',
    title: TITLE,
    description: DESCRIPTION,
    url: '/blogs/',
    images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: `${site.name} spare parts guides` }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [OG_IMAGE_PATH] },
};

/** The guide with the broadest search demand leads the page. */
const FEATURED_SLUG = 'water-cooler-float-valve-overflow-leakage';

export default function BlogsPage() {
  const posts = blogsByDate();
  const featured = getBlog(FEATURED_SLUG) ?? posts[0];
  const rest = posts.filter(p => p.slug !== featured.slug);

  return (
    <>
      <JsonLd data={blogJsonLd(posts, 'Alok Plastics Blog', DESCRIPTION)} />
      <header className="bl-head">
        <div className="bl-pw">
          <div className="bl-head__in">
            <Breadcrumbs items={[{ label: 'Blogs' }]} />
            <p className="bl-eyebrow">Guides from the workshop</p>
            <h1 className="bl-h1">Spare parts guides for coolers, counters and freezers.</h1>
            <p className="bl-lede">
              Plain, practical answers for technicians, dealers and assemblers: how to find the faulty part, choose the right material and order it correctly the first time.
            </p>
          </div>
        </div>
      </header>

      <section aria-label="Guides" className="bl-main">
        <div className="bl-pw">
          <article className="bl-feat">
            <BlogCover post={featured} priority />
            <div className="bl-feat__body">
              <span className="bl-tag">Featured guide</span>
              <BlogMeta post={featured} />
              <h2 className="bl-feat__t"><Link href={blogPath(featured.slug)}>{featured.title}</Link></h2>
              <p className="bl-feat__x">{featured.excerpt}</p>
              <span className="bl-card__go" aria-hidden="true">Read the guide →</span>
            </div>
          </article>
          <BlogFilterGrid posts={rest} />
        </div>
      </section>

      <EnquiryBand
        variant="wide"
        fold="register"
        heading="Can't find your part? Tell us what you need."
        text="Share the part name, a photo or sample, the size and the quantity, and we will reply with a quote."
      />
    </>
  );
}

