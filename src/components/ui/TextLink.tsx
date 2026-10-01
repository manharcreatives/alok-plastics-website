/**
 * TextLink — §15.1
 * Burgundy underline link with hover ↗ nudge.
 * Renders <a> by default; pass `asChild` pattern by wrapping with Next.js Link.
 */

import '@/styles/ui.css';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import type { AnchorHTMLAttributes } from 'react';

interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  showArrow?: boolean;
}

export default function TextLink({
  showArrow = true,
  className = '',
  children,
  ...props
}: TextLinkProps) {
  return (
    <a className={`text-link ${className}`.trim()} {...props}>
      {children}
      {showArrow && (
        <span className="text-link__arrow" aria-hidden="true"> <ArrowUpRight size="1em" weight="light" style={{ verticalAlign: '-0.12em' }} /></span>
      )}
    </a>
  );
}
