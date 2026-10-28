import { describe, it, expect } from 'vitest';
import {
  buildComboVariantOptions,
  classifyAttributeName,
  findVariantIdBySelection,
  findColorImage,
  findFirstInStockVariantId,
  getSelectableOptions,
  isComboItemSellable,
  isVariantInStock,
  getSelectionForVariantId,
  resolveVariantIdForValue,
  type ComboVariantInput,
} from '@/lib/helpers/comboVariantHelper';

const COLOR = 'Màu sắc & hoạ tiết';
const SIZE = 'Kích Thước';

/** Minimal variant stub - only the fields the option builder reads */
const variant = (
  code: string,
  attributes: Array<[string, string]>,
  id = code
): ComboVariantInput => ({
  id,
  name: code,
  code,
  attributes: attributes.map(([name, value]) => ({ name, value })),
});

/** A clean two-colour, two-size product */
const cleanVariants = (): ComboVariantInput[] => [
  variant('AH023-Đỏ-S', [
    [COLOR, 'Đỏ'],
    [SIZE, 'S'],
  ]),
  variant('AH023-Đỏ-M', [
    [COLOR, 'Đỏ'],
    [SIZE, 'M'],
  ]),
  variant('AH023-Xanh-S', [
    [COLOR, 'Xanh'],
    [SIZE, 'S'],
  ]),
];

describe('classifyAttributeName', () => {
  it('should map every colour attribute name seen in production', () => {
    expect(classifyAttributeName('Màu sắc & hoạ tiết')).toBe('color');
    expect(classifyAttributeName('Màu Sắc')).toBe('color');
    expect(classifyAttributeName('color')).toBe('color');
  });

  it('should map every size attribute name seen in production', () => {
    expect(classifyAttributeName('Kích Thước')).toBe('size');
    expect(classifyAttributeName('Kích cỡ')).toBe('size');
    expect(classifyAttributeName('Size')).toBe('size');
  });

  it('should ignore attributes that are neither colour nor size', () => {
    expect(classifyAttributeName('Chất liệu')).toBeNull();
    expect(classifyAttributeName('')).toBeNull();
  });
});

