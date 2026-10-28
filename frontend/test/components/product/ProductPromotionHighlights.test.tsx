import { Theme } from '@radix-ui/themes';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BundleDealSubType,
  DiscountType,
  OrderDiscountSubType,
  ShippingPromotionType,
} from '@/types/gen/shared/shared/common/enums';
import type { ProductPromotionHighlightsResponse } from '@/types/gen/shop/shop/shop/shop';
import { ProductPromotionHighlights } from '@/components/product/promotions/ProductPromotionHighlights';

const EVALUATED_AT = '2026-07-21T00:00:00.000Z';

vi.mock('next-intl', () => ({
  useLocale: () => 'vi',
  useTranslations: () =>
    (key: string, values: Record<string, string | number> = {}) => {
      const messages: Record<string, string> = {
        title: 'Offers',
        shippingLabel: 'Shipping',
        orderLabel: 'Promotions',
        giftLabel: 'Free gifts',
        giftListLabel: 'Free gift list, scroll horizontally to view more',
        freeShipping: 'Freeship',
        shippingDiscount: 'Shipping discount {value}',
        shippingTierCondition: 'Orders from {amount}: save {value}',
        orderDiscount: 'Save {value}',
        morePromotions: '+{count}',
        minimumOrder: 'Minimum order {amount}',
        maximumDiscount: 'Maximum discount {amount}',
        promotionEnds: 'Valid until {date}',
        notStackable: 'Cannot be combined',
        singleUse: 'One use per customer',
        promoCodeLabel: 'Code',
        copyCode: 'Copy code {code}',
        copy: 'Copy',
        copied: 'Copied',
        viewPromotionDetails: 'View {promotion}',
        viewMorePromotions: 'View {count} more offers',
        buyToGetGiftCondition: 'Spend {amount} and receive a gift',
        buyXGetYCondition:
          'Buy {requiredQuantity} eligible products and receive {giftQuantity} gift',
        giftPrice: 'Gift price',
        giftPriceValue: 'Gift price: {amount}',
        giftUnavailable: 'Temporarily unavailable',
        originalPrice: 'Original price {amount}',
      };

      return (messages[key] ?? key).replace(
        /\{(\w+)\}/g,
        (_, token: string) => String(values[token] ?? ''),
      );
    },
}));

vi.mock('next/image', () => ({
  default: ({
    fill: _fill,
    priority: _priority,
    quality: _quality,
    loader: _loader,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    priority?: boolean;
    quality?: number;
    loader?: unknown;
  }) => <img {...props} />,
}));

const createHighlights = (): ProductPromotionHighlightsResponse => ({
  productId: 'product-a',
  shippingPromotions: [
    {
      promotionId: 'shipping-1',
      promotionName: 'Free delivery',
      type: ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP,
      minimumOrderValue: 300000,
      tiers: [],
      endTime: new Date('2026-08-30T00:00:00.000Z'),
    },
  ],
  orderDiscounts: [
    {
      promotionId: 'auto-1',
      promotionName: 'Automatic offer',
      subType: OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_AUTO_APPLY,
      promoCode: 'SHOULD_NOT_RENDER',
      discountType: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
      discountValue: 15,
      minimumOrderValue: 500000,
      notApplicableWithOtherPromotions: false,
      singleUsePerCustomer: false,
      endTime: new Date('2026-08-30T00:00:00.000Z'),
    },
    {
      promotionId: 'code-1',
      promotionName: 'Code offer',
      subType: OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_PROMO_CODE,
      promoCode: 'NEW80K',
      discountType: DiscountType.DISCOUNT_TYPE_FIXED,
      discountValue: 80000,
      minimumOrderValue: 299000,
      notApplicableWithOtherPromotions: true,
      singleUsePerCustomer: true,
      endTime: new Date('2026-08-30T00:00:00.000Z'),
    },
  ],
  giftPromotions: [
    {
      promotionId: 'matching-gift',
      promotionName: 'Matching gift',
      subType: BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_X_GET_Y,
      tiers: [],
      requiredQuantity: 2,
      requiredProducts: [
        {
          productId: 'product-a',
          name: 'Product A',
          image: '',
          originalPrice: 300000,
          isAvailable: true,
        },
      ],
      giftQuantity: 1,
      giftProducts: [
        {
          productId: 'gift-a',
          name: 'Matching gift product',
          image: '/gift-a.jpg',
          originalPrice: 99000,
          isAvailable: true,
        },
      ],
      notApplicableWithOtherPromotions: false,
      endTime: new Date('2026-08-30T00:00:00.000Z'),
    },
    {
      promotionId: 'unrelated-gift',
      promotionName: 'Unrelated gift',
      subType: BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_X_GET_Y,
      tiers: [],
      requiredProducts: [
        {
          productId: 'product-b',
          name: 'Product B',
          image: '',
          originalPrice: 300000,
          isAvailable: true,
        },
      ],
      giftProducts: [
        {
          productId: 'gift-b',
          name: 'Unrelated gift product',
          image: '/gift-b.jpg',
          originalPrice: 99000,
          isAvailable: true,
        },
      ],
      notApplicableWithOtherPromotions: false,
      endTime: new Date('2026-08-30T00:00:00.000Z'),
    },
  ],
});

