/**
 * Button — §15.1
 * Variants: primary · secondary · on-burgundy · whatsapp · ghost
 * Sizes: sm (36px) · md (48px) · lg (56px)
 * States: default · hover (light-sweep) · focus-visible · active · disabled · loading
 *
 * Renders <button> by default; renders <a> when `href` is provided (external).
 * Use Next.js <Link> directly for internal navigation — wrap it with className='btn btn--primary btn--md'.
 */

import '@/styles/ui.css';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'on-burgundy' | 'whatsapp' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
};

type ButtonElementProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    href?: undefined;
    children?: React.ReactNode;
  };

type AnchorElementProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
    href: string;
    children?: React.ReactNode;
  };

type ButtonProps = ButtonElementProps | AnchorElementProps;

const ARROW = (
  <span className="btn__icon" aria-hidden="true">↗</span>
);

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'right',
  className = '',
  children,
  href,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    className,
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {!loading && icon && iconPosition === 'left' && (
        <span className="btn__icon">{icon}</span>
      )}
      {children}
      {/* Primary buttons get the ↗ arrow icon unless a custom icon is provided right */}
      {!loading && !icon && variant === 'primary' && (
        <span className="btn__icon" aria-hidden="true" style={{ fontSize: '0.8em', marginLeft: -2 }}>↗</span>
      )}
      {!loading && icon && iconPosition === 'right' && (
        <span className="btn__icon">{icon}</span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        aria-busy={loading || undefined}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={classes}
      aria-busy={loading || undefined}
      disabled={(rest as ButtonHTMLAttributes<HTMLButtonElement>).disabled || loading}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
}