describe('buildComboVariantOptions', () => {
  it('should split clean data into a colour picker then a size picker', () => {
    const options = buildComboVariantOptions(cleanVariants(), 'AH023');

    expect(options.splittable).toBe(true);
    expect(options.groups.map((g) => g.key)).toEqual(['color', 'size']);
    expect(options.groups[0].values).toEqual(['Đỏ', 'Xanh']);
    expect(options.groups[1].values).toEqual(['S', 'M']);
  });

  it('should label each picker with the attribute name from the data', () => {
    const options = buildComboVariantOptions(cleanVariants(), 'AH023');
    expect(options.groups[0].label).toBe(COLOR);
    expect(options.groups[1].label).toBe(SIZE);
  });

  it('should trust the SKU code over a wrong size attribute', () => {
    // Production case 15ANV2018PT: the "-Be-S" SKU is tagged size M, which
    // would both hide Be+S and make Be+M resolve to an arbitrary SKU.
    const options = buildComboVariantOptions(
      [
        variant('AO-Be-S', [
          [COLOR, 'Be'],
          [SIZE, 'M'],
        ]),
        variant('AO-Be-M', [
          [COLOR, 'Be'],
          [SIZE, 'M'],
        ]),
        variant('AO-Hồng-S', [
          [COLOR, 'Hồng'],
          [SIZE, 'S'],
        ]),
      ],
      'AO'
    );

    expect(options.splittable).toBe(true);
    expect(findVariantIdBySelection(options, { color: 'Be', size: 'S' })).toBe(
      'AO-Be-S'
    );
    expect(findVariantIdBySelection(options, { color: 'Be', size: 'M' })).toBe(
      'AO-Be-M'
    );
  });

  it('should fall back when two variants land on the same option pair', () => {
    // Production case 24TDC5006OT: two patterns, neither carrying a colour
    // attribute, so both collapse onto "size = S".
    const options = buildComboVariantOptions(
      [
        variant('AO-chữ EM-S', [[SIZE, 'S']]),
        variant('AO-HT vằn-S', [[SIZE, 'S']]),
      ],
      'AO'
    );

    expect(options.splittable).toBe(false);
  });

  it('should fall back when a variant carries no readable option', () => {
    // Production case 16FDV5144ST: colour "Bơ" is missing from every attribute,
    // so it exists only in the SKU code and cannot be offered safely.
    const options = buildComboVariantOptions(
      [
        variant('AO-Bơ-S', [[SIZE, 'S']]),
        variant('AO-Rêu-S', [
          [COLOR, 'Rêu'],
          [SIZE, 'S'],
        ]),
      ],
      'AO'
    );

    expect(options.splittable).toBe(false);
  });

  it('should fall back when the same SKU code appears twice', () => {
    const attrs: Array<[string, string]> = [
      [COLOR, 'Be'],
      [SIZE, 'XXL'],
    ];
    const options = buildComboVariantOptions(
      [variant('AO-Be-XXL', attrs, 'a'), variant('AO-Be-XXL', attrs, 'b')],
      'AO'
    );

    expect(options.splittable).toBe(false);
  });

  it('should render a single picker when the product only varies by size', () => {
    const options = buildComboVariantOptions(
      [variant('AO-S', [[SIZE, 'S']]), variant('AO-M', [[SIZE, 'M']])],
      'AO'
    );

    expect(options.splittable).toBe(true);
    expect(options.groups.map((g) => g.key)).toEqual(['size']);
  });

  it('should treat values differing only in case as one option', () => {
    // Production case 25FDV2012ST: "Nâu be" and "Nâu Be" are the same colour.
    const options = buildComboVariantOptions(
      [
        variant('AO-Nâu be-S', [
          [COLOR, 'Nâu be'],
          [SIZE, 'S'],
        ]),
        variant('AO-Nâu be-M', [
          [COLOR, 'Nâu Be'],
          [SIZE, 'M'],
        ]),
      ],
      'AO'
    );

    expect(options.groups[0].values).toEqual(['Nâu be']);
  });

  it('should not split a product with no colour or size attributes', () => {
    const options = buildComboVariantOptions(
      [variant('AO-1', [['Chất liệu', 'Cotton']])],
      'AO'
    );

    expect(options.splittable).toBe(false);
  });

  it('should not split an empty variant list', () => {
    expect(buildComboVariantOptions([], 'AO').splittable).toBe(false);
  });

  it('should still resolve when the SKU code lacks the product prefix', () => {
    const options = buildComboVariantOptions(
      [
        variant('X1', [
          [COLOR, 'Đỏ'],
          [SIZE, 'S'],
        ]),
        variant('X2', [
          [COLOR, 'Đỏ'],
          [SIZE, 'M'],
        ]),
      ],
      'AO'
    );

    expect(options.splittable).toBe(true);
    expect(findVariantIdBySelection(options, { color: 'Đỏ', size: 'M' })).toBe(
      'X2'
    );
  });
});

describe('getSelectableOptions', () => {
  it('should offer only the sizes the chosen colour is made in', () => {
    const options = buildComboVariantOptions(cleanVariants(), 'AH023');

    expect(
      getSelectableOptions(options, 'size', { color: 'Đỏ' }).map((c) => c.value)
    ).toEqual(['S', 'M']);
    expect(
      getSelectableOptions(options, 'size', { color: 'Xanh' }).map(
        (c) => c.value
      )
    ).toEqual(['S']);
  });

  it('should offer every colour when nothing narrows it', () => {
    const options = buildComboVariantOptions(cleanVariants(), 'AH023');
    expect(getSelectableOptions(options, 'color', {}).map((c) => c.value)).toEqual(
      ['Đỏ', 'Xanh']
    );
  });

  it('should treat a variant with unknown stock as in stock', () => {
    const options = buildComboVariantOptions(cleanVariants(), 'AH023');
    expect(
      getSelectableOptions(options, 'color', {}).every((c) => c.inStock)
    ).toBe(true);
  });
});

describe('getSelectionForVariantId', () => {
  it('should round-trip a variant id back to its option pair', () => {
    const options = buildComboVariantOptions(cleanVariants(), 'AH023');
    const selection = getSelectionForVariantId(options, 'AH023-Đỏ-M');

    expect(selection).toEqual({ color: 'Đỏ', size: 'M' });
    expect(findVariantIdBySelection(options, selection)).toBe('AH023-Đỏ-M');
  });

  it('should return nothing for an unknown or missing id', () => {
    const options = buildComboVariantOptions(cleanVariants(), 'AH023');
    expect(getSelectionForVariantId(options, undefined)).toEqual({});
    expect(getSelectionForVariantId(options, 'nope')).toEqual({});
  });
});

describe('findVariantIdBySelection', () => {
  it('should refuse a partial selection', () => {
    const options = buildComboVariantOptions(cleanVariants(), 'AH023');
    expect(findVariantIdBySelection(options, { color: 'Đỏ' })).toBeUndefined();
  });

  it('should return nothing for a pair that does not exist', () => {
    const options = buildComboVariantOptions(cleanVariants(), 'AH023');
    expect(
      findVariantIdBySelection(options, { color: 'Xanh', size: 'M' })
    ).toBeUndefined();
  });
});

