import { describe, expect, it } from 'vitest';
import {
  Product,
  ProductDescriptionMedia,
} from 'src/types/gen/shared/shared/products/product';
import { UpdateProductDetailsRequest } from 'src/types/gen/cms/cms/products/product-query';

describe('ProductDescriptionMedia protobuf contract', () => {
  const media = ProductDescriptionMedia.fromPartial({
    topImages: ['https://cdn.example.com/top.webp'],
    sliderImages: [
      'https://cdn.example.com/slide-1.webp',
      'https://cdn.example.com/slide-2.webp',
    ],
    bottomImages: [],
  });

  it('keeps all regions and slider order', () => {
    expect(media).toEqual({
      topImages: ['https://cdn.example.com/top.webp'],
      sliderImages: [
        'https://cdn.example.com/slide-1.webp',
        'https://cdn.example.com/slide-2.webp',
      ],
      bottomImages: [],
    });
  });

  it('embeds the media in Product and update request', () => {
    const product = Product.fromPartial({ descriptionMedia: media });
    const request = UpdateProductDetailsRequest.fromPartial({
      descriptionMedia: media,
    });

    expect(product.descriptionMedia).toEqual(media);
    expect(request.descriptionMedia).toEqual(media);
  });
});
