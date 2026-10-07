import { formatBlogDate, type BlogPost } from '@/content/blogs';

/** Category · date · read time line used on cards and the article header. */
export default function BlogMeta({ post, showAuthor = false }: { post: BlogPost; showAuthor?: boolean }) {
  return (
    <p className="bl-meta">
      <span className="bl-meta__cat">{post.category}</span>
      <span className="bl-meta__dot" aria-hidden="true" />
      <time dateTime={post.publishDate}>{formatBlogDate(post.publishDate)}</time>
      <span className="bl-meta__dot" aria-hidden="true" />
      <span>{post.readMinutes} min read</span>
      {showAuthor && (
        <>
          <span className="bl-meta__dot" aria-hidden="true" />
          <span>{post.author}</span>
        </>
      )}
    </p>
  );
}
