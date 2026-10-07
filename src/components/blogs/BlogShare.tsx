'use client';

/** BlogShare: copy-link and WhatsApp share. Renders after hydration only for the copy button; the WhatsApp link works without JS. */
import { useState } from 'react';
import { Link as LinkIcon } from '@phosphor-icons/react/dist/csr/Link';
import { Check } from '@phosphor-icons/react/dist/csr/Check';
import { WhatsappLogo } from '@phosphor-icons/react/dist/csr/WhatsappLogo';
import './blogs.css';

export default function BlogShare({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const wa = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt('Copy this link', url);
    }
  }

  return (
    <div className="bl-share">
      <p className="bl-share__l">Share this guide</p>
      <button type="button" className="bl-btn bl-btn--sm" onClick={copy}>
        {copied ? <Check size={18} weight="light" aria-hidden="true" /> : <LinkIcon size={18} weight="light" aria-hidden="true" />}
        <span role="status" aria-live="polite">{copied ? 'Link copied' : 'Copy link'}</span>
      </button>
      <a className="bl-btn bl-btn--sm" href={wa} target="_blank" rel="noopener noreferrer">
        <WhatsappLogo size={18} weight="light" aria-hidden="true" /> WhatsApp
      </a>
    </div>
  );
}
