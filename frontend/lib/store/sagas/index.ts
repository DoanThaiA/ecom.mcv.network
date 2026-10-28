import { all, fork } from 'redux-saga/effects';
import { authSaga } from './authSaga';
import { registrationSaga } from './registrationSaga';
import { passwordRecoverySaga } from './passwordRecoverySaga';
import { accountSaga } from './accountSaga';
import { watchCart } from './cartSaga';
import { watchProduct } from './productSaga';
import { watchProductDetail } from './productDetailSaga';
import { fileSaga } from './fileSaga';
import { watchProductsByCategory } from './productsByCategorySaga';
import { watchProductsByTopic } from './productsByTopicSaga';
import { returnRequestSaga } from './returnRequestSaga';
import { newsSaga } from './newsSaga';
import { topicSaga } from './topicSaga';
import { watchOrder } from './orderSaga';
import { locationSaga } from './locationSaga';
import { flashSaleSaga } from './flashSaleSaga';
import { watchReview } from './reviewSaga';
import { colorVariantSaga } from './colorVariantSaga';
import { recommendationSaga } from './recommendationSaga';

/**
 * Root saga
 * Combines all sagas in the application
 */
export function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(registrationSaga),
    fork(passwordRecoverySaga),
    fork(accountSaga),
    fork(watchCart),
    fork(watchProduct),
    fork(watchProductDetail),
    fork(fileSaga),
    fork(watchProductsByCategory),
    fork(watchProductsByTopic),
    fork(returnRequestSaga),
    fork(newsSaga),
    fork(topicSaga),
    fork(watchOrder),
    fork(locationSaga),
    fork(flashSaleSaga),
    fork(watchReview),
    fork(colorVariantSaga),
    fork(recommendationSaga),
  ]);
}
