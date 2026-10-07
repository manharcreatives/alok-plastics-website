/** BlogCard: one post as a card. The whole card is one link (stretched on the title). */
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { blogPath, type BlogPost } from '@/content/blogs';
import BlogCover from './BlogCover';
import BlogMeta from './BlogMeta';
import './blogs.css';

export default function BlogCard({ post, headingAs: H = 'h3' }: { post: BlogPost; headingAs?: 'h2' | 'h3' }) {
  return (
    <article className="bl-card">
      <BlogCover post={post} />
      <div className="bl-card__body">
        <BlogMeta post={post} />
        <H className="bl-card__t"><Link href={blogPath(post.slug)}>{post.title}</Link></H>
        <p className="bl-card__x">{post.excerpt}</p>
        <span className="bl-card__go" aria-hidden="true">Read the guide <ArrowUpRight size={18} weight="light" /></span>
      </div>
    </article>
  );
}
