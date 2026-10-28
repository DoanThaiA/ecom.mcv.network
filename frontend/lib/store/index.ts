import { combineReducers, configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import authReducer from './slices/authSlice';
import registrationReducer from './slices/registrationSlice';
import passwordRecoveryReducer from './slices/passwordRecoverySlice';
import accountReducer from './slices/accountSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import productDetailReducer from './slices/productDetailSlice';
import fileReducer from './slices/fileSlice';
import productsByCategoryReducer from './slices/productsByCategorySlice';
import productsByTopicReducer from './slices/productsByTopicSlice';
import returnRequestReducer from './slices/returnRequestSlice';
import newsReducer from './slices/newsSlice';
import newsDetailReducer from './slices/newsDetailSlice';
import topicReducer from './slices/topicSlice';
import orderReducer from './slices/orderSlice';
import locationReducer from './slices/locationSlice';
import flashSaleReducer from './slices/flashSaleSlice';
import reviewReducer from './slices/reviewSlice';
import colorVariantReducer from './slices/colorVariantSlice';
import recommendationReducer from './slices/recommendationSlice';
import { rootSaga } from './sagas';

// Combine all reducers
const appReducer = combineReducers({
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
  colorVariant: colorVariantReducer,
  recommendation: recommendationReducer,
});

// Root reducer wrapper - resets entire state on logout
const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: any
) => {
  // Reset all slices to their initial state when user logs out
  // Handles both explicit logout action and legacy USER_LOGOUT event
  if (action.type === 'auth/logout') {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const makeStore = () => {
  // Create the saga middleware
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types
          ignoredActions: [
            'auth/setCredentials',
            'auth/verifyPhoneOtpRequest',
            'registration/registerRequest',
            'registration/resendCodeRequest',
            'registration/confirmEmailRequest',
            'passwordRecovery/forgotPasswordRequest',
            'passwordRecovery/phoneForgotPasswordRequestOtp',
            'passwordRecovery/phoneForgotPasswordVerifyOtp',
            'passwordRecovery/phoneForgotPasswordComplete',
            'account/changePasswordRequest',
            'account/updateUserRequest',
            'file/uploadFileRequest',
            'file/uploadMultipleFilesRequest',
            'review/submitReviewRequest',
          ],
          // Ignore these paths in the state
          ignoredPaths: ['account.user'],
          // Ignore onSuccess, onError callbacks in action payloads
          ignoredActionPaths: ['payload.onSuccess', 'payload.onError'],
        },
        thunk: false, // Disable thunk since we're using saga
      }).concat(sagaMiddleware),
    devTools: process.env.NODE_ENV !== 'production',
  });

  // Run the root saga
  sagaMiddleware.run(rootSaga);

  return store;
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
