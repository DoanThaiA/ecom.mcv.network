'use client';

import { Button, Flex, IconButton, Text } from '@radix-ui/themes';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { OAuthProvider } from '@/types/auth';

interface SocialLoginButtonsProps {
  onSocialSignIn: (_provider: OAuthProvider) => void;
  disabled?: boolean;
}

/**
 * SocialLoginButtons - Social login buttons for authentication
 * Mobile: icon only, Desktop: buttons with border and text
 */
export function SocialLoginButtons({
  onSocialSignIn,
  disabled = false,
}: SocialLoginButtonsProps) {
  const t = useTranslations('signin');

  return (
    <>
      {/* Mobile version - icons only */}
      <Flex justify="center" gap="4" mt="1" className="sm:hidden">
        <IconButton
          variant="ghost"
          onClick={() => onSocialSignIn('facebook')}
          disabled={disabled}
          className="bg-transparent p-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image
            src="/assets/svg/social/fb_mobile.svg"
            alt="Facebook"
            width={32}
            height={32}
          />
        </IconButton>

        <IconButton
          variant="ghost"
          onClick={() => onSocialSignIn('google')}
          disabled={disabled}
          className="bg-transparent p-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image
            src="/assets/svg/social/gg_mobile.svg"
            alt="Google"
            width={32}
            height={32}
          />
        </IconButton>

        <IconButton
          variant="ghost"
          onClick={() => onSocialSignIn('zalo')}
          disabled={disabled}
          className="bg-transparent p-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image
            src="/assets/svg/social/zalo_mobile.svg"
            alt="Zalo"
            width={32}
            height={32}
          />
        </IconButton>
      </Flex>

      {/* Desktop version - buttons with border and text */}
      <Flex gap="2" mt="1" className="hidden sm:flex">
        <Button
          variant="outline"
          size="2"
          onClick={() => onSocialSignIn('facebook')}
          disabled={disabled}
          className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-50 cursor-pointer"
        >
          <Image
            src="/assets/svg/social/facebook.svg"
            alt="Facebook"
            width={16}
            height={16}
          />
          <Text size="1">{t('facebook')}</Text>
        </Button>

        <Button
          variant="outline"
          size="2"
          onClick={() => onSocialSignIn('google')}
          disabled={disabled}
          className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-50 cursor-pointer"
        >
          <Image
            src="/assets/svg/social/google.svg"
            alt="Google"
            width={16}
            height={16}
          />
          <Text size="1">{t('google')}</Text>
        </Button>

        <Button
          variant="outline"
          size="2"
          onClick={() => onSocialSignIn('zalo')}
          disabled={disabled}
          className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-50 cursor-pointer"
        >
          <Image
            src="/assets/svg/social/zalo.svg"
            alt="Zalo"
            width={16}
            height={16}
          />
          <Text size="1">{t('zalo')}</Text>
        </Button>
      </Flex>
    </>
  );
}
