'use client';

import { Navigation } from '@/components/navigation/Navigation';
import { AppLocale } from '@/lib/locale';
import type { RootState } from '@/lib/store';
import {
  oauthCallbackRequest,
  oauthLinkCallbackRequest,
  AuthStatus,
  setAuthError,
} from '@/lib/store/slices/authSlice';
import { useTranslations } from 'next-intl';
import type { OAuthProvider } from '@/types/auth';
import { Box, Button, Flex, Spinner, Text } from '@radix-ui/themes';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export type SocialProvider = 'facebook' | 'google' | 'zalo';

export const VALID_PROVIDERS: SocialProvider[] = ['facebook', 'google', 'zalo'];

export default function AuthCallbackPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { status } = useSelector((state: RootState) => state.auth);

  const locale = params.locale as AppLocale;
  const provider = params.provider as SocialProvider;
  const t = useTranslations('authCallback');
  const tCommon = useTranslations('common');
  const tLinked = useTranslations('linkedAccounts');

  const [countdown, setCountdown] = useState(3);
  const [isLinkAction, setIsLinkAction] = useState(false);
  const [savedReturnUrl, setSavedReturnUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = () => {
      // Provider already validated in previous useEffect
      if (!VALID_PROVIDERS.includes(provider)) {
        notFound();
        return;
      }

      // Check if there are any search params
      const hasParams = Array.from(searchParams.entries()).length > 0;
      if (!hasParams) {
        // No params to process
        return;
      }

      // Check for error in URL params (user cancelled or OAuth error)
      const error = searchParams.get('error');
      if (error) {
        dispatch(setAuthError());
        return;
      }

      // Collect all OAuth params
      const obj = Object.fromEntries(searchParams.entries());

      // Parse the state parameter for action and returnUrl
      const stateParam = searchParams.get('state') || '';
      let decodedState = stateParam;
      try {
        decodedState = decodeURIComponent(stateParam);
      } catch {
        // Keep original if decode fails
      }
      const isLink = decodedState.includes('action=link');
      setIsLinkAction(isLink);

      // Extract returnUrl from state (format: randomState|returnUrl=encodedUrl)
      const returnUrlMatch = decodedState.match(
        /\|returnUrl=([^|]+)/
      );
      if (returnUrlMatch) {
        try {
          const returnUrl = decodeURIComponent(returnUrlMatch[1]);
          if (returnUrl.startsWith('/')) {
            setSavedReturnUrl(returnUrl);
          }
        } catch {
          // Ignore malformed returnUrl
        }
      }

      if (isLink) {
        // Dispatch link callback action
        dispatch(
          oauthLinkCallbackRequest({
            provider: provider as OAuthProvider,
            payload: obj,
          })
        );
      } else {
        // Dispatch login callback action
        dispatch(
          oauthCallbackRequest({
            provider: provider as OAuthProvider,
            payload: obj,
          })
        );
      }
    };

    handleCallback();
  }, [provider, searchParams, dispatch]);

  // Countdown timer when authenticated
  useEffect(() => {
    if (status === AuthStatus.AUTHENTICATED && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === AuthStatus.AUTHENTICATED && countdown === 0) {
      let redirectUrl: string;
      if (isLinkAction) {
        redirectUrl = `/${locale}/account`;
      } else {
        redirectUrl = savedReturnUrl || `/${locale}`;
      }
      router.push(redirectUrl);
    }
  }, [status, countdown, locale, router, isLinkAction, savedReturnUrl]);

  const getProviderName = (provider: string): string => {
    const names: Record<string, string> = {
      facebook: 'Facebook',
      google: 'Google',
      zalo: 'Zalo',
    };
    return names[provider] || provider;
  };

  const handleBackToHome = () => {
    router.push(`/${locale}`);
  };

  const handleRedirect = () => {
    let redirectUrl: string;
    if (isLinkAction) {
      redirectUrl = `/${locale}/account`;
    } else {
      redirectUrl = savedReturnUrl || `/${locale}`;
    }
    router.push(redirectUrl);
  };

  return (
    <Box className="flex flex-col min-h-screen">
      {/* Navigation */}
      <Navigation locale={locale} />

      {/* Main Content - with margin-top to account for fixed navbar */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        className="flex-1 bg-gray-50 px-4 "
      >
        <Flex
          direction="column"
          align="center"
          gap="4"
          className="bg-white rounded-lg shadow-md p-8 max-w-md w-full"
        >
          {status === AuthStatus.LOADING && (
            <>
              <Spinner size="3" />
              <Text
                size="5"
                weight="medium"
                className="text-gray-900 text-center"
              >
                {isLinkAction
                  ? tLinked('linking', { provider: getProviderName(provider) })
                  : t('loggingIn', { provider: getProviderName(provider) })}
              </Text>
              <Text size="2" className="text-gray-600 text-center">
                {t('processing')}
              </Text>
            </>
          )}

          {status === AuthStatus.AUTHENTICATED && (
            <>
              <Flex
                align="center"
                justify="center"
                className="w-16 h-16 bg-green-100 rounded-full"
              >
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </Flex>
              <Text
                size="5"
                weight="medium"
                className="text-gray-900 text-center"
              >
                {isLinkAction ? tLinked('linkSuccess') : t('success')}
              </Text>
              <Flex
                direction="column"
                align="center"
                gap="2"
                className="w-full"
              >
                <Text size="2" className="text-gray-600 text-center">
                  {t('redirecting')} {countdown}s
                </Text>
                <Button
                  size="3"
                  onClick={handleRedirect}
                  className="mt-2 bg-black text-white hover:bg-gray-800 cursor-pointer w-full"
                >
                  {tCommon('buttons.backToHome')}
                </Button>
              </Flex>
            </>
          )}

          {status === AuthStatus.ERROR && (
            <>
              <Flex
                align="center"
                justify="center"
                className="w-16 h-16 bg-red-100 rounded-full"
              >
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Flex>
              <Text
                size="5"
                weight="medium"
                className="text-gray-900 text-center"
              >
                {t('error')}
              </Text>
              <Text size="2" className="text-gray-600 text-center">
                {t('errorMessage')}
              </Text>
              <Button
                size="3"
                onClick={handleBackToHome}
                className="mt-4 bg-black text-white hover:bg-gray-800 cursor-pointer"
              >
                {tCommon('buttons.backToHome')}
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
