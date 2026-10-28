/**
 * Splits a product's variant list into a colour picker and a size picker.
 *
 * The option pair of each variant is read from its SKU code first and from its
 * attributes only as a fallback, because on production the code is right more
 * often than the attributes are. When the data can't produce a unique pair per
 * variant the result is not splittable and the caller keeps the single dropdown
 * of variant names, so a customer can never pick a pair that maps to a SKU they
 * didn't intend.
 */

/** Attribute names differ per product ("Kích Thước", "Màu sắc & hoạ tiết", …). */
const SIZE_PATTERNS = ['kích cỡ', 'kích thước', 'size'];
const COLOR_PATTERNS = ['màu sắc', 'màu', 'color', 'colour'];

/** Colour first: SKU codes are `{parentCode}-{colour}-{size}`. */
const OPTION_KEYS = ['color', 'size'] as const;

export type ComboOptionKey = (typeof OPTION_KEYS)[number];

export interface ComboVariantInput {
  id: string;
  name: string;
  code?: string | null;
  attributes?: Array<{ name: string; value: string }>;
  /** Sellable stock. Undefined means unknown, which counts as in stock. */
  available?: number | null;
  image?: string | null;
}

export interface ComboOptionGroup {
  key: ComboOptionKey;
  /** Attribute name as it appears in the data, already localised by Nhanh. */
  label: string;
  values: string[];
}

export interface ComboVariantEntry {
  variantId: string;
  values: Partial<Record<ComboOptionKey, string>>;
  inStock: boolean;
  image?: string | null;
}

export interface ComboOptionChoice {
  value: string;
  inStock: boolean;
}

export interface ComboVariantOptions {
  /** False means the caller must fall back to the single variant dropdown. */
  splittable: boolean;
  groups: ComboOptionGroup[];
  entries: ComboVariantEntry[];
}

const notSplittable = (): ComboVariantOptions => ({
  splittable: false,
  groups: [],
  entries: [],
});

/** Size is tested first so a name carrying both words isn't read as a colour. */
export function classifyAttributeName(name: string): ComboOptionKey | null {
  const normalized = (name || '').toLowerCase().trim();
  if (!normalized) return null;
  if (SIZE_PATTERNS.some((pattern) => normalized.includes(pattern)))
    return 'size';
  if (COLOR_PATTERNS.some((pattern) => normalized.includes(pattern)))
    return 'color';
  return null;
}

/** Distinct values per picker, keeping the first spelling of each. */
function collectGroups(variants: ComboVariantInput[]): ComboOptionGroup[] {
  const drafts = new Map<
    ComboOptionKey,
    { label: string; values: string[]; seen: Set<string> }
  >();

  for (const variant of variants) {
    for (const attribute of variant.attributes ?? []) {
      const key = classifyAttributeName(attribute.name);
      const value = (attribute.value || '').trim();
      if (!key || !value) continue;

      let draft = drafts.get(key);
      if (!draft) {
        draft = { label: attribute.name.trim(), values: [], seen: new Set() };
        drafts.set(key, draft);
      }
      const dedupeKey = value.toLowerCase();
      if (draft.seen.has(dedupeKey)) continue;
      draft.seen.add(dedupeKey);
      draft.values.push(value);
    }
  }

  return OPTION_KEYS.filter((key) => drafts.get(key)?.values.length).map(
    (key) => ({
      key,
      label: drafts.get(key)!.label,
      values: drafts.get(key)!.values,
    })
  );
}

function stripProductCode(
  variantCode: string,
  productCode: string | null | undefined
): string | null {
  const code = variantCode.trim();
  const parent = (productCode || '').trim();
  if (!code || !parent) return null;
  if (!code.toLowerCase().startsWith(parent.toLowerCase())) return null;
  return code.slice(parent.length).replace(/^[-_]/, '');
}

/** Consume `value` off either end of `rest`, or null when it isn't there. */
function consumeValue(rest: string, value: string): string | null {
  const haystack = rest.toLowerCase();
  const needle = value.toLowerCase();
  if (haystack === needle) return '';
  if (haystack.startsWith(`${needle}-`) || haystack.startsWith(`${needle}_`))
    return rest.slice(value.length + 1);
  if (haystack.endsWith(`-${needle}`) || haystack.endsWith(`_${needle}`))
    return rest.slice(0, rest.length - value.length - 1);
  return null;
}

