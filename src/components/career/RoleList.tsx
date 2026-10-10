'use client';

import { Fragment, useState } from 'react';
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { EnvelopeSimple } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import Reveal from '@/components/ui/Reveal';
import { careerConfig } from '@/content/career';
import { useRuntimeRoles } from '@/components/runtime/useRuntime';

const BTN = { minHeight: 56, padding: '0 var(--space-lg)', marginTop: 'var(--space-md)' } as const;

const TYPE_LABEL: Record<string, string> = { 'full-time': 'Full-time', 'part-time': 'Part-time', contract: 'Contract', internship: 'Internship' };
/** The panel stores a team id (e.g. "social-media-marketing"); show its proper name. */
const teamName = (id: string) => careerConfig.teams.find(t => t.id === id)?.name ?? id;

const CSS = `
.rt-count { margin: 0 0 var(--space-xs); font-size: var(--fs-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 600; color: var(--muted); font-family: var(--font-archivo), sans-serif; }
.rt-scroll { overflow-x: auto; border: 1px solid var(--grey-warm); border-radius: var(--radius-card); background: var(--surface); }
.rt-table { width: 100%; border-collapse: collapse; text-align: left; }
.rt-table thead th { padding: var(--space-xs) var(--space-sm); background: var(--surface-alt); border-bottom: 1px solid var(--ink); font-family: var(--font-archivo), sans-serif; font-size: var(--fs-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 600; color: var(--muted); white-space: nowrap; }
.rt-table td { padding: var(--space-sm); border-bottom: 1px solid var(--grey-warm); color: var(--body); vertical-align: middle; font-size: 0.9375rem; }
.rt-row { position: relative; transition: background-color 200ms cubic-bezier(.16,1,.3,1); }
.rt-row:hover, .rt-row.is-open { background: var(--blush); }
.rt-row td:first-child { box-shadow: inset 2px 0 0 transparent; transition: box-shadow 200ms cubic-bezier(.16,1,.3,1); }
.rt-row:hover td:first-child, .rt-row.is-open td:first-child { box-shadow: inset 2px 0 0 var(--burgundy); }
.rt-role strong { display: block; color: var(--ink); font-family: var(--font-archivo), sans-serif; font-weight: 650; font-size: 1.0625rem; }
.rt-more { display: inline-flex; align-items: center; gap: 4px; min-height: 32px; margin-top: 2px; padding: 0; background: none; border: 0; color: var(--burgundy); font: inherit; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
.rt-more svg { transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.rt-more[aria-expanded="true"] svg { transform: rotate(180deg); }
.rt-chip { display: inline-block; padding: 2px var(--space-xs); border: 1px solid var(--grey-metal); border-radius: 999px; font-size: 0.8125rem; font-weight: 600; color: var(--ink); background: var(--surface); white-space: nowrap; }
.rt-act { text-align: right; white-space: nowrap; }
.rt-apply { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-xs); min-height: 44px; padding: 0 var(--space-md); background: var(--burgundy); color: var(--surface); border: 1px solid var(--burgundy); border-radius: var(--radius-card); font: inherit; font-size: 0.9375rem; font-weight: 600; cursor: pointer; transition: background-color 200ms cubic-bezier(.16,1,.3,1); }
.rt-apply:hover { background: var(--burgundy-deep); }
.rt-apply svg { transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.rt-apply:hover svg { transform: translate3d(2px, -2px, 0); }
.rt-apply:focus-visible, .rt-more:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.rt-detail td { background: var(--canvas); padding-top: 0; }
.rt-detail p { margin: 0; max-width: 70ch; line-height: 1.65; color: var(--body); white-space: pre-line; }
@media (max-width: 719px) {
  .rt-scroll { overflow: visible; border: 0; background: none; }
  .rt-table, .rt-table tbody, .rt-table tr, .rt-table td { display: block; }
  .rt-table thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  .rt-row { margin-bottom: var(--space-sm); padding: var(--space-xs) 0; background: var(--surface); border: 1px solid var(--grey-warm); border-left: 2px solid var(--burgundy); border-radius: var(--radius-card); }
  .rt-row td { display: flex; justify-content: space-between; gap: var(--space-sm); padding: 6px var(--space-sm); border: 0; text-align: right; }
  .rt-row td::before { content: attr(data-label); flex: none; font-size: var(--fs-label); letter-spacing: var(--tr-label); text-transform: uppercase; font-weight: 600; color: var(--muted); text-align: left; }
  .rt-row td.rt-role { display: block; text-align: left; }
  .rt-row td.rt-role::before, .rt-row td.rt-act::before { content: none; }
  .rt-row td.rt-act { display: block; padding-top: var(--space-xs); }
  .rt-apply { width: 100%; }
  .rt-detail { margin: calc(-1 * var(--space-xs)) 0 var(--space-sm); background: var(--canvas); border: 1px solid var(--grey-warm); border-radius: var(--radius-card); }
  .rt-detail td { display: block; padding: var(--space-sm); }
}
@media (prefers-reduced-motion: reduce) { .rt-row, .rt-more svg, .rt-apply, .rt-apply svg { transition: none; } }
`;

/** Open roles: panel roles first, build-time published roles as fallback, then the empty state. */
export default function RoleList() {
  const runtimeRoles = useRuntimeRoles() as (ReturnType<typeof useRuntimeRoles>[number] & { description?: string })[];
  const roles = runtimeRoles.length > 0 ? runtimeRoles : careerConfig.openRoles.filter(r => r.published);

  const [open, setOpen] = useState<string | null>(null);

  if (roles.length > 0) {
    const apply = (title: string) => {
      window.dispatchEvent(new CustomEvent('alok:apply-role', { detail: { title } }));
      document.getElementById('apply')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    };
    return (
      <div className="rt">
        <style>{CSS}</style>
        <p className="rt-count" aria-live="polite">{roles.length} open {roles.length === 1 ? 'role' : 'roles'}</p>
        <div className="rt-scroll">
          <table className="rt-table">
            <caption className="sr-only">Open roles at Alok Plastics</caption>
            <thead>
              <tr>
                <th scope="col">Role</th>
                <th scope="col">Team</th>
                <th scope="col">Location</th>
                <th scope="col">Type</th>
                <th scope="col"><span className="sr-only">Apply</span></th>
              </tr>
            </thead>
            <tbody>
              {roles.map(r => {
                const desc = 'description' in r && typeof r.description === 'string' ? r.description : '';
                const isOpen = open === r.id;
                return (
                  <Fragment key={r.id}>
                    <tr className={`rt-row${isOpen ? ' is-open' : ''}`}>
                      <td data-label="Role" className="rt-role">
                        <strong>{r.title}</strong>
                        {desc && (
                          <button type="button" className="rt-more" aria-expanded={isOpen} aria-controls={`rt-d-${r.id}`} onClick={() => setOpen(isOpen ? null : r.id)}>
                            {isOpen ? 'Hide details' : 'View details'} <CaretDown size={14} weight="bold" aria-hidden="true" />
                          </button>
                        )}
                      </td>
                      <td data-label="Team">{teamName(r.team)}</td>
                      <td data-label="Location">{r.location}</td>
                      <td data-label="Type"><span className="rt-chip">{TYPE_LABEL[r.type] ?? r.type}</span></td>
                      <td className="rt-act">
                        <button type="button" className="rt-apply" onClick={() => apply(r.title)} aria-label={`Apply for ${r.title}`}>
                          Apply now <ArrowUpRight size={18} weight="light" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                    {desc && isOpen && (
                      <tr className="rt-detail" id={`rt-d-${r.id}`}>
                        <td colSpan={5}><p>{desc}</p></td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
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
