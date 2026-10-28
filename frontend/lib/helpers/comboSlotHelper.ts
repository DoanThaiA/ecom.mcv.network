/**
 * Decides which product may fill a slot of a merged combo.
 *
 * Combos with the same item count are merged into one card, so a slot can offer
 * several products - but only those that keep the whole card equal to a real
 * combo. The rule is one condition, applied identically everywhere:
 *
 *   a product fits a slot when some original combo contains the main product,
 *   every other slot's product, and that product.
 *
 * Checking only "not already used in another slot" is what let a customer mix
 * products from two different combos, which then priced against the wrong combo
 * and failed on add to cart.
 */

export interface ComboSlotItem {
  productId: string;
}

export interface ComboSlotCombo {
  items: Array<{ productId: string }>;
}

function productIdsOf(combo: ComboSlotCombo): Set<string> {
  return new Set(combo.items.map((item) => item.productId));
}

function sharedCount(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const id of a) if (b.has(id)) count++;
  return count;
}

/**
 * Split combos into the families that may share one card.
 *
 * A card lets the customer swap one slot, so merging only makes sense for
 * combos that differ in exactly one product. Merging combos that differ in two
 * would strand all but the first: reaching the others needs two slots to change
 * at once, which the card cannot express. Those get a card each instead.
 *
 * Families are built greedily, which is safe here: a combo that fits the shared
 * core of a family differs by one product from every member of it.
 */
export function groupComboFamilies<T extends ComboSlotCombo>(
  combos: T[]
): T[][] {
  const families: Array<{ core: Set<string>; size: number; members: T[] }> = [];

  for (const combo of combos) {
    const ids = productIdsOf(combo);
    const family = families.find(
      (candidate) =>
        candidate.size === combo.items.length &&
        sharedCount(candidate.core, ids) === ids.size - 1
    );

    if (!family) {
      families.push({ core: ids, size: combo.items.length, members: [combo] });
      continue;
    }

    family.members.push(combo);
    family.core = new Set([...family.core].filter((id) => ids.has(id)));
  }

  return families.map((family) => family.members);
}

/** Products selected in every slot except `position`, in no particular order. */
function otherSelections(
  selectedItems: Record<number, string>,
  position: number
): string[] {
  return Object.entries(selectedItems)
    .filter(([slot, productId]) => Number(slot) !== position && Boolean(productId))
    .map(([, productId]) => productId);
}

function comboCovers(combo: ComboSlotCombo, productIds: string[]): boolean {
  const ids = combo.items.map((item) => item.productId);
  return productIds.every((productId) => ids.includes(productId));
}

/**
 * Products that may fill `position` given what the other slots hold.
 *
 * @param items - Candidate products, the merged combo minus the main product
 * @param position - 1-based slot index; slot 0 is the main product
 * @param originalCombos - The combos merged into this card; without them there
 *   is nothing to validate against and only duplicates are excluded
 */
export function getAvailableComboItems<T extends ComboSlotItem>(
  items: T[],
  selectedItems: Record<number, string>,
  position: number,
  mainProductId: string,
  originalCombos?: ComboSlotCombo[]
): T[] {
  const taken = otherSelections(selectedItems, position);
  // One product can't fill two slots at once.
  const candidates = items.filter((item) => !taken.includes(item.productId));

  if (!originalCombos?.length) return candidates;

  const required = [mainProductId, ...taken];
  return candidates.filter((item) =>
    originalCombos.some((combo) =>
      comboCovers(combo, [...required, item.productId])
    )
  );
}

/**
 * Drop the selections that the latest choice made impossible.
 *
 * Dropping slot by slot would depend on the order they are visited: a slot can
 * look invalid only because of another slot that is itself about to go, and it
 * would be discarded for nothing. So instead pick the combo that keeps the most
 * of the current selections, and drop only what falls outside it.
 *
 * `keepPosition` is the slot the customer just set; it always survives, and it
 * is what breaks ties between equally good combos.
 */
export function pruneInvalidSelections(
  selectedItems: Record<number, string>,
  mainProductId: string,
  originalCombos: ComboSlotCombo[] | undefined,
  keepPosition: number
): Record<number, string> {
  if (!originalCombos?.length) return { ...selectedItems };

  const slots = Object.entries(selectedItems)
    .filter(([, productId]) => Boolean(productId))
    .map(([slot, productId]) => ({ slot: Number(slot), productId }))
    .sort((a, b) => a.slot - b.slot);

  const kept = selectedItems[keepPosition];
  const viable = originalCombos.filter(
    (combo) =>
      comboCovers(combo, [mainProductId]) &&
      (!kept || comboCovers(combo, [kept]))
  );

  // Nothing can satisfy the new choice, so only it can be trusted.
  if (!viable.length) return kept ? { [keepPosition]: kept } : {};

  const best = viable.reduce((winner, combo) =>
    survivorCount(combo, slots) > survivorCount(winner, slots) ? combo : winner
  );
  const bestIds = best.items.map((item) => item.productId);

  const result: Record<number, string> = {};
  const used = new Set<string>();
  // The chosen slot is settled first so it never loses its product to another.
  for (const { slot, productId } of [
    ...slots.filter((entry) => entry.slot === keepPosition),
    ...slots.filter((entry) => entry.slot !== keepPosition),
  ]) {
    if (slot !== keepPosition && !bestIds.includes(productId)) continue;
    if (used.has(productId)) continue;
    used.add(productId);
    result[slot] = productId;
  }

  return result;
}

/** How many of the current selections this combo would let us keep. */
function survivorCount(
  combo: ComboSlotCombo,
  slots: Array<{ productId: string }>
): number {
  const ids = combo.items.map((item) => item.productId);
  return slots.filter((entry) => ids.includes(entry.productId)).length;
}
