/**
 * SectionHeader — §15.1
 * MicroLabel (with rule) + H2 + optional lead paragraph + optional right-aligned link.
 * Spacing: 16px label→heading, 24px heading→lead.
 * Used consistently across all S3–S13 sections.
 */

import MicroLabel from './MicroLabel';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';

interface SectionHeaderProps {
  label: string;
  labelNumber?: string | number;
  heading: string;
  lead?: string;
  link?: { href: string; label: string };
  align?: 'left' | 'center';
  headingAs?: 'h2' | 'h3';
  className?: string;
}

export default function SectionHeader({
  label,
  labelNumber,
  heading,
  lead,
  link,
  align = 'left',
  headingAs: H = 'h2',
  className = '',
}: SectionHeaderProps) {
  const textAlign = align === 'center' ? 'center' : 'left';
  const alignItems = align === 'center' ? 'center' : 'flex-start';

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems,
        textAlign,
      }}
    >
      {/* Row: MicroLabel + optional right-aligned link */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : 'space-between',
        width: '100%',
        marginBottom: 16,
      }}>
        <MicroLabel number={labelNumber} showRule={align !== 'center'}>
          {label}
        </MicroLabel>

        {link && (
          <a
            href={link.href}
            style={{
              fontSize: '0.875rem',
              color: 'var(--burgundy)',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              fontWeight: 600,
              display: 'none', /* shown via media query in globals */
            }}
            className="section-header__link"
          >
            {link.label} <ArrowUpRight size="1em" weight="light" aria-hidden="true" style={{ verticalAlign: '-0.12em' }} />
          </a>
        )}
      </div>

      <H
        style={{
          fontFamily: 'var(--font-archivo, sans-serif)',
          fontVariationSettings: '"wdth" 125',
          fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
          lineHeight: 1.1,
          letterSpacing: '-0.025em',
          fontWeight: 650,
          color: 'var(--ink)',
          maxWidth: '22ch',
          marginBottom: lead ? 24 : 0,
        }}
      >
        {heading}
      </H>

      {lead && (
        <p style={{
          fontSize: '1.0625rem',
          lineHeight: 1.65,
          color: 'var(--body)',
          maxWidth: '60ch',
        }}>
          {lead}
        </p>
      )}
    </div>
  );
}
