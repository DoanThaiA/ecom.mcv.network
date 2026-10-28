import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../saga/rootSaga';
import { authSlice } from './authSlice';
import { accountSlice } from './accountSlice';
import { comboSlice } from './comboSlice';
import { commissionSlice } from './commissionSlice';
import { productBannerSlice } from './productBannerSlice';
import { fileSlice } from './fileSlice';
import { inventorySlice } from './inventorySlice';
import { jobSlice } from './jobSlice';
import { nhanhSlice } from './nhanhSlice';
import { productSlice } from './productSlice';
import { productCategorySlice } from './productCategorySlice';
import { flashSaleSlice } from './flashSaleSlice';
import { bannerSlice } from './bannerSlice';
import { popupAdsSlice } from './popupAdsSlice';
import { zaloSlice } from './zaloSlice';
import { orderSlice } from './orderSlice';
import { newsSlice } from './newsSlice';
import { topicSlice } from './topicSlice';
import { menuSlice } from './menuSlice';
import { returnSlice } from './returnSlice';
import reviewReducer from './reviewSlice';
import { promotionSlice } from './promotionSlice';
import { colorVariantSlice } from './colorVariantSlice';
import { withdrawalRequestSlice } from './withdrawalRequestSlice';
import { shippingFeeConfigSlice } from './shippingFeeConfigSlice';
import { shippingPromotionSlice } from './shippingPromotionSlice';
import { cmsUserSlice } from './cmsUserSlice';
import { pushNotificationSlice } from './pushNotificationSlice';
import affiliatesReducer from './affiliatesSlice';
import affiliatesPerformanceReducer from './affiliatesPerformanceSlice';
import affiliatePortalReducer from './affiliatePortalSlice';

const rootReducer = (state: any, action: any) => {
  if (action.type === 'USER_LOGOUT') {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

const appReducer = combineReducers({
  [authSlice.name]: authSlice.reducer,
  [accountSlice.name]: accountSlice.reducer,
  [comboSlice.name]: comboSlice.reducer,
  [commissionSlice.name]: commissionSlice.reducer,
  [productBannerSlice.name]: productBannerSlice.reducer,
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
  [bannerSlice.name]: bannerSlice.reducer,
  [popupAdsSlice.name]: popupAdsSlice.reducer,
  [colorVariantSlice.name]: colorVariantSlice.reducer,
  [withdrawalRequestSlice.name]: withdrawalRequestSlice.reducer,
  [shippingFeeConfigSlice.name]: shippingFeeConfigSlice.reducer,
  [shippingPromotionSlice.name]: shippingPromotionSlice.reducer,
  [cmsUserSlice.name]: cmsUserSlice.reducer,
  [pushNotificationSlice.name]: pushNotificationSlice.reducer,
  affiliates: affiliatesReducer,
  affiliatesPerformance: affiliatesPerformanceReducer,
  affiliatePortal: affiliatePortalReducer,
});

const createReduxStore = () => {
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(sagaMiddleware),
    devTools: process.env.NODE_ENV !== 'production',
  });

  sagaMiddleware.run(rootSaga);

  return store;
};

export const store = createReduxStore();

// Infer the type of `store`
export type AppStore = typeof store;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch;
// Same for the `RootState` type
export type RootState = ReturnType<typeof store.getState>;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
