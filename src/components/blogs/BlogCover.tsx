/**
 * BlogCover: 16:9 cover. Drawn placeholder (burgundy field + line art) first; the photograph
 * (/images/blog/<slug>.webp, generated later) fades in over it via PhotoBg and renders nothing if
 * the file is missing, so the placeholder is never replaced.
 */
import PhotoBg from '@/components/ui/PhotoBg';
import type { BlogPost } from '@/content/blogs';
import BlogArt from './BlogArt';
import './blogs.css';

type Props = {
  post: Pick<BlogPost, 'cover' | 'coverAlt' | 'art'>;
  /** Give the photo meaningful alt text (article hero). Cards keep it decorative. */
  describe?: boolean;
  priority?: boolean;
  className?: string;
};

export default function BlogCover({ post, describe = false, priority = false, className }: Props) {
  return (
    <div className={className ? `bl-cover ${className}` : 'bl-cover'}>
      <div className="bl-cover__art" aria-hidden="true"><BlogArt art={post.art} /></div>
      <PhotoBg src={post.cover} alt={describe ? post.coverAlt : ''} priority={priority} width={1600} height={900} />
    </div>
  );
}
