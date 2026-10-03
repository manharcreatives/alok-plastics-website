'use client';

/**
 * Quantity stepper. Never below `min` (default 1) or above `max`; the typed value is
 * committed on blur / Enter so half-typed numbers are never pushed to the cart.
 * `onLimit` fires when the user tries to go past `max` (callers show "Only N units available.").
 */

import { useEffect, useRef, useState } from 'react';
import { Minus } from '@phosphor-icons/react/dist/csr/Minus';
import { Plus } from '@phosphor-icons/react/dist/csr/Plus';
import './cart.css';

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number | null;
  /** Accessible name, e.g. "Quantity for Float valve". */
  label: string;
  onLimit?: () => void;
}

const CEILING = 9999;

export default function QtyStepper({ value, onChange, min = 1, max = null, label, onLimit }: Props) {
  const hi = Math.min(max !== null && max !== undefined && max >= min ? max : CEILING, CEILING);
  const [draft, setDraft] = useState<string | null>(null);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didHold = useRef(false);
  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => () => { if (hold.current) clearTimeout(hold.current); }, []);

  const apply = (n: number) => {
    const clamped = Math.min(hi, Math.max(min, Math.floor(n)));
    if (n > hi) onLimit?.();
    if (clamped !== valueRef.current) { valueRef.current = clamped; onChange(clamped); }
  };

  const step = (dir: 1 | -1) => apply(valueRef.current + dir);
  const click = (dir: 1 | -1) => {
    if (didHold.current) { didHold.current = false; return; }
    if (dir === 1 && valueRef.current >= hi) { onLimit?.(); return; }
    step(dir);
  };

  /* Optional long-press: repeat after 450ms, then every 90ms. */
  const startHold = (dir: 1 | -1) => {
    if (hold.current) clearTimeout(hold.current);
    const tick = (delay: number) => {
      hold.current = setTimeout(() => { didHold.current = true; step(dir); tick(90); }, delay);
    };
    tick(450);
  };
  const stopHold = () => { if (hold.current) { clearTimeout(hold.current); hold.current = null; } };

  const commit = () => {
    if (draft === null) return;
    const n = parseInt(draft, 10);
    setDraft(null);
    apply(Number.isFinite(n) ? n : min);
  };

  return (
    <div className="qty" role="group" aria-label={label}>
      <button
        type="button"
        className="qty__btn"
        aria-label={`Decrease quantity. ${label}`}
        disabled={value <= min}
        onClick={() => click(-1)}
        onPointerDown={() => startHold(-1)}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
      >
        <Minus weight="light" size={18} aria-hidden="true" />
      </button>
      <input
        className="qty__input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={label}
        value={draft ?? String(value)}
        onChange={e => setDraft(e.target.value.replace(/\D/g, '').slice(0, 4))}
        onFocus={e => e.currentTarget.select()}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); commit(); }
          if (e.key === 'ArrowUp') { e.preventDefault(); step(1); }
          if (e.key === 'ArrowDown') { e.preventDefault(); step(-1); }
        }}
      />
      <button
        type="button"
        className="qty__btn"
        aria-label={`Increase quantity. ${label}`}
        aria-disabled={value >= hi ? true : undefined}
        onClick={() => click(1)}
        onPointerDown={() => startHold(1)}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
      >
        <Plus weight="light" size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
