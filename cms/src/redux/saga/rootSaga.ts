import { all, fork } from 'redux-saga/effects';
import { authSaga } from './authSaga';
import { accountSaga } from './accountSaga';
import { comboSaga } from './comboSaga';
import { commissionSaga } from './commissionSaga';
import { productBannerSaga } from './productBannerSaga';
import { fileSaga } from './fileSaga';
import { inventorySaga } from './inventorySaga';
import { jobSaga } from './jobSaga';
import { nhanhSaga } from './nhanhSaga';
import { productSaga } from './productSaga';
import { productCategorySaga } from './productCategorySaga';
import { flashSaleSaga } from './flashSaleSaga';
import { bannerSaga } from './bannerSaga';
import { popupAdsSaga } from './popupAdsSaga';
import { zaloSaga } from './zaloSaga';
import { orderSaga } from './orderSaga';
import { newsSaga } from './newsSaga';
import { topicSaga } from './topicSaga';
import { menuSaga } from './menuSaga';
import { returnSaga } from './returnSaga';
import reviewSaga from './reviewSaga';
import { promotionSaga } from './promotionSaga';
import { colorVariantSaga } from './colorVariantSaga';
import { withdrawalRequestSaga } from './withdrawalRequestSaga';
import { shippingPromotionSaga } from './shippingPromotionSaga';
import { cmsUserSaga } from './cmsUserSaga';
import { pushNotificationSaga } from './pushNotificationSaga';
import { affiliatesSaga } from './affiliatesSaga';
import { affiliatesPerformanceSaga } from './affiliatesPerformanceSaga';
import { affiliatePortalSaga } from './affiliatePortalSaga';

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(accountSaga),
    fork(comboSaga),
    fork(commissionSaga),
    fork(productBannerSaga),
    fork(fileSaga),
    fork(inventorySaga),
    fork(jobSaga),
    fork(nhanhSaga),
    fork(productSaga),
    fork(productCategorySaga),
    fork(flashSaleSaga),
    fork(zaloSaga),
    fork(orderSaga),
    fork(newsSaga),
    fork(topicSaga),
    fork(menuSaga),
    fork(returnSaga),
    fork(reviewSaga),
    fork(promotionSaga),
    fork(bannerSaga),
    fork(popupAdsSaga),
    fork(colorVariantSaga),
    fork(withdrawalRequestSaga),
    fork(shippingPromotionSaga),
    fork(cmsUserSaga),
    fork(pushNotificationSaga),
    fork(affiliatesSaga),
    fork(affiliatesPerformanceSaga),
    fork(affiliatePortalSaga),
  ]);
}
