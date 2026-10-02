/**
 * EnquiryFallback — shown when the enquiry endpoint cannot be reached or rejects the send.
 * Offers email with the enquiry pre-filled when configured (site.contact.email),
 * and always offers Retry. Never WhatsApp (round 2, ask 17). Nothing here says "TODO".
 */

'use client';

import type { CSSProperties } from 'react';
import { fallbackChannels } from '@/lib/enquiry-submit';

interface Props {
  summaryLines: string[];
  onLight: boolean;
  rateLimited?: boolean;
  onRetry: () => void;
}

export default function EnquiryFallback({ summaryLines, onLight, rateLimited, onRetry }: Props) {
  const { mailto } = fallbackChannels(summaryLines);
  const hasChannel = !!mailto;
  const fg = onLight ? 'var(--ink)' : 'white';
  const fgMuted = onLight ? 'var(--body)' : 'rgba(255,255,255,0.8)';

  const btn: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '12px 20px', minHeight: 44,
    borderRadius: 'var(--radius-card)',
    fontWeight: 650, fontSize: '0.9375rem',
    textDecoration: 'none', cursor: 'pointer',
    border: '1px solid transparent',
  };

  let message: string;
  if (rateLimited) {
    message = 'You have just sent an enquiry. Please wait a moment before sending another.';
  } else if (hasChannel) {
    message = 'We could not send your enquiry from this page. Your details are safe. Please send them to us directly instead.';
  } else {
    message = 'We could not send your enquiry right now. Please check your connection and try again.';
  }

  return (
    <div
      role="alert"
      style={{
        display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)',
        padding: 'var(--space-sm)',
        border: `1px solid ${onLight ? 'var(--error)' : 'var(--rose-pale)'}`,
        borderRadius: 'var(--radius-card)',
        background: onLight ? 'var(--blush)' : 'rgba(255,255,255,0.06)',
      }}
    >
      <p style={{ fontSize: '0.9375rem', color: fg, lineHeight: 1.6, fontWeight: 600 }}>{message}</p>
      {!rateLimited && hasChannel && (
        <p style={{ fontSize: '0.8125rem', color: fgMuted, lineHeight: 1.5 }}>
          The message will be pre-filled with what you entered.
        </p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
        {!rateLimited && mailto && (
          <a
            href={mailto}
            style={{
              ...btn,
              background: onLight ? 'var(--surface)' : 'transparent',
              color: onLight ? 'var(--burgundy)' : 'white',
              borderColor: onLight ? 'var(--burgundy)' : 'rgba(255,255,255,0.6)',
            }}
          >
            Send by email
          </a>
        )}
        <button
          type="button"
          onClick={onRetry}
          style={{
            ...btn,
            background: 'transparent',
            color: fg,
            borderColor: onLight ? 'var(--grey-warm)' : 'rgba(255,255,255,0.4)',
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
