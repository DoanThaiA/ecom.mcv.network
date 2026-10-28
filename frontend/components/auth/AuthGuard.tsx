'use client';

import { AppLocale } from '@/lib/locale';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { logout, selectIsAuthenticated } from '@/lib/store/slices/authSlice';
import { Container, Flex, Spinner, Text } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  locale: AppLocale;
}

/**
 * AuthGuard Component
 * Protects routes that require authentication
 * Redirects to home page and opens SignInDialog if user is not authenticated
 */
export function AuthGuard({ children, locale }: AuthGuardProps) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const dispatch = useAppDispatch();
  const [isMounted, setIsMounted] = useState(false);

  // Wait for client-side hydration to complete before checking auth
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only check auth after client-side hydration
    if (isMounted && !isAuthenticated) {
      router.push(`/${locale}`);
    }
  }, [isMounted, isAuthenticated, locale, router]);

  // Handle USER_LOGOUT event from axios interceptor
  useEffect(() => {
    const handleAuthExpired = () => {
      dispatch(logout());
      router.push(`/${locale}?sign-in=y`);
    };

    window.addEventListener('USER_LOGOUT', handleAuthExpired);
    return () => {
      window.removeEventListener('USER_LOGOUT', handleAuthExpired);
    };
  }, []);

  // Show loading spinner during SSR and initial hydration
  if (!isMounted) {
    return (
      <Container
        size="1"
        className="min-h-screen flex items-center justify-center p-4"
      >
        <Flex direction="column" gap="4" align="center">
          <Spinner size="3" />
          <Text size="3" className="text-gray-600">
            Loading...
          </Text>
        </Flex>
      </Container>
    );
  }

  // Show loading spinner while redirecting unauthenticated users
  if (!isAuthenticated) {
    return (
      <Container
        size="1"
        className="min-h-screen flex items-center justify-center p-4"
      >
        <Flex direction="column" gap="4" align="center">
          <Spinner size="3" />
          <Text size="3" className="text-gray-600">
            Loading...
          </Text>
        </Flex>
      </Container>
    );
  }

  return <>{children}</>;
}
