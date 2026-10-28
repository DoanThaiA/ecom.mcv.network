import { describe, it, expect } from 'vitest';
import {
  buildColorImageGroups,
  findColorAtIndex,
} from '@/lib/helpers/variantHelper';
import type { Product } from '@/types/gen/shared/shared/products/product';

const PRODUCT_CODE = 'AH023';

/** Minimal variant stub - only the fields the grouping logic reads */
const variant = (
  code: string,
  avatar?: string,
  others: string[] = []
): Product =>
  ({
    code,
    images: { avatar, others },
  }) as unknown as Product;

describe('buildColorImageGroups', () => {
  it('lays every colour out back to back with running start indexes', () => {
    const groups = buildColorImageGroups(
      ['Hồng', 'Trắng'],
      [
        variant('AH023_hồng-S', 'hong-1.jpg', ['hong-2.jpg', 'hong-3.jpg']),
        variant('AH023_trắng-S', 'trang-1.jpg', ['trang-2.jpg']),
      ],
      PRODUCT_CODE,
      undefined
    );

    expect(groups).toEqual([
      {
        color: 'Hồng',
        images: ['hong-1.jpg', 'hong-2.jpg', 'hong-3.jpg'],
        startIndex: 0,
      },
      { color: 'Trắng', images: ['trang-1.jpg', 'trang-2.jpg'], startIndex: 3 },
    ]);
  });

  it('picks the richest variant of a colour so sizes sharing a colour agree', () => {
    const groups = buildColorImageGroups(
      ['Hồng'],
      [
        variant('AH023_hồng-S', 'hong-1.jpg'),
        variant('AH023_hồng-M', 'hong-1.jpg', ['hong-2.jpg', 'hong-3.jpg']),
      ],
      PRODUCT_CODE,
      undefined
    );

    expect(groups[0].images).toEqual([
      'hong-1.jpg',
      'hong-2.jpg',
      'hong-3.jpg',
    ]);
  });

  it('keeps the avatar first and drops duplicates within a colour', () => {
    const groups = buildColorImageGroups(
      ['Hồng'],
      [variant('AH023_hồng-S', 'cover.jpg', ['cover.jpg', 'back.jpg'])],
      PRODUCT_CODE,
      undefined
    );

    expect(groups[0].images).toEqual(['cover.jpg', 'back.jpg']);
  });

  it('falls back to parent images for a colour that has none of its own', () => {
    const groups = buildColorImageGroups(
      ['Hồng', 'Trắng'],
      [variant('AH023_hồng-S', 'hong-1.jpg')],
      PRODUCT_CODE,
      { avatar: 'parent.jpg', others: [] }
    );

    expect(groups).toEqual([
      { color: 'Hồng', images: ['hong-1.jpg'], startIndex: 0 },
      { color: 'Trắng', images: ['parent.jpg'], startIndex: 1 },
    ]);
  });

  it('collapses to a single colourless group when no colour carries images', () => {
    const groups = buildColorImageGroups(
      ['Hồng', 'Trắng'],
      [variant('AH023_hồng-S'), variant('AH023_trắng-S')],
      PRODUCT_CODE,
      { avatar: 'parent-1.jpg', others: ['parent-2.jpg'] }
    );

    expect(groups).toEqual([
      { color: '', images: ['parent-1.jpg', 'parent-2.jpg'], startIndex: 0 },
    ]);
  });

  it('handles a product with no colours at all', () => {
    const groups = buildColorImageGroups([], [], PRODUCT_CODE, {
      avatar: 'only.jpg',
      others: [],
    });

    expect(groups).toEqual([
      { color: '', images: ['only.jpg'], startIndex: 0 },
    ]);
  });

  it('returns nothing when there are no images anywhere', () => {
    expect(
      buildColorImageGroups(['Hồng'], [variant('AH023_hồng-S')], PRODUCT_CODE, {
        avatar: undefined,
        others: [],
      })
    ).toEqual([]);
  });

  it('ignores blank image urls', () => {
    const groups = buildColorImageGroups(
      ['Hồng'],
      [variant('AH023_hồng-S', '  ', ['  ', 'real.jpg'])],
      PRODUCT_CODE,
      undefined
    );

    expect(groups[0].images).toEqual(['real.jpg']);
  });
});

describe('findColorAtIndex', () => {
  const groups = buildColorImageGroups(
    ['Hồng', 'Trắng'],
    [
      variant('AH023_hồng-S', 'hong-1.jpg', ['hong-2.jpg']),
      variant('AH023_trắng-S', 'trang-1.jpg'),
    ],
    PRODUCT_CODE,
    undefined
  );

  it('resolves the first image of a colour', () => {
    expect(findColorAtIndex(groups, 0)).toBe('Hồng');
    expect(findColorAtIndex(groups, 2)).toBe('Trắng');
  });

  it('resolves the last image of a colour', () => {
    expect(findColorAtIndex(groups, 1)).toBe('Hồng');
  });

  it('returns null past the end of the gallery', () => {
    expect(findColorAtIndex(groups, 3)).toBeNull();
    expect(findColorAtIndex(groups, -1)).toBeNull();
  });

  it('returns null for the colourless parent fallback group', () => {
    const fallback = buildColorImageGroups([], [], PRODUCT_CODE, {
      avatar: 'only.jpg',
      others: [],
    });

    expect(findColorAtIndex(fallback, 0)).toBeNull();
  });
});
