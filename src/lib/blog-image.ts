/**
 * Build-time only (server components / generateMetadata). The blog cover photographs are generated
 * later, so structured data and Open Graph must not point at a file that does not exist yet:
 * use the cover when /public has it, otherwise fall back to the site OG image.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { BlogPost } from '@/content/blogs';
import { OG_IMAGE_PATH } from '@/lib/seo';

export function blogCoverExists(post: Pick<BlogPost, 'cover'>): boolean {
  try {
    return existsSync(join(process.cwd(), 'public', post.cover));
  } catch {
    return false;
  }
}

export function blogShareImage(post: Pick<BlogPost, 'cover'>): { url: string; width: number; height: number } {
  return blogCoverExists(post)
    ? { url: post.cover, width: 1600, height: 900 }
    : { url: OG_IMAGE_PATH, width: 1200, height: 630 };
}
