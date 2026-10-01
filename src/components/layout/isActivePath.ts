/** Route matching shared by the navbar and the drawer. Trailing slashes are ignored. */
const trim = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p);

export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  const p = trim(pathname);
  const h = trim(href);
  if (h === '/') return p === '/';
  return p === h || p.startsWith(`${h}/`);
}
