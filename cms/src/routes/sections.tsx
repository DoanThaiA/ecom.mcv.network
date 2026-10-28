import { lazy, Suspense } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { useAppSelector } from 'src/redux/store/store';
import { selectCurrentUser } from 'src/redux/store/authSlice';
import { AccountTypeEnum, ModulePermissionEnum } from 'src/types/gen/cms/cms/cms-users/cms-user';
import { ModulePermission } from 'src/repositories/cms-user.repository';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';
import { varAlpha } from 'src/theme/styles';
import GuestGuard from 'src/components/auth/guest-guard';
import { AuthGuard } from 'src/components/auth/auth-guard';

// ----------------------------------------------------------------------

export const ProductPage = lazy(() => import('src/pages/product'));
export const ProductDetailPage = lazy(() => import('src/pages/product-detail'));
export const ProductComboPage = lazy(() => import('src/pages/product-combo'));
export const ProductComboDetailPage = lazy(() => import('src/pages/product-combo-detail'));
export const ProductComboCreatePage = lazy(() => import('src/pages/product-combo-create'));
export const ProductComboEditPage = lazy(() => import('src/pages/product-combo-edit'));
export const ProductCategoryPage = lazy(() => import('src/pages/product-category'));
export const ProductBannerPage = lazy(() => import('src/pages/product-banner'));
export const InventoryPage = lazy(() => import('src/pages/inventory'));
export const OrderPage = lazy(() => import('src/pages/order'));
export const FlashSalePage = lazy(() => import('src/pages/flash-sale'));
export const FlashSaleCreatePage = lazy(() => import('src/pages/flash-sale-create'));
export const FlashSaleEditPage = lazy(() => import('src/pages/flash-sale-edit'));
export const PromotionPage = lazy(() => import('src/pages/promotion'));
export const ShockDealCreatePage = lazy(() => import('src/pages/shock-deal-create'));
export const ShockDealEditPage = lazy(() => import('src/pages/shock-deal-edit'));
export const OrderDiscountCreatePage = lazy(() => import('src/pages/order-discount-create'));
export const OrderDiscountEditPage = lazy(() => import('src/pages/order-discount-edit'));
export const ProductDiscountCreatePage = lazy(() => import('src/pages/product-discount-create'));
export const ProductDiscountEditPage = lazy(() => import('src/pages/product-discount-edit'));
export const ProductDiscountDetailPage = lazy(() => import('src/pages/product-discount-detail'));
export const OrderDiscountDetailPage = lazy(() => import('src/pages/order-discount-detail'));
export const ShockDealDetailPage = lazy(() => import('src/pages/shock-deal-detail'));
export const NewsPage = lazy(() => import('src/pages/news'));
export const NewsCreatePage = lazy(() => import('src/pages/news-create'));
export const NewsEditPage = lazy(() => import('src/pages/news-edit'));
export const TopicPage = lazy(() => import('src/pages/topic'));
export const TopicCreatePage = lazy(() => import('src/pages/topic-create'));
export const TopicEditPage = lazy(() => import('src/pages/topic-edit'));
export const MenuPage = lazy(() => import('src/pages/menu'));
export const OrderDetailPage = lazy(() => import('src/pages/order-detail'));
export const ReturnPage = lazy(() => import('src/pages/return'));
export const ReturnDetailPage = lazy(() => import('src/pages/return-detail'));
export const AccountPage = lazy(() => import('src/pages/account'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const ForgotPasswordPage = lazy(() => import('src/pages/forgot-password'));
export const NhanhAuthCallbackPage = lazy(() => import('src/pages/nhanh-auth-callback'));
export const ZaloAuthCallbackPage = lazy(() => import('src/pages/zalo-auth-callback'));
export const ReviewPage = lazy(() => import('src/pages/review'));
export const BannerPage = lazy(() => import('src/pages/banner/banner'));
export const BannerCreatePage = lazy(() => import('src/pages/banner/banner-create'));
export const BannerEditPage = lazy(() => import('src/pages/banner/banner-edit'));
export const PopupAdsPage = lazy(() => import('src/pages/popup-ads/popup-ads'));
export const ColorVariantPage = lazy(() => import('src/pages/color-variant'));
export const ColorVariantCreatePage = lazy(() => import('src/pages/color-variant-create'));
export const ColorVariantEditPage = lazy(() => import('src/pages/color-variant-edit'));

export const WithdrawalRequestPage = lazy(() => import('src/pages/withdrawal-request'));
export const WithdrawalRequestDetailPage = lazy(
  () => import('src/pages/withdrawal-request-detail')
);
export const ShippingFeeConfigPage = lazy(() => import('src/pages/shipping-fee-config'));
export const ShippingPromotionPage = lazy(() => import('src/pages/shipping-promotion'));
export const ShippingPromotionCreatePage = lazy(
  () => import('src/pages/shipping-promotion-create')
);
export const ShippingPromotionEditPage = lazy(() => import('src/pages/shipping-promotion-edit'));

export const AffiliatesPage = lazy(() => import('src/pages/affiliates'));
export const AffiliatesCreatePage = lazy(() => import('src/pages/affiliates-create'));
export const AffiliatesEditPage = lazy(() => import('src/pages/affiliates-edit'));
export const AffiliatesDetailPage = lazy(() => import('src/pages/affiliates-detail'));
export const AffiliatesCommissionPage = lazy(() => import('src/pages/affiliates-commission'));

export const MyPerformancePage = lazy(() => import('src/pages/my-performance'));
export const MyWithdrawalRequestsPage = lazy(() => import('src/pages/my-withdrawal-requests'));
export const MyInfoPage = lazy(() => import('src/pages/my-info'));
export const MyWithdrawalRequestDetailPage = lazy(
  () => import('src/pages/my-withdrawal-request-detail')
);

export const CmsUserPage = lazy(() => import('src/pages/cms-user'));
export const CmsUserCreatePage = lazy(() => import('src/pages/cms-user-create'));
export const CmsUserEditPage = lazy(() => import('src/pages/cms-user-edit'));

export const PushNotificationPage = lazy(() => import('src/pages/push-notification'));
export const PushNotificationCreatePage = lazy(() => import('src/pages/push-notification-create'));
export const PushNotificationEditPage = lazy(() => import('src/pages/push-notification-edit'));
export const PushNotificationDetailPage = lazy(() => import('src/pages/push-notification-detail'));

/** Ordered list of permission → landing path for staff/manager accounts. */
const PERMISSION_LANDING_PATHS: { permission: ModulePermissionEnum; path: string }[] = [
  { permission: ModulePermissionEnum.MODULE_PERMISSION_PRODUCT_MANAGEMENT, path: '/product' },
  { permission: ModulePermissionEnum.MODULE_PERMISSION_ORDER_MANAGEMENT, path: '/order' },
  { permission: ModulePermissionEnum.MODULE_PERMISSION_RETURN_MANAGEMENT, path: '/return' },
  {
    permission: ModulePermissionEnum.MODULE_PERMISSION_FLASH_SALE_MANAGEMENT,
    path: '/flash-sale',
  },
  { permission: ModulePermissionEnum.MODULE_PERMISSION_PROMOTION_MANAGEMENT, path: '/promotion' },
  { permission: ModulePermissionEnum.MODULE_PERMISSION_NEWS_MANAGEMENT, path: '/article' },
  { permission: ModulePermissionEnum.MODULE_PERMISSION_HOMEPAGE_MANAGEMENT, path: '/topic' },
  {
    permission: ModulePermissionEnum.MODULE_PERMISSION_PUSH_NOTIFICATION_MANAGEMENT,
    path: '/push-notification',
  },
  {
    permission: ModulePermissionEnum.MODULE_PERMISSION_AFFILIATE_MANAGEMENT,
    path: '/affiliates',
  },
  { permission: ModulePermissionEnum.MODULE_PERMISSION_ACCOUNT_MANAGEMENT, path: '/cms-users' },
  {
    permission: ModulePermissionEnum.MODULE_PERMISSION_SHIPPING_MANAGEMENT,
    path: '/shipping-fee-config',
  },
];

/**
 * Redirects to the correct home page based on account type and module permissions.
 * - Affiliate accounts → /my-performance
 * - Owner/manager/staff with no specific module → /product
 * - Others → first permitted page in PERMISSION_LANDING_PATHS, fallback /account
 */
function HomeRedirect() {
  const currentUser = useAppSelector(selectCurrentUser);

  if (currentUser?.accountType === AccountTypeEnum.ACCOUNT_TYPE_AFFILIATE) {
    return <Navigate to="/my-info" replace />;
  }

  const userPermissions = currentUser?.permissions ?? [];

  // super_admin → /product
  if (userPermissions.includes(ModulePermission.super_admin as unknown as ModulePermissionEnum)) {
    return <Navigate to="/product" replace />;
  }
  const match = PERMISSION_LANDING_PATHS.find((entry) =>
    userPermissions.includes(entry.permission)
  );

  return <Navigate to={match?.path ?? '/account'} replace />;
}

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export function Router() {
  return useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense fallback={renderFallback}>
            <AuthGuard />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { element: <HomeRedirect />, index: true },
        { path: 'product', element: <ProductPage /> },
        { path: 'product/:id', element: <ProductDetailPage /> },
        { path: 'product-combo', element: <ProductComboPage /> },
        { path: 'product-combo/:id', element: <ProductComboDetailPage /> },
        { path: 'product-combo/create', element: <ProductComboCreatePage /> },
        { path: 'product-combo/edit/:id', element: <ProductComboEditPage /> },
        { path: 'product-category', element: <ProductCategoryPage /> },
        { path: 'product-banner', element: <ProductBannerPage /> },
        { path: 'inventory', element: <InventoryPage /> },
        { path: 'order', element: <OrderPage /> },
        { path: 'order/:id', element: <OrderDetailPage /> },
        { path: 'flash-sale', element: <FlashSalePage /> },
        { path: 'flash-sale/create', element: <FlashSaleCreatePage /> },
        { path: 'flash-sale/edit/:id', element: <FlashSaleEditPage /> },
        { path: 'promotion', element: <PromotionPage /> },
        { path: 'shock-deal/create', element: <ShockDealCreatePage /> },
        { path: 'shock-deal/edit/:id', element: <ShockDealEditPage /> },
        { path: 'order-discount/create', element: <OrderDiscountCreatePage /> },
        { path: 'order-discount/edit/:id', element: <OrderDiscountEditPage /> },
        { path: 'product-discount/create', element: <ProductDiscountCreatePage /> },
        { path: 'product-discount/edit/:id', element: <ProductDiscountEditPage /> },
        { path: 'product-discount/:id', element: <ProductDiscountDetailPage /> },
        { path: 'order-discount/:id', element: <OrderDiscountDetailPage /> },
        { path: 'shock-deal/:id', element: <ShockDealDetailPage /> },
        { path: 'article', element: <NewsPage /> },
        { path: 'article/create', element: <NewsCreatePage /> },
        { path: 'article/edit/:id', element: <NewsEditPage /> },
        { path: 'topic', element: <TopicPage /> },
        { path: 'topic/create', element: <TopicCreatePage /> },
        { path: 'topic/edit/:id', element: <TopicEditPage /> },
        { path: 'menu', element: <MenuPage /> },
        { path: 'return', element: <ReturnPage /> },
        { path: 'return/:id', element: <ReturnDetailPage /> },
        { path: 'account', element: <AccountPage /> },
        { path: 'review', element: <ReviewPage /> },
        { path: 'banners', element: <BannerPage /> },
        { path: 'banners/new', element: <BannerCreatePage /> },
        { path: 'banners/:id/edit', element: <BannerEditPage /> },
        { path: 'popup-ads', element: <PopupAdsPage /> },
        { path: 'color-variant', element: <ColorVariantPage /> },
        { path: 'color-variant/create', element: <ColorVariantCreatePage /> },
        { path: 'color-variant/edit/:id', element: <ColorVariantEditPage /> },
        { path: 'withdrawal-request', element: <WithdrawalRequestPage /> },
        { path: 'withdrawal-request/:id', element: <WithdrawalRequestDetailPage /> },
        { path: 'shipping-fee-config', element: <ShippingFeeConfigPage /> },
        { path: 'shipping-promotion', element: <ShippingPromotionPage /> },
        { path: 'shipping-promotion/create', element: <ShippingPromotionCreatePage /> },
        { path: 'shipping-promotion/edit/:id', element: <ShippingPromotionEditPage /> },
        { path: 'affiliates', element: <AffiliatesPage /> },
        { path: 'affiliates/create', element: <AffiliatesCreatePage /> },
        { path: 'affiliates/edit/:id', element: <AffiliatesEditPage /> },
        { path: 'affiliates/:id', element: <AffiliatesDetailPage /> },
        { path: 'withdrawal-request', element: <WithdrawalRequestPage /> },
        { path: 'affiliates-commission', element: <AffiliatesCommissionPage /> },
        { path: 'my-performance', element: <MyPerformancePage /> },
        { path: 'my-withdrawal-requests', element: <MyWithdrawalRequestsPage /> },
        { path: 'my-withdrawal-requests/:id', element: <MyWithdrawalRequestDetailPage /> },
        { path: 'my-info', element: <MyInfoPage /> },
        { path: 'cms-users', element: <CmsUserPage /> },
        { path: 'cms-users/create', element: <CmsUserCreatePage /> },
        { path: 'cms-users/edit/:id', element: <CmsUserEditPage /> },
        { path: 'push-notification', element: <PushNotificationPage /> },
        { path: 'push-notification/create', element: <PushNotificationCreatePage /> },
        { path: 'push-notification/edit/:id', element: <PushNotificationEditPage /> },
        { path: 'push-notification/:id', element: <PushNotificationDetailPage /> },
      ],
    },
    {
      element: (
        <AuthLayout>
          <GuestGuard />
        </AuthLayout>
      ),
      children: [
        {
          path: '/sign-in',
          element: <SignInPage />,
        },
        {
          path: '/forgot-password',
          element: <ForgotPasswordPage />,
        },
      ],
    },
    {
      path: '/auth/nhanh',
      element: (
        <Suspense fallback={renderFallback}>
          <NhanhAuthCallbackPage />
        </Suspense>
      ),
    },
    {
      path: '/auth/zalo',
      element: (
        <Suspense fallback={renderFallback}>
          <ZaloAuthCallbackPage />
        </Suspense>
      ),
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ]);
}
