import { SvgColor } from 'src/components/svg-color';
import { AccountTypeEnum, ModulePermissionEnum } from 'src/types/gen/cms/cms/cms-users/cms-user';
// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);
type IconType = JSX.Element | string;

export namespace NavEnums {
  export enum Nav {
    OVERVIEW = 'overview',
    AFFILIATE_PORTAL = 'affiliatePortal',
    MY_PERFORMANCE = 'myPerformance',
    MY_WITHDRAWAL_REQUESTS = 'myWithdrawalRequests',
    MY_INFO = 'myInfo',
    MY_ORDERS = 'myOrders',
    PRODUCT_MANAGEMENT = 'product_management',
    PRODUCTS = 'products',
    COMBO_PRODUCTS = 'combo_products',
    PRODUCT_CATEGORY = 'productCategory',
    PRODUCT_BANNER = 'productBanner',
    COLOR_VARIANT = 'colorVariant',
    INVENTORY_MANAGEMENT = 'inventory_management',
    ORDER_MANAGEMENT = 'order_management',
    RETURN_MANAGEMENT = 'returnManagement',
    REVIEW_MANAGEMENT = 'reviewManagement',
    FLASH_SALE_MANAGEMENT = 'flashSaleManagement',
    PROMOTION_MANAGEMENT = 'promotionManagement',
    NEWS_MANAGEMENT = 'newsManagement',
    HOMEPAGE_MANAGEMENT = 'homepageManagement',
    TOPIC_MANAGEMENT = 'topicManagement',
    MENU_MANAGEMENT = 'menuManagement',
    BANNER_MANAGEMENT = 'bannerManagement',
    POPUP_ADS_MANAGEMENT = 'popupAdsManagement',
    WITHDRAWAL_REQUEST_MANAGEMENT = 'withdrawalRequestManagement',
    SHIPPING_MANAGEMENT = 'shippingManagement',
    SHIPPING_FEE_CONFIG_MANAGEMENT = 'shippingFeeConfigManagement',
    SHIPPING_PROMOTION = 'shippingPromotion',
    AFFILIATE_MANAGEMENT = 'affiliateManagement',
    AFFILIATES = 'affiliates',
    AFFILIATES_PERFORMANCE = 'affiliatesPerformance',
    WITHDRAWAL_REQUEST = 'withdrawalRequest',
    AFFILIATES_COMMISSION = 'affiliatesCommission',
    ACCOUNT_MANAGEMENT = 'accountManagement',
    PUSH_NOTIFICATION_MANAGEMENT = 'pushNotificationManagement',
  }
}

export interface NavItem {
  title: string;
  path: string;
  icon?: IconType;
  children?: NavItem[];
  /** CMS module permission required to see this nav item. Owner sees all. */
  permission?: ModulePermissionEnum;
  /** If set, this nav item is only shown to users with this account type. */
  accountType?: AccountTypeEnum;
}

export class NavbarData {
  navData: NavItem[];

