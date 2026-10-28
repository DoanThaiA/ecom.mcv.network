'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from './index';
import { hydrateFromStorage } from './slices/authSlice';
import { fetchColorVariantsRequest } from './slices/colorVariantSlice';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | undefined>(undefined);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  // Hydrate auth state from localStorage after mount (client-side only)
  useEffect(() => {
    if (storeRef.current) {
      storeRef.current.dispatch(hydrateFromStorage());
    }
  }, []);

  // Defer color variants fetch to reduce initial load blocking
  // Fetch after 500ms delay to prioritize LCP-critical content
  useEffect(() => {
    const timer = setTimeout(() => {
      if (storeRef.current) {
        storeRef.current.dispatch(fetchColorVariantsRequest());
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Provider store={storeRef.current!}>
      {children}
    </Provider>
  );
}