describe('ProductPromotionHighlights', () => {
  afterEach(() => vi.useRealTimers());

  it('removes an offer when its end time passes without reloading the page', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(EVALUATED_AT));
    const highlights = createHighlights();
    highlights.shippingPromotions[0].endTime = new Date(
      '2026-07-21T00:00:01.000Z',
    );
    highlights.orderDiscounts = [];
    highlights.giftPromotions = [];

    render(
      <Theme>
        <ProductPromotionHighlights
          highlights={highlights}
          productId="product-a"
          evaluatedAt={EVALUATED_AT}
        />
      </Theme>,
    );

    expect(screen.getByText('Freeship')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1_100));
    expect(screen.queryByRole('region', { name: 'Offers' })).not.toBeInTheDocument();
  });

  it('does not render highlights that expired before the stable evaluation time', () => {
    const highlights = createHighlights();
    highlights.shippingPromotions.forEach((promotion) => {
      promotion.endTime = new Date('2026-08-01T00:00:00.000Z');
    });
    highlights.orderDiscounts.forEach((promotion) => {
      promotion.endTime = new Date('2026-08-01T00:00:00.000Z');
    });
    highlights.giftPromotions.forEach((promotion) => {
      promotion.endTime = new Date('2026-08-01T00:00:00.000Z');
    });

    render(
      <Theme>
        <ProductPromotionHighlights
          highlights={highlights}
          productId="product-a"
          evaluatedAt="2026-08-02T00:00:00.000Z"
        />
      </Theme>,
    );

    expect(screen.queryByRole('region', { name: 'Offers' })).not.toBeInTheDocument();
  });

  it('renders mixed order discounts in one row and filters unrelated buy-x-get-y', () => {
    render(
      <Theme>
        <ProductPromotionHighlights
          highlights={createHighlights()}
          productId="product-a"
          evaluatedAt={EVALUATED_AT}
        />
      </Theme>,
    );

    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(screen.getByText('Promotions')).toBeInTheDocument();
    expect(screen.getByText('Save 15%')).toBeInTheDocument();
    expect(screen.getByText('Save 80.000đ')).toBeInTheDocument();
    expect(screen.getByText('Matching gift product')).toBeInTheDocument();
    expect(screen.queryByText('Unrelated gift product')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Offers' })).toHaveClass('mb-3');
  });

  it('shows the complete buy-x-get-y condition without line clamping', () => {
    render(
      <Theme>
        <ProductPromotionHighlights
          highlights={createHighlights()}
          productId="product-a"
          evaluatedAt={EVALUATED_AT}
        />
      </Theme>,
    );

    const condition = screen.getByText(
      'Buy 2 eligible products and receive 1 gift',
    );
    expect(condition).not.toHaveClass('line-clamp-2');
  });

  it('keeps the gift rail below its label and contains horizontal scrolling', () => {
    render(
      <Theme>
        <ProductPromotionHighlights
          highlights={createHighlights()}
          productId="product-a"
          evaluatedAt={EVALUATED_AT}
        />
      </Theme>,
    );

    const giftLabel = screen.getByText('Free gifts');
    const giftSection = giftLabel.parentElement;
    const giftRail = giftLabel.nextElementSibling;

    expect(giftSection).toHaveClass('w-full', 'min-w-0', 'max-w-full');
    expect(giftRail).toHaveClass(
      'w-full',
      'min-w-0',
      'max-w-full',
      'overflow-x-auto',
      'overscroll-x-contain',
    );
    expect(
      screen.getByRole('list', {
        name: 'Free gift list, scroll horizontally to view more',
      }),
    ).toHaveAttribute('tabindex', '0');
    expect(screen.getAllByRole('listitem')).not.toHaveLength(0);
    expect(screen.getByLabelText('Gift price: 0đ')).toBeInTheDocument();
  });

  it('renders configured gifts even when they are temporarily unavailable', () => {
    const highlights = createHighlights();
    highlights.giftPromotions[0].giftProducts[0].isAvailable = false;

    render(
      <Theme>
        <ProductPromotionHighlights
          highlights={highlights}
          productId="product-a"
          evaluatedAt={EVALUATED_AT}
        />
      </Theme>,
    );

    expect(screen.getByText('Matching gift product')).toBeInTheDocument();
    expect(screen.getByText('Temporarily unavailable')).toBeInTheDocument();
  });

  it('shows four hidden order offers in a constrained summary popover', async () => {
    const user = userEvent.setup();
    const highlights = createHighlights();
    const template = highlights.orderDiscounts[0];
    highlights.orderDiscounts = Array.from({ length: 7 }, (_, index) => ({
      ...template,
      promotionId: `order-${index}`,
      promotionName: `Order ${index}`,
      discountValue: 10 + index,
    }));

    render(
      <Theme>
        <ProductPromotionHighlights
          highlights={highlights}
          productId="product-a"
          evaluatedAt={EVALUATED_AT}
        />
      </Theme>,
    );

    expect(screen.getAllByRole('button', { name: /View Order/ })).toHaveLength(3);
    const moreButton = screen.getByRole('button', {
      name: 'View 4 more offers',
    });
    expect(moreButton).toHaveTextContent('+4');

    await user.click(moreButton);
    const firstHiddenPromotion = await screen.findByText('Order 3');
    expect(screen.getByText('Order 4')).toBeInTheDocument();
    expect(screen.getByText('Order 5')).toBeInTheDocument();
    expect(screen.getByText('Order 6')).toBeInTheDocument();
    expect(firstHiddenPromotion.closest('[role="dialog"]')).toHaveClass(
      'overflow-y-auto',
      'overscroll-y-contain',
    );
  });

  it('shows a code only for promo-code offers', async () => {
    const user = userEvent.setup();
    render(
      <Theme>
        <ProductPromotionHighlights
          highlights={createHighlights()}
          productId="product-a"
          evaluatedAt={EVALUATED_AT}
        />
      </Theme>,
    );

    await user.click(screen.getByRole('button', { name: 'View Automatic offer' }));
    expect(screen.getByText('Automatic offer')).toBeInTheDocument();
    expect(screen.queryByText('SHOULD_NOT_RENDER')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'View Code offer' }));
    expect(await screen.findByText('NEW80K')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copy code NEW80K' }),
    ).toBeInTheDocument();
  });

  it('closes a hovered promotion popover with Escape', async () => {
    const user = userEvent.setup();
    render(
      <Theme>
        <ProductPromotionHighlights
          highlights={createHighlights()}
          productId="product-a"
          evaluatedAt={EVALUATED_AT}
        />
      </Theme>,
    );

    await user.hover(
      screen.getByRole('button', { name: 'View Free delivery' }),
    );
    expect(await screen.findByText('Free delivery')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByText('Free delivery')).not.toBeInTheDocument(),
    );
  });
});