/** Every picker must match and the code must be consumed entirely. */
function resolveFromCode(
  variant: ComboVariantInput,
  groups: ComboOptionGroup[],
  productCode: string | null | undefined
): Partial<Record<ComboOptionKey, string>> | null {
  let rest = stripProductCode(variant.code || '', productCode);
  if (!rest) return null;

  const values: Partial<Record<ComboOptionKey, string>> = {};
  for (const group of groups) {
    // Longest first so "Nâu be" wins over "Nâu" when both are known values.
    const candidates = [...group.values].sort((a, b) => b.length - a.length);
    let matched = false;
    for (const value of candidates) {
      const next = consumeValue(rest, value);
      if (next === null) continue;
      values[group.key] = value;
      rest = next;
      matched = true;
      break;
    }
    if (!matched) return null;
  }

  return rest.trim() === '' ? values : null;
}

function resolveFromAttributes(
  variant: ComboVariantInput,
  groups: ComboOptionGroup[]
): Partial<Record<ComboOptionKey, string>> | null {
  const values: Partial<Record<ComboOptionKey, string>> = {};

  for (const group of groups) {
    const attribute = (variant.attributes ?? []).find(
      (candidate) =>
        classifyAttributeName(candidate.name) === group.key &&
        (candidate.value || '').trim()
    );
    if (!attribute) return null;

    const raw = attribute.value.trim();
    values[group.key] =
      group.values.find((value) => value.toLowerCase() === raw.toLowerCase()) ??
      raw;
  }

  return values;
}

function selectionKey(
  groups: ComboOptionGroup[],
  values: Partial<Record<ComboOptionKey, string>>
): string {
  return groups
    .map((group) => `${group.key}=${(values[group.key] ?? '').toLowerCase()}`)
    .join(';');
}

/**
 * Build the colour/size pickers for the variants of one parent product.
 *
 * @param productCode - Parent product code, the prefix of every variant code
 */
export function buildComboVariantOptions(
  variants: ComboVariantInput[],
  productCode?: string | null
): ComboVariantOptions {
  if (!variants?.length) return notSplittable();

  const groups = collectGroups(variants);
  if (!groups.length) return notSplittable();

  const entries: ComboVariantEntry[] = [];
  const taken = new Set<string>();

  for (const variant of variants) {
    const values =
      resolveFromCode(variant, groups, productCode) ??
      resolveFromAttributes(variant, groups);
    // Unreadable: the variant would silently vanish from the pickers.
    if (!values) return notSplittable();

    const key = selectionKey(groups, values);
    // Ambiguous: picking this pair would ship an arbitrary one of two SKUs.
    if (taken.has(key)) return notSplittable();
    taken.add(key);

    entries.push({
      variantId: variant.id,
      values,
      inStock: variant.available == null || variant.available > 0,
      image: variant.image,
    });
  }

  return { splittable: true, groups, entries };
}

function matches(
  entry: ComboVariantEntry,
  selection: Partial<Record<ComboOptionKey, string>>,
  keys: ComboOptionKey[]
): boolean {
  return keys.every((key) => {
    const wanted = selection[key];
    if (!wanted) return true;
    return entry.values[key]?.toLowerCase() === wanted.toLowerCase();
  });
}

/** Resolve a complete selection to its variant id. */
export function findVariantIdBySelection(
  options: ComboVariantOptions,
  selection: Partial<Record<ComboOptionKey, string>>
): string | undefined {
  const keys = options.groups.map((group) => group.key);
  if (keys.some((key) => !selection[key])) return undefined;
  return options.entries.find((entry) => matches(entry, selection, keys))
    ?.variantId;
}

/** The option pair a variant id stands for, for seeding the pickers. */
export function getSelectionForVariantId(
  options: ComboVariantOptions,
  variantId: string | undefined
): Partial<Record<ComboOptionKey, string>> {
  if (!variantId) return {};
  return (
    options.entries.find((entry) => entry.variantId === variantId)?.values ?? {}
  );
}

