#!/usr/bin/env node
// Generates llms.txt (concise) and llms-full.txt (per-part detail) from src/content.
// Verified facts only: nothing here is written by hand except sentence frames.
// Null contact fields are skipped, prices are never included (site.showPrices === false).
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadContent, writeBoth, ROOT } from './lib/content.mjs';

const c = await loadContent();
const { site, productGroups, productsByGroup, productPath, MATERIAL_LABELS, MACHINE_LABELS, industries, formatAddress } = c;
const { blogPosts, blockText } = await import(pathToFileURL(join(ROOT, 'node_modules', '.cache', 'alok-content', 'blogs.mjs')).href);
const origin = site.domain.replace(/\/+$/, '');
const url = p => `${origin}${p}`;

const statement =
  `${site.name} is a ${site.contact.city}-based manufacturer, established in ${site.foundingYear}, ` +
  'of moulded plastic and steel spare parts for water coolers, display counters and deep freezers.';

const contactLines = [
  `- Address: ${formatAddress()}`,
  ...(site.contact.phone ? [`- Phone: ${site.contact.phone}`] : []),
  ...(site.contact.whatsapp ? [`- WhatsApp: ${site.contact.whatsapp}`] : []),
  ...(site.contact.email ? [`- Email: ${site.contact.email}`] : []),
  `- Enquiries and quotes: ${url('/enquiry/')} (prices are shared on request, per part and quantity)`,
];

const head = [
  `# ${site.name}`,
  '',
  `> ${statement}`,
  '',
  '## Facts',
  `- Established: ${site.foundingYear}`,
  `- Location: ${site.contact.city}, India`,
  ...site.owners.map(o => `- ${o.title}: ${o.name}`),
  `- Tagline: ${site.tagline.english}`,
  '- Delivery: Pan Bharat delivery network',
  ...site.proof.filter(p => p.isNumeric && p.label !== 'Commitment to quality & trust' && p.value !== '1998')
    .map(p => `- Company-reported: ${p.value} ${p.label.toLowerCase()}`),
  '',
  '## Contact',
  ...contactLines,
  '',
  '## Key pages',
  `- [Home](${url('/')})`,
  `- [Products](${url('/products/')}): part finder and all part groups`,
  `- [About](${url('/about/')})`,
  `- [Industries](${url('/industries/')})`,
  `- [Blogs](${url('/blogs/')}): practical guides on cooler, display counter and deep freezer spare parts`,
  `- [Contact](${url('/contact/')})`,
  `- [Get a quote](${url('/enquiry/')})`,
  '',
].join('\n');

const groupsShort = productGroups.map(g => {
  const parts = productsByGroup(g.id);
  return [
    `### ${g.name}`,
    `${g.description}`,
    ...parts.map(p => `- [${p.name}](${url(productPath(p))})${p.material ? `: ${MATERIAL_LABELS[p.material]}` : ''}`),
    '',
  ].join('\n');
}).join('\n');

const blogsByDate = [...blogPosts].sort((a, b) => b.publishDate.localeCompare(a.publishDate));
const blogsShort = ['## Guides (blog)', '', ...blogsByDate.map(b => `- [${b.title}](${url(`/blogs/${b.slug}/`)}): ${b.metaDescription}`), ''].join('\n');

const industriesBlock = industries.length
  ? ['## Industries', ...industries.map(i => `- ${i.name}`), ''].join('\n')
  : '';

writeBoth('llms.txt', `${head}\n## Products\n\n${groupsShort}\n${blogsShort}\n${industriesBlock}`.trimEnd() + '\n');

// ── llms-full.txt ────────────────────────────────────────────────────────────
const full = productGroups.map(g => {
  const parts = productsByGroup(g.id);
  return [
    `## ${g.name}`,
    `URL: ${url(`/products/${g.slug}/`)}`,
    g.description,
    '',
    ...parts.flatMap(p => {
      const machines = Array.isArray(p.machine) ? p.machine.map(m => MACHINE_LABELS[m]).join(', ') : '';
      return [
        `### ${p.name}`,
        `URL: ${url(productPath(p))}`,
        ...(p.summary ? [p.summary] : []),
        ...(p.material ? [`- Material: ${MATERIAL_LABELS[p.material]}`] : []),
        ...(machines ? [`- Used in: ${machines}`] : []),
        ...(p.variants?.length ? [`- Sizes / variants: ${p.variants.map(v => v.label).join('; ')}`] : []),
        ...(p.sku ? [`- SKU: ${p.sku}`] : []),
        '',
      ];
    }),
  ].join('\n');
}).join('\n');

// Guides in full: heading, URL, date, then the article text (inline markup stripped by blockText).
const guidesFull = blogsByDate.map(b => [
  `### ${b.title}`,
  `URL: ${url(`/blogs/${b.slug}/`)}`,
  `Published: ${b.publishDate} · By ${b.author} · ${b.category}`,
  '',
  ...b.body.flatMap(blk => {
    if (blk.t === 'h2') return ['', `#### ${blk.text}`];
    if (blk.t === 'h3') return ['', `##### ${blk.text}`];
    if (blk.t === 'ul' || blk.t === 'ol') return blk.items.map(it => `- ${blockText({ t: 'p', text: it })}`);
    if (blk.t === 'table') return [`${blk.caption}:`, ...blk.rows.map(r => `- ${blk.head.map((h, i) => `${h}: ${r[i]}`).join('; ')}`)];
    return [blockText(blk)];
  }),
  '',
  'Questions and answers:',
  ...b.faq.map(f => `- Q: ${f.q} A: ${blockText({ t: 'p', text: f.a })}`),
  '',
].join('\n')).join('\n');

writeBoth('llms-full.txt', `${head}\n# Full parts list\n\n${full}\n# Guides (blog)\n\n${guidesFull}\n${industriesBlock}`.trimEnd() + '\n');
console.log('llms.txt + llms-full.txt written');