describe('resolveVariantIdForValue', () => {
  it('should keep the current size when the new colour comes in it', () => {
    const options = buildComboVariantOptions(cleanVariants(), 'AH023');

    expect(
      resolveVariantIdForValue(options, 'color', 'Xanh', {
        color: 'Đỏ',
        size: 'S',
      })
    ).toBe('AH023-Xanh-S');
  });

  it('should move to the first available pair when the size is not made', () => {
    const options = buildComboVariantOptions(cleanVariants(), 'AH023');

    expect(
      resolveVariantIdForValue(options, 'color', 'Xanh', {
        color: 'Đỏ',
        size: 'M',
      })
    ).toBe('AH023-Xanh-S');
  });

  it('should resolve from a single value when nothing is selected yet', () => {
    const options = buildComboVariantOptions(cleanVariants(), 'AH023');
    expect(resolveVariantIdForValue(options, 'color', 'Đỏ', {})).toBe(
      'AH023-Đỏ-S'
    );
  });
});

describe('stock handling', () => {
  /** Đỏ comes in S (sold out) and M (in stock); Xanh is sold out entirely. */
  const stockedVariants = (): ComboVariantInput[] => [
    { ...variant('AH023-Đỏ-S', [[COLOR, 'Đỏ'], [SIZE, 'S']]), available: 0 },
    { ...variant('AH023-Đỏ-M', [[COLOR, 'Đỏ'], [SIZE, 'M']]), available: 4 },
    { ...variant('AH023-Xanh-S', [[COLOR, 'Xanh'], [SIZE, 'S']]), available: 0 },
  ];

  it('should still list a sold-out size but flag it', () => {
    const options = buildComboVariantOptions(stockedVariants(), 'AH023');

    expect(getSelectableOptions(options, 'size', { color: 'Đỏ' })).toEqual([
      { value: 'S', inStock: false },
      { value: 'M', inStock: true },
    ]);
  });

  it('should flag a colour whose every size is sold out', () => {
    const options = buildComboVariantOptions(stockedVariants(), 'AH023');

    expect(getSelectableOptions(options, 'color', {})).toEqual([
      { value: 'Đỏ', inStock: true },
      { value: 'Xanh', inStock: false },
    ]);
  });

  it('should prefer an in-stock variant when switching colour', () => {
    const options = buildComboVariantOptions(stockedVariants(), 'AH023');

    // Xanh + S exists but is sold out, so nothing better is available.
    expect(
      resolveVariantIdForValue(options, 'color', 'Xanh', {
        color: 'Đỏ',
        size: 'M',
      })
    ).toBe('AH023-Xanh-S');

    // Đỏ + S is sold out, so land on Đỏ + M instead of keeping S.
    expect(
      resolveVariantIdForValue(options, 'color', 'Đỏ', {
        color: 'Xanh',
        size: 'S',
      })
    ).toBe('AH023-Đỏ-M');
  });

  it('should report stock per variant id', () => {
    const variants = stockedVariants();

    expect(isVariantInStock(variants, 'AH023-Đỏ-M')).toBe(true);
    expect(isVariantInStock(variants, 'AH023-Đỏ-S')).toBe(false);
    expect(isVariantInStock(variants, undefined)).toBe(false);
    expect(isVariantInStock(variants, 'nope')).toBe(false);
  });

  it('should treat unknown stock as in stock', () => {
    expect(isVariantInStock([{ id: 'a' }], 'a')).toBe(true);
  });

  it('should find the first sellable variant to correct a sold-out default', () => {
    expect(findFirstInStockVariantId(stockedVariants())).toBe('AH023-Đỏ-M');
  });

  it('should return nothing sellable when everything is sold out', () => {
    const soldOut = [
      { ...variant('AH023-Đỏ-S', [[COLOR, 'Đỏ'], [SIZE, 'S']]), available: 0 },
      { ...variant('AH023-Đỏ-M', [[COLOR, 'Đỏ'], [SIZE, 'M']]), available: 0 },
    ];

    expect(findFirstInStockVariantId(soldOut)).toBeUndefined();
    expect(findFirstInStockVariantId([])).toBeUndefined();
    expect(findFirstInStockVariantId(undefined)).toBeUndefined();
  });
});

