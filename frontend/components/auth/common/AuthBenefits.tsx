'use client';

import { Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';

/**
 * AuthBenefits - Shared benefits section for auth dialogs
 * Shows benefits title and badges with background
 * Uses 'signin' namespace for translations (shared between signin/signup)
 */
export function AuthBenefits() {
  const t = useTranslations('signin');

  const benefits = [
    { key: 'voucherBenefit', text: t('voucherBenefit') },
    { key: 'cashbackBenefit', text: t('cashbackBenefit') },
    { key: 'exclusiveGiftBenefit', text: t('exclusiveGiftBenefit') },
  ];

  return (
    <>
      {/* Benefits Title */}
      <Text size="3" weight="regular" mb="1" className="text-black">
        {t('benefitsTitle')}
      </Text>

      {/* Benefits Badges */}
      <Flex justify="center" align="stretch" gap="4" mb="4" mt="2" width="100%">
        {benefits.map((benefit) => (
          <Flex
            key={benefit.key}
            flexGrow="1"
            flexBasis="0"
            align="center"
            justify="start"
            className="px-[1rem] py-[0.75rem] rounded-[0.125rem] bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/assets/svg/auth/benefit_bg.png)' }}
          >
            <Text className="text-white text-[0.75rem] font-medium leading-normal whitespace-pre-line">
              {benefit.text}
            </Text>
          </Flex>
        ))}
      </Flex>
    </>
  );
}
