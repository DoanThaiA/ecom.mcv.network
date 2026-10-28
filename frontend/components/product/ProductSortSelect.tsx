'use client';

import { Select } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';

interface ProductSortSelectProps {
  value: string;
  onValueChange: (_value: string) => void;
}

export function ProductSortSelect({ value, onValueChange }: ProductSortSelectProps) {
  const t = useTranslations('productListing');

  const itemClassName = "data-[state=checked]:bg-gray-200 data-[state=checked]:text-black data-[state=unchecked]:bg-transparent data-[state=unchecked]:text-gray-400";

  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger variant="surface" className="min-w-[120px] bg-white text-sm font-semibold rounded-3xl" />
      <Select.Content position="popper" className="text-sm font-normal">
        <Select.Item value="default" className={itemClassName}>{t('sortDefault')}</Select.Item>
        <Select.Item value="name-asc" className={itemClassName}>{t('sortNameAsc')}</Select.Item>
        <Select.Item value="name-desc" className={itemClassName}>{t('sortNameDesc')}</Select.Item>
        <Select.Item value="price-asc" className={itemClassName}>{t('sortPriceAsc')}</Select.Item>
        <Select.Item value="price-desc" className={itemClassName}>{t('sortPriceDesc')}</Select.Item>
        <Select.Item value="createdAt-asc" className={itemClassName}>{t('sortOldest')}</Select.Item>
        <Select.Item value="createdAt-desc" className={itemClassName}>{t('sortNewest')}</Select.Item>
        <Select.Item value="discount-asc" className={itemClassName}>{t('sortDiscountAsc')}</Select.Item>
        <Select.Item value="discount-desc" className={itemClassName}>{t('sortDiscountDesc')}</Select.Item>
        <Select.Item value="discountPercent-asc" className={itemClassName}>{t('sortDiscountPercentAsc')}</Select.Item>
        <Select.Item value="discountPercent-desc" className={itemClassName}>{t('sortDiscountPercentDesc')}</Select.Item>
      </Select.Content>
    </Select.Root>
  );
}
