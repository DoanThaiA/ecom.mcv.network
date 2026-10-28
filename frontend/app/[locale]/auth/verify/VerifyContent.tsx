'use client';

import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Flex, Text } from '@radix-ui/themes';
import { AppLocale } from '@/lib/locale';
import Image from 'next/image';

export function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as AppLocale;
  const t = useTranslations('verifySignup');
  const tCommon = useTranslations('common');

  const status = searchParams.get('status');
  const isSuccess = status === 'success';

  const handleButtonClick = () => {
    if (isSuccess) {
      router.push(`/${locale}`);
    } else {
      router.push(`/${locale}?sign-up=y`);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-10 md:py-16 px-4">
      <Flex
        direction="column"
        align="center"
        gap="5"
        className="text-center max-w-xl"
      >
        <Image
          src={
            isSuccess
              ? '/assets/svg/auth/success.svg'
              : '/assets/svg/auth/error.svg'
          }
          alt={isSuccess ? 'Success' : 'Error'}
          width={150}
          height={150}
          className="w-[100px] h-[100px] md:w-[150px] md:h-[150px]"
        />

        <Text className="text-black text-base md:text-xl">
          {isSuccess ? t('successTitle') : t('errorTitle')}
        </Text>

        <Text className="text-black text-sm md:text-base">
          {isSuccess ? t('successMessage') : t('errorMessage')}
        </Text>

        <Button
          size="3"
          onClick={handleButtonClick}
          className="bg-black text-white cursor-pointer px-8 md:px-12 py-3 md:py-4 rounded-full hover:bg-gray-800 text-sm md:text-base"
        >
          {isSuccess ? tCommon('buttons.backToHome').toUpperCase() : t('registerAgain')}
        </Button>
      </Flex>
    </div>
  );
}