  constructor() {
    this.navData = [
      // {
      //   title: NavEnums.Nav.OVERVIEW,
      //   path: '/',
      //   icon: icon('ic-analytics'),
      // },
      {
        title: NavEnums.Nav.PRODUCT_MANAGEMENT,
        path: '#',
        icon: icon('ic-analytics'),
        permission: ModulePermissionEnum.MODULE_PERMISSION_PRODUCT_MANAGEMENT,
        children: [
          {
            title: NavEnums.Nav.PRODUCTS,
            path: '/product',
          },
          {
            title: NavEnums.Nav.COMBO_PRODUCTS,
            path: '/product-combo',
          },
          {
            title: NavEnums.Nav.PRODUCT_CATEGORY,
            path: '/product-category',
          },
          {
            title: NavEnums.Nav.REVIEW_MANAGEMENT,
            path: '/review',
          },
          {
            title: NavEnums.Nav.PRODUCT_BANNER,
            path: '/product-banner',
          },
          {
            title: NavEnums.Nav.COLOR_VARIANT,
            path: '/color-variant',
          },
        ],
      },
      // Temporarily hidden for demo
      // {
      //   title: NavEnums.Nav.INVENTORY_MANAGEMENT,
      //   path: '/inventory',
      //   icon: icon('ic-analytics'),
      // },
      {
        title: NavEnums.Nav.ORDER_MANAGEMENT,
        path: '/order',
        icon: icon('ic-analytics'),
        permission: ModulePermissionEnum.MODULE_PERMISSION_ORDER_MANAGEMENT,
      },
      {
        title: NavEnums.Nav.RETURN_MANAGEMENT,
        path: '/return',
        icon: icon('ic-analytics'),
        permission: ModulePermissionEnum.MODULE_PERMISSION_RETURN_MANAGEMENT,
      },
      {
        title: NavEnums.Nav.FLASH_SALE_MANAGEMENT,
        path: '/flash-sale',
        icon: icon('ic-analytics'),
        permission: ModulePermissionEnum.MODULE_PERMISSION_FLASH_SALE_MANAGEMENT,
      },
      {
        title: NavEnums.Nav.PROMOTION_MANAGEMENT,
        path: '/promotion',
        icon: icon('ic-analytics'),
        permission: ModulePermissionEnum.MODULE_PERMISSION_PROMOTION_MANAGEMENT,
      },
      {
        title: NavEnums.Nav.SHIPPING_MANAGEMENT,
        path: '#',
        icon: icon('ic-analytics'),
        permission: ModulePermissionEnum.MODULE_PERMISSION_SHIPPING_MANAGEMENT,
        children: [
          {
            title: NavEnums.Nav.SHIPPING_FEE_CONFIG_MANAGEMENT,
            path: '/shipping-fee-config',
          },
          {
            title: NavEnums.Nav.SHIPPING_PROMOTION,
            path: '/shipping-promotion',
          },
        ],
      },
      {
        title: NavEnums.Nav.NEWS_MANAGEMENT,
        path: '/article',
        icon: icon('ic-analytics'),
        permission: ModulePermissionEnum.MODULE_PERMISSION_NEWS_MANAGEMENT,
      },
      {
        title: NavEnums.Nav.PUSH_NOTIFICATION_MANAGEMENT,
        path: '/push-notification',
        icon: icon('ic-analytics'),
        permission: ModulePermissionEnum.MODULE_PERMISSION_PUSH_NOTIFICATION_MANAGEMENT,
      },
      {
        title: NavEnums.Nav.HOMEPAGE_MANAGEMENT,
        path: '#',
        icon: icon('ic-analytics'),
        permission: ModulePermissionEnum.MODULE_PERMISSION_HOMEPAGE_MANAGEMENT,
        children: [
          {
            title: NavEnums.Nav.TOPIC_MANAGEMENT,
            path: '/topic',
          },
          {
            title: NavEnums.Nav.MENU_MANAGEMENT,
            path: '/menu',
          },
          {
            title: NavEnums.Nav.BANNER_MANAGEMENT,
            path: '/banners',
          },
          {
            title: NavEnums.Nav.POPUP_ADS_MANAGEMENT,
            path: '/popup-ads',
          },
        ],
      },
      {
        title: NavEnums.Nav.AFFILIATE_MANAGEMENT,
        path: '#',
        icon: icon('ic-analytics'),
        permission: ModulePermissionEnum.MODULE_PERMISSION_AFFILIATE_MANAGEMENT,
        children: [
          {
            title: NavEnums.Nav.AFFILIATES,
            path: '/affiliates',
          },
          {
            title: NavEnums.Nav.WITHDRAWAL_REQUEST,
            path: '/withdrawal-request',
          },
          {
            title: NavEnums.Nav.AFFILIATES_COMMISSION,
            path: '/affiliates-commission',
          },
        ],
      },
      {
        title: NavEnums.Nav.ACCOUNT_MANAGEMENT,
        path: '/cms-users',
        icon: icon('ic-analytics'),
        permission: ModulePermissionEnum.MODULE_PERMISSION_ACCOUNT_MANAGEMENT,
      },
      // Affiliate portal: only visible to affiliate accounts (accountType=2)
      {
        title: NavEnums.Nav.AFFILIATE_PORTAL,
        path: '#',
        icon: icon('ic-analytics'),
        accountType: AccountTypeEnum.ACCOUNT_TYPE_AFFILIATE,
        children: [
          {
            title: NavEnums.Nav.MY_INFO,
            path: '/my-info',
          },
          {
            title: NavEnums.Nav.MY_WITHDRAWAL_REQUESTS,
            path: '/my-withdrawal-requests',
          },
        ],
      },
    ];
  }

  getNavigation(): NavItem[] {
    return this.navData;
  }
}