/**
 * Values of `key` that lead to a real variant given the other pickers. A pair
 * that doesn't exist is left out; one that is sold out comes back with
 * `inStock: false` so the caller can strike it through.
 */
export function getSelectableOptions(
  options: ComboVariantOptions,
  key: ComboOptionKey,
  selection: Partial<Record<ComboOptionKey, string>>
): ComboOptionChoice[] {
  const otherKeys = options.groups
    .map((group) => group.key)
    .filter((groupKey) => groupKey !== key);

  const reachable = new Map<string, boolean>();
  for (const entry of options.entries) {
    if (!matches(entry, selection, otherKeys)) continue;
    const value = entry.values[key]?.toLowerCase();
    if (!value) continue;
    reachable.set(value, (reachable.get(value) ?? false) || entry.inStock);
  }

  const group = options.groups.find((candidate) => candidate.key === key);
  return (group?.values ?? [])
    .filter((value) => reachable.has(value.toLowerCase()))
    .map((value) => ({
      value,
      inStock: reachable.get(value.toLowerCase()) ?? false,
    }));
}

/**
 * Photo to show for the selected variant, chosen per colour rather than per
 * variant so that changing size never changes the picture.
 *
 * Many SKUs reuse the parent shot, so a colour's own photo is preferred over
 * one that merely repeats `productImage`.
 */
export function findColorImage(
  options: ComboVariantOptions,
  variantId: string | undefined,
  productImage?: string | null
): string | null | undefined {
  const entry = options.entries.find((item) => item.variantId === variantId);
  if (!entry) return productImage;

  const color = entry.values.color;
  const sameColor = color
    ? options.entries.filter(
        (item) => item.values.color?.toLowerCase() === color.toLowerCase()
      )
    : [entry];

  const withImage = sameColor.filter((item) => item.image?.trim());
  const ownPhoto = withImage.find(
    (item) => item.image?.trim() !== productImage?.trim()
  );

  return ownPhoto?.image ?? withImage[0]?.image ?? productImage;
}

/** Stock of one SKU. Undefined means unknown, which counts as in stock. */
export interface ComboStockItem {
  id: string;
  available?: number | null;
}

export function hasStock(available: number | null | undefined): boolean {
  return available == null || available > 0;
}

/**
 * Whether a combo slot can be bought: a slot with variants needs at least one
 * of them in stock, a slot without one is the SKU itself so its own stock
 * decides, and a parent left with no pickable variant has nothing to sell.
 */
export function isComboItemSellable(
  item:
    | {
        isParentProduct?: boolean;
        variants?: Array<{ available?: number | null }>;
        available?: number | null;
      }
    | undefined
): boolean {
  if (!item) return false;
  if (item.variants?.length)
    return item.variants.some((variant) => hasStock(variant.available));
  if (item.isParentProduct) return false;
  return hasStock(item.available);
}

/**
 * Reads the variant list rather than the built options, so it holds for
 * products that fall back to the plain dropdown too - those have no options.
 */
export function isVariantInStock(
  variants: ComboStockItem[] | undefined,
  variantId: string | undefined
): boolean {
  if (!variantId) return false;
  const variant = variants?.find((candidate) => candidate.id === variantId);
  return variant ? hasStock(variant.available) : false;
}

/** First sellable variant, used to move off a sold-out default. */
export function findFirstInStockVariantId(
  variants: ComboStockItem[] | undefined
): string | undefined {
  return variants?.find((variant) => hasStock(variant.available))?.id;
}

/**
 * Pick the variant for a newly chosen value. Keeps the other picker where it
 * can, and prefers a variant in stock over one that is sold out.
 */
export function resolveVariantIdForValue(
  options: ComboVariantOptions,
  key: ComboOptionKey,
  value: string,
  current: Partial<Record<ComboOptionKey, string>>
): string | undefined {
  const keys = options.groups.map((group) => group.key);
  const withValue = options.entries.filter((entry) =>
    matches(entry, { [key]: value }, keys)
  );

  const exactId = findVariantIdBySelection(options, { ...current, [key]: value });
  const exact = withValue.find((entry) => entry.variantId === exactId);
  if (exact?.inStock) return exact.variantId;

  const inStock = withValue.find((entry) => entry.inStock);
  return (inStock ?? exact ?? withValue[0])?.variantId;
}
