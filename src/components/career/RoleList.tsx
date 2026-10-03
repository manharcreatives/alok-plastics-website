'use client';

import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { EnvelopeSimple } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import Reveal from '@/components/ui/Reveal';
import { careerConfig } from '@/content/career';
import { useRuntimeContact, useRuntimeRoles } from '@/components/runtime/useRuntime';

const BTN = { minHeight: 56, padding: '0 var(--space-lg)', marginTop: 'var(--space-md)' } as const;

const mailto = (to: string, subject: string) => `mailto:${to}?subject=${encodeURIComponent(subject)}`;

/** Open roles: panel roles first, build-time published roles as fallback, then the empty state. */
export default function RoleList() {
  const runtimeRoles = useRuntimeRoles() as (ReturnType<typeof useRuntimeRoles>[number] & { description?: string })[];
  const { email } = useRuntimeContact();
  const roles = runtimeRoles.length > 0 ? runtimeRoles : careerConfig.openRoles.filter(r => r.published);

  if (roles.length > 0) {
    return (
      <ul className="cr-role-list">
        {roles.map(r => (
          <li key={r.id}>
            <strong style={{ color: 'var(--ink)' }}>{r.title}</strong>
            <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.875rem' }}>{r.team} · {r.location} · {r.type}</span>
            {'description' in r && typeof r.description === 'string' && r.description ? <p style={{ margin: 'var(--space-xs) 0 0', color: 'var(--body)' }}>{r.description}</p> : null}
            {email && (
              <a className="cta cta--line" href={mailto(email, `Application: ${r.title}`)} style={{ width: 'fit-content', marginTop: 'var(--space-xs)' }}>
                Apply by email <ArrowUpRight size={18} weight="light" aria-hidden="true" />
              </a>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Reveal variant="wipe">
      <div className="cr-empty">
        <h3>No open roles right now</h3>
        <p>
          {email
            ? 'You are welcome to send your CV and we will keep it on file.'
            : 'Reach out through our contact page and tell us about yourself.'}
        </p>
        {email ? (
          <a className="cp-btn" style={BTN} href={mailto(email, 'Career enquiry: CV')}>
            <EnvelopeSimple size={20} weight="light" aria-hidden="true" /> Send your CV
          </a>
        ) : (
          <Link className="cp-btn" href="/contact/" style={BTN}>Contact us <ArrowUpRight size={20} weight="light" aria-hidden="true" /></Link>
        )}
      </div>
    </Reveal>
  );
}
