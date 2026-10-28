'use client';

import { SocialProvider } from '@/app/[locale]/auth/[provider]/page';
import type { RootState } from '@/lib/store';
import {
  oauthLinkRedirectRequest,
  unlinkSocialRequest,
} from '@/lib/store/slices/authSlice';
import type { OAuthProvider } from '@/types/auth';
import {
  AlertDialog,
  Box,
  Button,
  Flex,
  Heading,
  Text,
} from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Social providers configuration
const SOCIAL_PROVIDERS = [
  {
    id: 'facebook' as OAuthProvider,
    name: 'Facebook',
    authProvider: 'facebook' as SocialProvider,
    icon: '/assets/svg/social/facebook.svg',
  },
  {
    id: 'google' as OAuthProvider,
    name: 'Google',
    authProvider: 'google' as SocialProvider,
    icon: '/assets/svg/social/google.svg',
  },
  {
    id: 'zalo' as OAuthProvider,
    name: 'Zalo',
    authProvider: 'zalo' as SocialProvider,
    icon: '/assets/svg/social/zalo.svg',
  },
];

export function LinkedAccountsSection() {
  const t = useTranslations('linkedAccounts');
  const tCommon = useTranslations('common');
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.account.user);

  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<OAuthProvider | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);

  // Check if a provider is linked
  // Handle both string enum (from API JSON) and numeric enum values
  const isLinked = (authProvider: SocialProvider): boolean => {
    return (
      user?.socialAccounts?.some((acc) => {
        // API may return provider as string like "AUTH_PROVIDER_GOOGLE"
        // Convert to enum value for comparison
        const providerValue =
          typeof acc.provider === 'string'
            ? acc.provider === authProvider
            : false;
        return providerValue;
      }) ?? false
    );
  };

  // Handle link button click
  const handleLink = (provider: OAuthProvider) => {
    dispatch(oauthLinkRedirectRequest({ provider }));
  };

  // Handle unlink button click - show confirmation dialog
  const handleUnlinkClick = (provider: OAuthProvider) => {
    setSelectedProvider(provider);
    setUnlinkDialogOpen(true);
  };

  // Confirm unlink
  const handleUnlinkConfirm = () => {
    if (!selectedProvider) return;

    setIsUnlinking(true);
    dispatch(
      unlinkSocialRequest({
        provider: selectedProvider,
        onSuccess: () => {
          setIsUnlinking(false);
          setUnlinkDialogOpen(false);
          setSelectedProvider(null);
        },
        onError: () => {
          setIsUnlinking(false);
        },
      })
    );
  };

  // Get provider name for display
  const getProviderName = (provider: OAuthProvider): string => {
    const config = SOCIAL_PROVIDERS.find((p) => p.id === provider);
    return config?.name || provider;
  };

  return (
    <>
      <Box className="flex-1 bg-white rounded-[14px] border border-[rgba(164,161,170,0.2)] shadow-[0px_4px_8px_0px_rgba(29,33,41,0.12)]">
        {/* Header */}
        <Box className="px-4 sm:px-8 lg:px-[60px] py-4 sm:py-5 lg:py-6 border-b border-[rgba(164,161,170,0.2)]">
          <Heading className="text-xl sm:text-2xl lg:text-[28px] font-bold uppercase text-[#1D2129]">
            {t('title')}
          </Heading>
        </Box>

        {/* Content */}
        <Box className="px-4 sm:px-8 lg:px-[60px] py-4 sm:py-6 lg:py-8">
          <Flex direction="column" gap="4">
            {SOCIAL_PROVIDERS.map((provider) => {
              const linked = isLinked(provider.authProvider);

              return (
                <Flex
                  key={provider.id}
                  align="center"
                  justify="between"
                  className="py-3 sm:py-4 border-b border-[rgba(164,161,170,0.1)] last:border-b-0"
                >
                  {/* Provider info */}
                  <Flex align="center" gap="3" className="flex-1">
                    <Box className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                      <Image
                        src={provider.icon}
                        alt={provider.name}
                        width={24}
                        height={24}
                        className="sm:w-8 sm:h-8"
                      />
                    </Box>
                    <Flex direction="column" gap="0">
                      <Text className="text-sm sm:text-base font-medium text-[#1D2129]">
                        {provider.name}
                      </Text>
                      <Text className="text-xs sm:text-sm text-[#606060]">
                        {linked ? t('linked') : t('notLinked')}
                      </Text>
                    </Flex>
                  </Flex>

                  {/* Action button */}
                  {linked ? (
                    <Button
                      variant="outline"
                      size="2"
                      onClick={() => handleUnlinkClick(provider.id)}
                      className="text-red-500 border-red-500 hover:bg-red-50 cursor-pointer text-xs sm:text-sm px-3 sm:px-4"
                    >
                      {t('unlink')}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="2"
                      onClick={() => handleLink(provider.id)}
                      className="text-blue-500 border-blue-500 hover:bg-blue-50 cursor-pointer text-xs sm:text-sm px-3 sm:px-4"
                    >
                      {t('link')}
                    </Button>
                  )}
                </Flex>
              );
            })}
          </Flex>
        </Box>
      </Box>

      {/* Unlink Confirmation Dialog */}
      <AlertDialog.Root
        open={unlinkDialogOpen}
        onOpenChange={setUnlinkDialogOpen}
      >
        <AlertDialog.Content maxWidth="400px">
          <AlertDialog.Title>{t('unlinkConfirmTitle')}</AlertDialog.Title>
          <AlertDialog.Description>
            {selectedProvider &&
              t('unlinkConfirmMessage', {
                provider: getProviderName(selectedProvider),
              })}
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button
                variant="soft"
                color="gray"
                className="cursor-pointer"
                disabled={isUnlinking}
              >
                {tCommon('buttons.cancel')}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                variant="solid"
                color="red"
                className="cursor-pointer"
                onClick={handleUnlinkConfirm}
                disabled={isUnlinking}
              >
                {isUnlinking ? t('unlinking') : t('unlink')}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
}
