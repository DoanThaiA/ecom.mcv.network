import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProductDetailsDto } from '../../../src/products/dto/update-product-details.dto';

describe('UpdateProductDetailsDto descriptionMedia', () => {
  const validateDto = (value: Record<string, unknown>) =>
    validate(plainToInstance(UpdateProductDetailsDto, value));

  it('accepts omitted media and empty arrays', async () => {
    await expect(validateDto({})).resolves.toHaveLength(0);
    await expect(
      validateDto({ descriptionMedia: { topImages: [], sliderImages: [], bottomImages: [] } }),
    ).resolves.toHaveLength(0);
  });

  it('accepts an ordered slider without a count limit', async () => {
    const sliderImages = Array.from({ length: 25 }, (_, index) => `image-${index}.webp`);
    await expect(validateDto({ descriptionMedia: { sliderImages } })).resolves.toHaveLength(0);
  });

  it.each([
    { descriptionMedia: { sliderImages: 'not-an-array' } },
    { descriptionMedia: { sliderImages: [123] } },
    { descriptionMedia: { topImages: ['x'.repeat(2049)] } },
  ])('rejects invalid media: %j', async (value) => {
    await expect(validateDto(value)).resolves.not.toHaveLength(0);
  });
});
