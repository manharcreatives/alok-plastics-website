/**
 * Part-finder helpers, kept as thin wrappers over catalog-search so existing consumers
 * (PartFinder) keep working. New code should use `@/lib/catalog-search` directly.
 *
 * Machine filter never claims a machine for a product whose fit is unconfirmed ('TODO').
 */
import { MATERIAL_LABELS, knownMachines, publishedProducts } from '@/content/products';
import type { MachineId, MaterialId, Product } from '@/content/types';
import { applyProductOverride } from '@/components/runtime/useRuntime';
import type { RuntimeProducts } from '@/lib/runtime-schema';
import { DEFAULT_QUERY, isListable, searchCatalog } from '@/lib/catalog-search';

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

/** Merged, listable products per override map, so the search index is built once per edit. */
const listCache = new WeakMap<object, Product[]>();
let buildList: Product[] | null = null;

function listFor(edits?: RuntimeProducts['products'] | null, hidden?: ReadonlySet<string>): Product[] {
  if (hidden && hidden.size > 0) {
    // Hidden sets are rebuilt by the caller on change; a fresh list here is cheap and never stale.
    return base(edits).filter(p => !hidden.has(p.slug));
  }
  return base(edits);
}

function base(edits?: RuntimeProducts['products'] | null): Product[] {
  if (!edits || edits.size === 0) {
    return (buildList ??= publishedProducts.filter(p => p.group && isListable(p)));
  }
  let hit = listCache.get(edits);
  if (!hit) {
    hit = publishedProducts
      .map(p => applyProductOverride(p, edits.get(p.slug)))
      .filter(p => p.group && isListable(p));
    listCache.set(edits, hit);
  }
  return hit;
}

export function searchParts(
  f: PartQuery,
  hidden?: ReadonlySet<string>,
  edits?: RuntimeProducts['products'] | null,
): Product[] {
  return searchCatalog(listFor(edits, hidden), {
    ...DEFAULT_QUERY,
    q: f.q,
    machines: f.machine === 'all' ? [] : [f.machine],
    materials: f.material === 'all' ? [] : [f.material],
    pageSize: 100_000,
  }).items;
}
