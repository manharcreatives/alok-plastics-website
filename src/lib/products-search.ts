/**
 * Part-finder search + filter logic (pure, client-safe).
 * Fuse.js index over published products only. Machine filter never claims a
 * machine for a product whose machine fit is unconfirmed ('TODO').
 */
import Fuse from 'fuse.js';
import {
  MACHINE_LABELS,
  MATERIAL_LABELS,
  getGroup,
  knownMachines,
  publishedProducts,
} from '@/content/products';
import type { MachineId, MaterialId, Product } from '@/content/types';

interface Doc {
  product: Product;
  name: string;
  summary: string;
  material: string;
  variants: string;
  group: string;
  machines: string;
}

const docs: Doc[] = publishedProducts
  .filter(p => p.group)
  .map(p => ({
    product: p,
    name: p.name,
    summary: p.summary ?? '',
    material: p.material ? MATERIAL_LABELS[p.material] : '',
    variants: (p.variants ?? []).map(v => `${v.label} ${v.note ?? ''}`).join(' '),
    group: p.group ? getGroup(p.group)?.name ?? '' : '',
    machines: knownMachines(p).map(m => MACHINE_LABELS[m]).join(' '),
  }));

const fuse = new Fuse(docs, {
  keys: [
    { name: 'name', weight: 0.5 },
    { name: 'material', weight: 0.15 },
    { name: 'variants', weight: 0.1 },
    { name: 'group', weight: 0.1 },
    { name: 'machines', weight: 0.1 },
    { name: 'summary', weight: 0.05 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

/** Machines that at least one product is confirmed for. */
export const availableMachines: MachineId[] = (
  ['water-cooler', 'display-counter', 'deep-freezer'] as MachineId[]
).filter(m => publishedProducts.some(p => knownMachines(p).includes(m)));

/** Materials that at least one product declares. */
export const availableMaterials: MaterialId[] = (
  Object.keys(MATERIAL_LABELS) as MaterialId[]
).filter(m => publishedProducts.some(p => p.material === m));

export interface PartQuery {
  q: string;
  machine: MachineId | 'all';
  material: MaterialId | 'all';
}

export function isFiltering(f: PartQuery): boolean {
  return f.q.trim().length > 0 || f.machine !== 'all' || f.material !== 'all';
}

export function searchParts(f: PartQuery): Product[] {
  const q = f.q.trim();
  let list: Product[] = q
    ? fuse.search(q).map(r => r.item.product)
    : docs.map(d => d.product);
  if (f.machine !== 'all') list = list.filter(p => knownMachines(p).includes(f.machine as MachineId));
  if (f.material !== 'all') list = list.filter(p => p.material === f.material);
  return list;
}
