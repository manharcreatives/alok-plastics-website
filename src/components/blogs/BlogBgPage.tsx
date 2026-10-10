/**
 * BlogBgPage: gives the header and the readable story of one guide a large, light background photo
 * from the catalogue. The FAQ, closing panel and related guides keep the default theme.
 */
import type { ReactNode } from 'react';
import { blogBgStyle } from '@/lib/blog-bg';

const WASH = 'linear-gradient(rgba(246, 243, 243, 0.86), rgba(246, 243, 243, 0.9))';

const CSS = `
.bl-bgpage .bl-ah { background: ${WASH}, var(--bl-img-1) center / cover no-repeat; }
.bl-bgpage .bl-article { background: ${WASH}, var(--bl-img-2) center / cover no-repeat; }
`;

export default function BlogBgPage({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <div className="bl-bgpage" style={blogBgStyle(slug)}>
      <style>{CSS}</style>
      {children}
    </div>
  );
}
