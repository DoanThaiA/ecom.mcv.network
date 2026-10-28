import { describe, it, expect } from 'vitest';
import {
  getAvailableComboItems,
  groupComboFamilies,
  pruneInvalidSelections,
  type ComboSlotCombo,
} from '@/lib/helpers/comboSlotHelper';

const MAIN = 'josie';
const BOOM = 'boom';
const HOA = 'hoa-trai';
const BAU = 'bau-ly';
const THUN = 'ao-thun';

const item = (productId: string) => ({ productId });

/**
 * The real shape that exposed the bug: two combos of four products sharing
 * three of them, so only the last slot has a genuine choice.
 */
const COMBOS: ComboSlotCombo[] = [
  { items: [MAIN, BOOM, HOA, BAU].map(item) },
  { items: [MAIN, BOOM, HOA, THUN].map(item) },
];

/** Merged pool the card offers, main product excluded. */
const POOL = [BOOM, HOA, BAU, THUN].map(item);

/** Slots auto-filled from the first combo. */
const FILLED = { 1: BOOM, 2: HOA, 3: BAU };

const ids = (items: Array<{ productId: string }>) =>
  items.map((entry) => entry.productId);

describe('getAvailableComboItems', () => {
  it('should offer only the slot that the combos actually differ in', () => {
    expect(ids(getAvailableComboItems(POOL, FILLED, 1, MAIN, COMBOS))).toEqual([
      BOOM,
    ]);
    expect(ids(getAvailableComboItems(POOL, FILLED, 2, MAIN, COMBOS))).toEqual([
      HOA,
    ]);
    expect(ids(getAvailableComboItems(POOL, FILLED, 3, MAIN, COMBOS))).toEqual([
      BAU,
      THUN,
    ]);
  });

  it('should not depend on the order the slots are examined in', () => {
    const swapped = { 3: BAU, 1: BOOM, 2: HOA };

    expect(ids(getAvailableComboItems(POOL, swapped, 1, MAIN, COMBOS))).toEqual(
      ids(getAvailableComboItems(POOL, FILLED, 1, MAIN, COMBOS))
    );
  });

  it('should widen a slot once a conflicting slot is emptied', () => {
    // With slot 3 free, both remaining products are reachable again.
    const partial = { 1: BOOM, 2: HOA };

    expect(
      ids(getAvailableComboItems(POOL, partial, 3, MAIN, COMBOS))
    ).toEqual([BAU, THUN]);
  });

  it('should follow the other slots after the differing one changes', () => {
    const onThun = { 1: BOOM, 2: HOA, 3: THUN };

    expect(ids(getAvailableComboItems(POOL, onThun, 1, MAIN, COMBOS))).toEqual([
      BOOM,
    ]);
  });

  it('should never offer a product already filling another slot', () => {
    const pool = [BOOM, HOA].map(item);
    const combos: ComboSlotCombo[] = [{ items: [MAIN, BOOM, HOA].map(item) }];

    expect(
      ids(getAvailableComboItems(pool, { 1: BOOM }, 2, MAIN, combos))
    ).toEqual([HOA]);
  });

  it('should offer every unused product when there is nothing to validate against', () => {
    expect(ids(getAvailableComboItems(POOL, { 1: BOOM }, 2, MAIN))).toEqual([
      HOA,
      BAU,
      THUN,
    ]);
  });

  it('should offer everything for an empty card', () => {
    expect(ids(getAvailableComboItems(POOL, {}, 1, MAIN, COMBOS))).toEqual([
      BOOM,
      HOA,
      BAU,
      THUN,
    ]);
  });

  it('should return nothing when no combo covers the other slots', () => {
    const impossible = { 1: BAU, 2: THUN };

    expect(
      ids(getAvailableComboItems(POOL, impossible, 3, MAIN, COMBOS))
    ).toEqual([]);
  });
});

