'use client';

import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { EnvelopeSimple } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import Reveal from '@/components/ui/Reveal';
import { careerConfig } from '@/content/career';
import { useRuntimeRoles } from '@/components/runtime/useRuntime';

const BTN = { minHeight: 56, padding: '0 var(--space-lg)', marginTop: 'var(--space-md)' } as const;

/** Open roles: panel roles first, build-time published roles as fallback, then the empty state. */
export default function RoleList() {
  const runtimeRoles = useRuntimeRoles() as (ReturnType<typeof useRuntimeRoles>[number] & { description?: string })[];
  const roles = runtimeRoles.length > 0 ? runtimeRoles : careerConfig.openRoles.filter(r => r.published);

  if (roles.length > 0) {
    return (
      <ul className="cr-role-list">
        {roles.map(r => (
          <li key={r.id}>
            <strong style={{ color: 'var(--ink)' }}>{r.title}</strong>
            <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.875rem' }}>{r.team} · {r.location} · {r.type}</span>
            {'description' in r && typeof r.description === 'string' && r.description ? <p style={{ margin: 'var(--space-xs) 0 0', color: 'var(--body)' }}>{r.description}</p> : null}
            <a className="cta cta--line" href="#apply" style={{ width: 'fit-content', marginTop: 'var(--space-xs)' }}>
              Apply now <ArrowUpRight size={18} weight="light" aria-hidden="true" />
            </a>
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
          You are welcome to send your CV and we will keep it on file.
        </p>
        <a className="cp-btn" style={BTN} href="#apply">
          <EnvelopeSimple size={20} weight="light" aria-hidden="true" /> Send your CV
        </a>
      </div>
    </Reveal>
  );
}
