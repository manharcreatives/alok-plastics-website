/**
 * /blogs/[slug]/: one guide. Article layout (68ch measure, contents rail), FAQ accordion with
 * FAQPage JSON-LD, BlogPosting + BreadcrumbList JSON-LD, closing action panel, related guides and
 * newer / older navigation. Pre-rendered for every post (dynamicParams = false).
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/page/Breadcrumbs';
import BlogCover from '@/components/blogs/BlogCover';
import BlogMeta from '@/components/blogs/BlogMeta';
import BlogBody from '@/components/blogs/BlogBody';
import BlogToc from '@/components/blogs/BlogToc';
import BlogAside from '@/components/blogs/BlogAside';
import BlogFaq from '@/components/blogs/BlogFaq';
import BlogShare from '@/components/blogs/BlogShare';
import BlogCta from '@/components/blogs/BlogCta';
import BlogCard from '@/components/blogs/BlogCard';
import {
  blogHeadings,
  blogNeighbours,
  blogPath,
  blogPosts,
  blogWordCount,
  getBlog,
  relatedBlogs,
} from '@/content/blogs';
import { absoluteUrl, blogPostingJsonLd } from '@/lib/seo';
import { blogShareImage } from '@/lib/blog-image';
import { site } from '@/content/site';
import '@/components/blogs/blogs.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map(p => ({ slug: p.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlog(slug);
  if (!post) return {};
  const img = blogShareImage(post);
  return {
    title: { absolute: post.metaTitle },
    description: post.metaDescription,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: { canonical: blogPath(post.slug) },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      siteName: site.name,
      locale: 'en_IN',
      title: post.metaTitle,
      description: post.metaDescription,
      url: blogPath(post.slug),
      publishedTime: post.publishDate,
      modifiedTime: post.publishDate,
      authors: [post.author],
      section: post.category,
      tags: post.tags,
      images: [{ url: img.url, width: img.width, height: img.height, alt: post.coverAlt }],
    },
    twitter: { card: 'summary_large_image', title: post.metaTitle, description: post.metaDescription, images: [img.url] },
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getBlog(slug);
  if (!post) notFound();

  const toc = blogHeadings(post);
  const related = relatedBlogs(post, 2);
  const { newer, older } = blogNeighbours(post.slug);
  const img = blogShareImage(post);

  return (
    <>
      <JsonLd data={blogPostingJsonLd(post, img.url, blogWordCount(post))} />

      <header className="bl-ah">
        <div className="bl-pw">
          <div className="bl-ah__in">
            <Breadcrumbs items={[{ label: 'Blogs', href: '/blogs/' }, { label: post.title }]} />
            <BlogMeta post={post} showAuthor />
            <h1 className="bl-ah__h1">{post.title}</h1>
            <p className="bl-ah__x">{post.excerpt}</p>
          </div>
          <div className="bl-hero"><BlogCover post={post} describe priority className="bl-cover--wide" /></div>
        </div>
      </header>

      <article className="bl-article">
        <div className="bl-pw bl-article__in">
          <BlogToc items={toc} variant="rail" />
          <div className="bl-article__main">
            <BlogToc items={toc} variant="inline" />
            <BlogBody blocks={post.body} />
            <BlogShare url={absoluteUrl(blogPath(post.slug))} title={post.title} />
          </div>
          <BlogAside post={post} />
        </div>
      </article>

      <BlogFaq items={post.faq} />
      <BlogCta slug={post.slug} title={post.title} />

      <section aria-labelledby="bl-more-h" className="bl-more">
        <div className="bl-pw">
          <p className="bl-eyebrow">Keep reading</p>
          <h2 id="bl-more-h" className="bl-h2 bl-more__h">Related guides</h2>
          <ul className="bl-grid">
            {related.map(p => <li key={p.slug}><BlogCard post={p} /></li>)}
          </ul>
          <nav className="bl-pn" aria-label="More guides">
            {newer ? (
              <Link href={blogPath(newer.slug)}><small>Newer guide</small><strong>{newer.title}</strong></Link>
            ) : <span aria-hidden="true" />}
            {older ? (
              <Link href={blogPath(older.slug)} className="bl-pn__next"><small>Older guide</small><strong>{older.title}</strong></Link>
            ) : <span aria-hidden="true" />}
          </nav>
          <p className="bl-more__all"><Link href="/blogs/" className="bl-btn bl-btn--ghost">All guides</Link></p>
        </div>
      </section>
    </>
  );
}
