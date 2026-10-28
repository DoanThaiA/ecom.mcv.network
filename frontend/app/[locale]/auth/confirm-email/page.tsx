'use client';

import { confirmEmailRequest } from '@/lib/store/slices/registrationSlice';
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons';
import {
  Box,
  Card,
  Container,
  Flex,
  Heading,
  Spinner,
  Text,
} from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const t = useTranslations('confirmEmail');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying'
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const hash = searchParams.get('hash');
    if (!hash) {
      setStatus('error');
      setErrorMessage(t('invalidToken'));
      return;
    }

    // Dispatch confirm email request
    dispatch(
      confirmEmailRequest({
        hash,
        onSuccess: () => {
          setStatus('success');
        },
        onError: (error: unknown) => {
          setStatus('error');
          const errorMsg =
            error instanceof Error ? error.message : t('errorMessage');
          setErrorMessage(errorMsg);
        },
      })
    );
  }, [searchParams]);

  // No auto-close on success - user closes manually or clicks button

  return (
    <Container
      size="1"
      className="min-h-screen flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md p-6 sm:p-8">
        <Flex direction="column" gap="4" align="center">
          {/* Icon */}
          {status === 'verifying' && <Spinner size="3" />}
          {status === 'success' && (
            <CheckCircledIcon
              width="64"
              height="64"
              className="text-green-600"
            />
          )}
          {status === 'error' && (
            <CrossCircledIcon width="64" height="64" className="text-red-600" />
          )}

          {/* Title */}
          <Heading size="6" align="center">
            {status === 'verifying' && t('title')}
            {status === 'success' && t('success')}
            {status === 'error' && t('error')}
          </Heading>

          {/* Message */}
          <Box className="text-center">
            {status === 'verifying' && (
              <Text size="3" className="text-gray-600">
                {t('verifying')}
              </Text>
            )}
            {status === 'success' && (
              <Flex
                direction="column"
                gap="3"
                align="center"
                className="w-full"
              >
                <Text
                  size="4"
                  weight="medium"
                  className="text-gray-800 text-center"
                >
                  {t('successMessage')}
                </Text>
                <Text size="3" className="text-gray-600 text-center">
                  {t('successAction')}
                </Text>
              </Flex>
            )}
            {status === 'error' && (
              <Flex
                direction="column"
                gap="3"
                align="center"
                className="w-full"
              >
                <Text
                  size="4"
                  weight="medium"
                  className="text-gray-800 text-center"
                >
                  {errorMessage || t('errorMessage')}
                </Text>
                <Text size="3" className="text-gray-600 text-center">
                  {t('errorAction')}
                </Text>
              </Flex>
            )}
          </Box>
        </Flex>
      </Card>
    </Container>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <Container
          size="1"
          className="min-h-screen flex items-center justify-center p-4"
        >
          <Card className="w-full max-w-md p-6 sm:p-8">
            <Flex direction="column" gap="4" align="center">
              <Spinner size="3" />
              <Heading size="6" align="center">
                Loading...
              </Heading>
            </Flex>
          </Card>
        </Container>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