describe('isComboItemSellable', () => {
  it('should sell a slot whose variants are not all gone', () => {
    expect(
      isComboItemSellable({
        variants: [{ available: 0 }, { available: 2 }],
        available: 0,
      })
    ).toBe(true);
  });

  it('should refuse a slot whose every variant is sold out', () => {
    // The pickers strike them all out, but nothing stopped the add before.
    expect(
      isComboItemSellable({
        variants: [{ available: 0 }, { available: 0 }],
        available: 99,
      })
    ).toBe(false);
  });

  it('should reject a parent left with no pickable variant', () => {
    // Production case 25TNC2014OB: 35 variants, none of them ACTIVE.
    expect(
      isComboItemSellable({ isParentProduct: true, variants: [], available: 9 })
    ).toBe(false);
  });

  it('should reject a variantless product with no stock', () => {
    // Production case 24ADL2010ST: no variants, inventory 0. The product detail
    // page disables its buy button, so the combo must block it too.
    expect(isComboItemSellable({ variants: [], available: 0 })).toBe(false);
    expect(isComboItemSellable({ available: -20 })).toBe(false);
  });

  it('should accept a variantless product that has stock', () => {
    expect(isComboItemSellable({ available: 3 })).toBe(true);
  });

  it('should accept unknown stock rather than block everything', () => {
    expect(isComboItemSellable({})).toBe(true);
  });

  it('should reject a missing slot', () => {
    expect(isComboItemSellable(undefined)).toBe(false);
  });
});

describe('findColorImage', () => {
  const PARENT = 'josie.jpg';

  /** Mirrors production 15FDL8007ST: only the M SKU carries a real pink photo. */
  const withImages = (): ComboVariantInput[] => [
    { ...variant('AH023-Hồng-S', [[COLOR, 'Hồng'], [SIZE, 'S']]), image: PARENT },
    { ...variant('AH023-Hồng-M', [[COLOR, 'Hồng'], [SIZE, 'M']]), image: 'hong-M.jpg' },
    { ...variant('AH023-Hồng-L', [[COLOR, 'Hồng'], [SIZE, 'L']]), image: PARENT },
    { ...variant('AH023-Trắng-S', [[COLOR, 'Trắng'], [SIZE, 'S']]), image: 'trang-S.jpg' },
  ];

  it("should show the colour's own photo whatever size is picked", () => {
    const options = buildComboVariantOptions(withImages(), 'AH023');

    for (const id of ['AH023-Hồng-S', 'AH023-Hồng-M', 'AH023-Hồng-L']) {
      expect(findColorImage(options, id, PARENT)).toBe('hong-M.jpg');
    }
  });

  it('should follow the selected colour', () => {
    const options = buildComboVariantOptions(withImages(), 'AH023');
    expect(findColorImage(options, 'AH023-Trắng-S', PARENT)).toBe('trang-S.jpg');
  });

  it('should keep the parent photo when a colour has nothing else', () => {
    const options = buildComboVariantOptions(
      [
        { ...variant('AH023-Đen-S', [[COLOR, 'Đen'], [SIZE, 'S']]), image: PARENT },
        { ...variant('AH023-Đen-M', [[COLOR, 'Đen'], [SIZE, 'M']]), image: PARENT },
      ],
      'AH023'
    );

    expect(findColorImage(options, 'AH023-Đen-S', PARENT)).toBe(PARENT);
  });

  it('should fall back to the parent photo for an unknown variant', () => {
    const options = buildComboVariantOptions(withImages(), 'AH023');
    expect(findColorImage(options, 'nope', PARENT)).toBe(PARENT);
    expect(findColorImage(options, undefined, PARENT)).toBe(PARENT);
  });

  it('should use the variant photo when the product only varies by size', () => {
    const options = buildComboVariantOptions(
      [
        { ...variant('AH023-S', [[SIZE, 'S']]), image: 's.jpg' },
        { ...variant('AH023-M', [[SIZE, 'M']]), image: 'm.jpg' },
      ],
      'AH023'
    );

    expect(findColorImage(options, 'AH023-M', PARENT)).toBe('m.jpg');
  });

  it('should ignore variants with a blank photo', () => {
    const options = buildComboVariantOptions(
      [
        { ...variant('AH023-Hồng-S', [[COLOR, 'Hồng'], [SIZE, 'S']]), image: '  ' },
        { ...variant('AH023-Hồng-M', [[COLOR, 'Hồng'], [SIZE, 'M']]), image: 'hong-M.jpg' },
      ],
      'AH023'
    );

    expect(findColorImage(options, 'AH023-Hồng-S', PARENT)).toBe('hong-M.jpg');
  });
});
