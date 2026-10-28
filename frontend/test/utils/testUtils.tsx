import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';
import authReducer from '@/lib/store/slices/authSlice';
import registrationReducer from '@/lib/store/slices/registrationSlice';
import passwordRecoveryReducer from '@/lib/store/slices/passwordRecoverySlice';
import accountReducer from '@/lib/store/slices/accountSlice';
import cartReducer from '@/lib/store/slices/cartSlice';
import productReducer from '@/lib/store/slices/productSlice';
import productDetailReducer from '@/lib/store/slices/productDetailSlice';
import fileReducer from '@/lib/store/slices/fileSlice';
import productsByCategoryReducer from '@/lib/store/slices/productsByCategorySlice';
import productsByTopicReducer from '@/lib/store/slices/productsByTopicSlice';
import returnRequestReducer from '@/lib/store/slices/returnRequestSlice';
import newsReducer from '@/lib/store/slices/newsSlice';
import newsDetailReducer from '@/lib/store/slices/newsDetailSlice';
import topicReducer from '@/lib/store/slices/topicSlice';
import orderReducer from '@/lib/store/slices/orderSlice';
import locationReducer from '@/lib/store/slices/locationSlice';
import flashSaleReducer from '@/lib/store/slices/flashSaleSlice';
import reviewReducer from '@/lib/store/slices/reviewSlice';

/**
 * Create a test store with optional preloaded state
 * This store does NOT include saga middleware to avoid side effects in tests
 */
export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      registration: registrationReducer,
      passwordRecovery: passwordRecoveryReducer,
      account: accountReducer,
      cart: cartReducer,
      product: productReducer,
      productDetail: productDetailReducer,
      file: fileReducer,
      productsByCategory: productsByCategoryReducer,
      productsByTopic: productsByTopicReducer,
      returnRequest: returnRequestReducer,
      news: newsReducer,
      newsDetail: newsDetailReducer,
      topic: topicReducer,
      order: orderReducer,
      location: locationReducer,
      flashSale: flashSaleReducer,
      review: reviewReducer,
    },
    preloadedState: preloadedState as any,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        thunk: false,
      }),
  });
}

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof setupStore>;
}

/**
 * Unified render function with Redux Provider
 * Usage:
 *   const { store } = renderWithProviders(<Component />, { preloadedState });
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
