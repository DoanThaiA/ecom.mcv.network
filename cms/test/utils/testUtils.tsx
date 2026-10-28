import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from 'src/i18next';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { authSlice } from 'src/redux/store/authSlice';
import { accountSlice } from 'src/redux/store/accountSlice';
import { comboSlice } from 'src/redux/store/comboSlice';
import { fileSlice } from 'src/redux/store/fileSlice';
import { inventorySlice } from 'src/redux/store/inventorySlice';
import { jobSlice } from 'src/redux/store/jobSlice';
import { nhanhSlice } from 'src/redux/store/nhanhSlice';
import { productSlice } from 'src/redux/store/productSlice';
import { productCategorySlice } from 'src/redux/store/productCategorySlice';
import { flashSaleSlice } from 'src/redux/store/flashSaleSlice';
import { zaloSlice } from 'src/redux/store/zaloSlice';
import { orderSlice } from 'src/redux/store/orderSlice';
import { newsSlice } from 'src/redux/store/newsSlice';
import { topicSlice } from 'src/redux/store/topicSlice';
import { menuSlice } from 'src/redux/store/menuSlice';
import { returnSlice } from 'src/redux/store/returnSlice';
import reviewReducer from 'src/redux/store/reviewSlice';
import { promotionSlice } from 'src/redux/store/promotionSlice';

const theme = createTheme();

const rootReducer = combineReducers({
  [authSlice.name]: authSlice.reducer,
  [accountSlice.name]: accountSlice.reducer,
  [comboSlice.name]: comboSlice.reducer,
  [fileSlice.name]: fileSlice.reducer,
  [inventorySlice.name]: inventorySlice.reducer,
  [jobSlice.name]: jobSlice.reducer,
  [nhanhSlice.name]: nhanhSlice.reducer,
  [productSlice.name]: productSlice.reducer,
  [productCategorySlice.name]: productCategorySlice.reducer,
  [flashSaleSlice.name]: flashSaleSlice.reducer,
  [zaloSlice.name]: zaloSlice.reducer,
  [orderSlice.name]: orderSlice.reducer,
  [newsSlice.name]: newsSlice.reducer,
  [topicSlice.name]: topicSlice.reducer,
  [menuSlice.name]: menuSlice.reducer,
  [returnSlice.name]: returnSlice.reducer,
  review: reviewReducer,
  [promotionSlice.name]: promotionSlice.reducer,
});

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: any;
}

export const renderWithProviders = (
  ui: ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: rootReducer,
      preloadedState,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) => {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
          </I18nextProvider>
        </BrowserRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

export * from '@testing-library/react';
