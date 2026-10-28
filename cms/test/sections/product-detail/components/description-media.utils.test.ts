import { describe, expect, it } from 'vitest';
import { moveDescriptionImage } from 'src/sections/product-detail/components/description-media.utils';

describe('moveDescriptionImage', () => {
  it('moves one image and preserves the remaining order', () => {
    expect(moveDescriptionImage(['first.webp', 'second.webp', 'third.webp'], 0, 2)).toEqual([
      'second.webp',
      'third.webp',
      'first.webp',
    ]);
  });

  it('returns the original order for invalid or equal indexes', () => {
    const images = ['first.webp', 'second.webp'];
    expect(moveDescriptionImage(images, 0, 0)).toEqual(images);
    expect(moveDescriptionImage(images, -1, 1)).toEqual(images);
    expect(moveDescriptionImage(images, 0, 4)).toEqual(images);
  });
});
