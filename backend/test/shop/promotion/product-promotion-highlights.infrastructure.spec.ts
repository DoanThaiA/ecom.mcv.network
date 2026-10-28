import { GUARDS_METADATA, HEADERS_METADATA } from '@nestjs/common/constants';
import { Types } from 'mongoose';
import { PromotionRepositoryImpl } from '../../../src/promotions/model/promotion.repository';
import { ProductDocumentRepository } from '../../../src/products/model/product.repository';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';
import { BundleDealSubType } from '../../../src/promotions/domain/bundle-deal-sub-type.enum';
import { PromotionType } from '../../../src/promotions/domain/promotion-type.enum';
import { ShippingPromotionDocumentRepository } from '../../../src/shipping-promotions/model/shipping-promotion.repository';
import { ShippingPromotionType } from '../../../src/shipping-promotions/domain/shipping-promotion-type.enum';
import { ProductPromotionHighlightsController } from '../../../src/shop/promotion/product-promotion-highlights.controller';
import { ProductPromotionHighlightsService } from '../../../src/shop/promotion/product-promotion-highlights.service';

describe('Product promotion highlights infrastructure', () => {
  const productId = '507f1f77bcf86cd799439011';

  it('should query only active order discounts, global gifts, and product-targeted BUY_X_GET_Y deals', async () => {
    const exec = jest.fn().mockResolvedValue([]);
    const sort = jest.fn().mockReturnValue({ exec });
    const find = jest.fn().mockReturnValue({ sort });
    const repository = new PromotionRepositoryImpl({
      find,
    } as never);

    await repository.findActiveForProductHighlights(productId);

    expect(find).toHaveBeenCalledTimes(1);
    const query = find.mock.calls[0][0];
    expect(query).toMatchObject({
      isEnabled: true,
      deletedAt: null,
      startTime: { $lte: expect.any(Date) },
      endTime: { $gte: expect.any(Date) },
      $or: [
        { type: PromotionType.ORDER_DISCOUNT },
        {
          type: PromotionType.BUNDLE_DEAL,
          'bundleDealConfig.subType': BundleDealSubType.BUY_TO_GET_GIFT,
        },
        {
          type: PromotionType.BUNDLE_DEAL,
          'bundleDealConfig.subType': BundleDealSubType.BUY_X_GET_Y,
          'bundleDealConfig.requiredProducts.productId': expect.any(
            Types.ObjectId,
          ),
        },
      ],
    });
    expect(
      query.$or[2]['bundleDealConfig.requiredProducts.productId'].toString(),
    ).toBe(productId);
    expect(sort).toHaveBeenCalledWith({ endTime: 1, name: 1, _id: 1 });
  });

  it('should return active shipping promotions without applying a subtotal threshold', async () => {
    const rawPromotion = {
      _id: new Types.ObjectId(),
      type: ShippingPromotionType.FREESHIP,
      name: 'Freeship from 500K',
      startTime: new Date(Date.now() - 60_000),
      endTime: new Date(Date.now() + 60_000),
      isEnabled: true,
      freeshippingConfig: { minimumOrderValue: 500_000 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const lean = jest.fn().mockResolvedValue([rawPromotion]);
    const sort = jest.fn().mockReturnValue({ lean });
    const find = jest.fn().mockReturnValue({ sort });
    const repository = new ShippingPromotionDocumentRepository({
      find,
    } as never);

    const result = await repository.findActiveForDisplay();

    expect(find).toHaveBeenCalledWith({
      isEnabled: true,
      startTime: { $lte: expect.any(Date) },
      endTime: { $gte: expect.any(Date) },
      deletedAt: null,
    });
    expect(result).toHaveLength(1);
    expect(result[0].freeshippingConfig?.minimumOrderValue).toBe(500_000);
  });

  it('should batch-load live child variant availability through parent.id', async () => {
    const parentId = new Types.ObjectId();
    const variantId = new Types.ObjectId();
    const lean = jest.fn().mockResolvedValue([
      {
        _id: variantId,
        parent: { id: parentId },
        status: ProductStatus.ACTIVE,
        hide: false,
        inventory: { available: 4 },
      },
    ]);
    const find = jest.fn().mockReturnValue({ lean });
    const repository = new ProductDocumentRepository({ find } as never);

    const result = await repository.findPromotionVariantAvailabilityByParentIds(
      [parentId.toString(), parentId.toString(), 'invalid-id'],
    );

    expect(find).toHaveBeenCalledWith(
      {
        'parent.id': { $in: [expect.any(Types.ObjectId)] },
        deletedAt: null,
      },
      {
        'parent.id': 1,
        status: 1,
        hide: 1,
        'inventory.available': 1,
      },
    );
    expect(result).toEqual([
      {
        parentProductId: parentId.toString(),
        variantId: variantId.toString(),
        hide: false,
        status: ProductStatus.ACTIVE,
        available: 4,
      },
    ]);
  });

  it('should preserve variant visibility when embedding parent products', async () => {
    const parentId = new Types.ObjectId();
    const variantId = new Types.ObjectId();
    const parentLean = jest.fn().mockResolvedValue({ _id: parentId });
    const select = jest.fn().mockReturnValue({ lean: parentLean });
    const findOne = jest.fn().mockReturnValue({ select });
    const variantsLean = jest.fn().mockResolvedValue([
      {
        _id: variantId,
        code: 'HIDDEN-GIFT',
        name: 'Hidden gift variant',
        attributes: [],
        images: {},
        prices: { retail: 0 },
        inventory: { available: 3 },
        status: ProductStatus.ACTIVE,
        hide: true,
      },
    ]);
    const sort = jest.fn().mockReturnValue({ lean: variantsLean });
    const find = jest.fn().mockReturnValue({ sort });
    const updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
    const repository = new ProductDocumentRepository({
      findOne,
      find,
      updateOne,
    } as never);

    await expect(
      repository.embedVariantsForParent(123, 'business', 'nhanh'),
    ).resolves.toBe(true);

    expect(updateOne).toHaveBeenCalledWith(
      { _id: parentId },
      expect.objectContaining({
        $set: expect.objectContaining({
          variants: [
            expect.objectContaining({
              _id: variantId,
              status: ProductStatus.ACTIVE,
              hide: true,
            }),
          ],
        }),
      }),
    );
  });

  it('should expose a public no-store controller and delegate the canonical product ID', async () => {
    const response = {
      productId,
      shippingPromotions: [],
      orderDiscounts: [],
      giftPromotions: [],
    };
    const highlightsService = {
      getProductPromotionHighlights: jest.fn().mockResolvedValue(response),
    };
    const controller = new ProductPromotionHighlightsController(
      highlightsService as unknown as ProductPromotionHighlightsService,
    );

    await expect(
      controller.getProductPromotionHighlights(productId),
    ).resolves.toBe(response);
    expect(
      highlightsService.getProductPromotionHighlights,
    ).toHaveBeenCalledWith(productId);

    const handler =
      ProductPromotionHighlightsController.prototype
        .getProductPromotionHighlights;
    expect(Reflect.getMetadata(HEADERS_METADATA, handler)).toContainEqual({
      name: 'Cache-Control',
      value: 'no-store',
    });
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        ProductPromotionHighlightsController,
      ),
    ).toBeUndefined();
  });
});