describe('pruneInvalidSelections', () => {
  it('should keep a selection that is still part of a real combo', () => {
    expect(pruneInvalidSelections(FILLED, MAIN, COMBOS, 3)).toEqual(FILLED);
  });

  it('should keep the slot the customer just set', () => {
    const next = pruneInvalidSelections(
      { 1: BOOM, 2: HOA, 3: THUN },
      MAIN,
      COMBOS,
      3
    );

    expect(next[3]).toBe(THUN);
  });

  it('should drop only the slot that the new choice made impossible', () => {
    // Boom fits alongside Áo thun, Bấu ly does not. Dropping slot by slot
    // would have discarded Boom too, because Bấu ly was still in place when
    // slot 1 was examined.
    const next = pruneInvalidSelections(
      { 1: BOOM, 2: THUN, 3: BAU },
      MAIN,
      COMBOS,
      2
    );

    expect(next).toEqual({ 1: BOOM, 2: THUN });
  });

  it('should not let a product sit in two slots at once', () => {
    const next = pruneInvalidSelections(
      { 1: BAU, 2: HOA, 3: BAU },
      MAIN,
      COMBOS,
      1
    );

    expect(next).toEqual({ 1: BAU, 2: HOA });
  });

  it('should settle on one combo when the selections span two', () => {
    const next = pruneInvalidSelections(
      { 1: BAU, 2: THUN, 3: BOOM },
      MAIN,
      COMBOS,
      3
    );

    expect(next[3]).toBe(BOOM);
    // Bấu ly and Áo thun never share a combo, so only one of them can stay.
    expect(next[1] && next[2]).toBeFalsy();
  });

  it('should keep only the new choice when no combo can host it', () => {
    const orphan: ComboSlotCombo[] = [{ items: [MAIN, BOOM].map(item) }];

    expect(
      pruneInvalidSelections({ 1: BOOM, 2: THUN }, MAIN, orphan, 2)
    ).toEqual({ 2: THUN });
  });

  it('should leave selections alone when there is nothing to validate against', () => {
    const messy = { 1: BAU, 2: THUN };
    expect(pruneInvalidSelections(messy, MAIN, undefined, 1)).toEqual(messy);
  });

  it('should not mutate the selections it was given', () => {
    const original = { 1: BOOM, 2: THUN, 3: BAU };
    const copy = { ...original };

    pruneInvalidSelections(original, MAIN, COMBOS, 2);

    expect(original).toEqual(copy);
  });
});

describe('groupComboFamilies', () => {
  const combo = (...productIds: string[]): ComboSlotCombo => ({
    items: productIds.map(item),
  });

  const shape = (families: ComboSlotCombo[][]) =>
    families.map((family) =>
      family.map((entry) => entry.items.map((i) => i.productId).join('+'))
    );

  it('should merge combos that differ in exactly one product', () => {
    const a = combo(MAIN, BOOM, HOA, BAU);
    const b = combo(MAIN, BOOM, HOA, THUN);

    expect(groupComboFamilies([a, b])).toEqual([[a, b]]);
  });

  it('should keep combos that differ in two products apart', () => {
    // Merging these would strand the second: getting to it needs two slots to
    // change at once, which one card can't express.
    const a = combo(MAIN, BOOM, HOA, BAU);
    const b = combo(MAIN, BOOM, 'thun', 'kysine');

    expect(groupComboFamilies([a, b])).toEqual([[a], [b]]);
  });

  it('should keep combos of different sizes apart', () => {
    const a = combo(MAIN, BOOM, HOA);
    const b = combo(MAIN, BOOM, HOA, BAU);

    expect(groupComboFamilies([a, b])).toEqual([[a], [b]]);
  });

  it('should gather a whole family that varies in one slot', () => {
    const a = combo(MAIN, BOOM, HOA, BAU);
    const b = combo(MAIN, BOOM, HOA, THUN);
    const c = combo(MAIN, BOOM, HOA, 'kysine');

    expect(groupComboFamilies([a, b, c])).toEqual([[a, b, c]]);
  });

  it('should not pull in a combo that only matches one member', () => {
    const a = combo(MAIN, BOOM, HOA, BAU);
    const b = combo(MAIN, BOOM, HOA, THUN);
    // Shares three products with b but only two with the family core.
    const c = combo(MAIN, BOOM, THUN, 'kysine');

    expect(shape(groupComboFamilies([a, b, c]))).toEqual([
      [`${MAIN}+${BOOM}+${HOA}+${BAU}`, `${MAIN}+${BOOM}+${HOA}+${THUN}`],
      [`${MAIN}+${BOOM}+${THUN}+kysine`],
    ]);
  });

  it('should merge two-product combos that swap their only slot', () => {
    const a = combo(MAIN, BOOM);
    const b = combo(MAIN, HOA);

    expect(groupComboFamilies([a, b])).toEqual([[a, b]]);
  });

  it('should build one family per combo when none of them match', () => {
    const a = combo(MAIN, BOOM, HOA);
    const b = combo(MAIN, BAU, THUN);

    expect(groupComboFamilies([a, b])).toEqual([[a], [b]]);
  });

  it('should handle a single combo and an empty list', () => {
    const a = combo(MAIN, BOOM, HOA);

    expect(groupComboFamilies([a])).toEqual([[a]]);
    expect(groupComboFamilies([])).toEqual([]);
  });
});
