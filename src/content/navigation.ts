import type { NavigationConfig } from './types';
import { productGroups, publishedProducts } from './products';

// Alok Plastics — Navigation configuration
// §8.1: Primary: Home · About · Products ▾ · Industries · Career · Contact + CTA

export const navigation: NavigationConfig = {
  primary: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about/' },
    { label: 'Products', href: '/products/' },
    { label: 'Industries', href: '/industries/' },
    { label: 'Career', href: '/career/' },
    { label: 'Contact', href: '/contact/' },
  ],

  // Mega-panel columns — one per product group with its published parts
  productColumns: productGroups.map(group => ({
    groupId: group.id,
    groupName: group.name,
    slug: group.slug,
    parts: publishedProducts
      .filter(p => p.group === group.id)
      .map(p => ({
        name: p.name,
        slug: p.slug,
        pictogram: p.slug, // pictogram component name matches product slug
      })),
  })),

  footer: [
    // Products — one link per product group (slugs from products.ts)
    ...productGroups.map(g => ({ label: g.name, href: `/products/${g.slug}/` })),
    // Company
    { label: 'About', href: '/about/' },
    { label: 'Industries', href: '/industries/' },
    { label: 'Career', href: '/career/' },
    { label: 'Contact', href: '/contact/' },
  ],

  legal: [
    { label: 'Privacy Policy', href: '/privacy/' },
    { label: 'Terms & Conditions', href: '/terms/' },
    { label: 'Refund Policy', href: '/refund/' },
  ],
};

// Footer column slices — derived so the footer never depends on array indices.
// All hrefs map to Phase 7 routes and keep trailing slashes (static export).
export const footerProductLinks = navigation.footer.filter(l => l.href.startsWith('/products/'));
export const footerCompanyLinks = navigation.footer.filter(l => !l.href.startsWith('/products/'));
