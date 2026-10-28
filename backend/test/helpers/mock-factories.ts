import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { UserRepository } from '../../src/users/domain/user.repository';
import { SessionService } from '../../src/session/session.service';
import { UsersService } from '../../src/users/users.service';
import { TokenService } from '../../src/auth/services/token.service';
import { MailService } from '../../src/mail/mail.service';
import { FilesService } from '../../src/files/files.service';
import { CdpSyncService } from '../../src/cdp/cdp-sync.service';
import { RegistrationVoucherService } from '../../src/registration-voucher/registration-voucher.service';
import { OrderRepository } from '../../src/shop/order/domain/order.repository';
import { OnepayService } from '../../src/payment/onepay/onepay.service';
import { InfocmsService } from '../../src/payment/infocms/infocms.service';
import { OrderCdpSyncService } from '../../src/cdp/order-cdp-sync.service';
import { OrderNhanhSyncService } from '../../src/nhanh/services/order-nhanh-sync.service';
import { NhanhAuthService } from '../../src/nhanh/services/nhanh-auth.service';
import { ProductRepository } from '../../src/products/domain/product.repository';
import { OrderTasksService } from '../../src/order-tasks/order-tasks.service';
import { SearchKeywordsService } from '../../src/search-keywords/search-keywords.service';

const AUTH_CONFIG_DEFAULTS: Record<string, string> = {
  'auth.secret': 'test-jwt-secret-for-unit-tests',
  'auth.expires': '15m',
  'auth.refreshSecret': 'test-refresh-secret',
  'auth.refreshExpires': '7d',
  'auth.forgotSecret': 'test-forgot-secret',
  'auth.forgotExpires': '30m',
  'auth.confirmEmailSecret': 'test-confirm-email-secret',
  'auth.confirmEmailExpires': '24h',
};

export function createMockConfigService(): jest.Mocked<ConfigService> {
  return {
    getOrThrow: jest.fn((key: string) => {
      if (AUTH_CONFIG_DEFAULTS[key] !== undefined) {
        return AUTH_CONFIG_DEFAULTS[key];
      }
      throw new Error(`Config key not mocked: ${key}`);
    }),
    get: jest.fn((key: string) => AUTH_CONFIG_DEFAULTS[key] ?? undefined),
  } as unknown as jest.Mocked<ConfigService>;
}

export function createMockI18nService(): jest.Mocked<I18nService> {
  return {
    t: jest.fn((key: string) => key),
    translate: jest.fn((key: string) => key),
  } as unknown as jest.Mocked<I18nService>;
}

export function createMockJwtService(): jest.Mocked<JwtService> {
  return {
    signAsync: jest.fn().mockResolvedValue('mock.jwt.token'),
    verifyAsync: jest.fn().mockResolvedValue({ sub: 'mock-user-id' }),
    sign: jest.fn().mockReturnValue('mock.jwt.token'),
    verify: jest.fn().mockReturnValue({ sub: 'mock-user-id' }),
    decode: jest.fn().mockReturnValue({ sub: 'mock-user-id' }),
  } as unknown as jest.Mocked<JwtService>;
}

export function createMockUserRepository(): jest.Mocked<UserRepository> {
  return {
    create: jest.fn(),
    findManyWithPagination: jest.fn(),
    findById: jest.fn(),
    findByIds: jest.fn(),
    findByEmail: jest.fn(),
    findByPhone: jest.fn(),
    findBySocialIdAndProvider: jest.fn(),
    findBySocialAccountExcludingUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as unknown as jest.Mocked<UserRepository>;
}

export function createMockSessionService(): jest.Mocked<SessionService> {
  return {
    findById: jest.fn(),
    create: jest.fn(),
    createForUser: jest.fn(),
    createForCmsUser: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteById: jest.fn(),
    deleteByUserId: jest.fn().mockResolvedValue(undefined),
    deleteByUserIdWithExclude: jest.fn(),
  } as unknown as jest.Mocked<SessionService>;
}

export function createMockUsersService(): jest.Mocked<UsersService> {
  return {
    create: jest.fn(),
    findManyWithPagination: jest.fn(),
    findById: jest.fn(),
    findByIds: jest.fn(),
    findByEmail: jest.fn(),
    findByPhone: jest.fn(),
    findBySocialIdAndProvider: jest.fn(),
    findBySocialAccountExcludingUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as unknown as jest.Mocked<UsersService>;
}

export function createMockTokenService(): jest.Mocked<TokenService> {
  return {
    getTokensData: jest.fn().mockResolvedValue({
      token: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      tokenExpires: Date.now() + 15 * 60 * 1000,
    }),
    refreshToken: jest.fn(),
  } as unknown as jest.Mocked<TokenService>;
}

export function createMockMailService(): jest.Mocked<MailService> {
  return {
    userSignUp: jest.fn().mockResolvedValue(undefined),
    forgotPassword: jest.fn().mockResolvedValue(undefined),
    confirmNewEmail: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<MailService>;
}

export function createMockFilesService(): jest.Mocked<FilesService> {
  return {
    findById: jest.fn(),
    create: jest.fn(),
  } as unknown as jest.Mocked<FilesService>;
}

export function createMockCdpSyncService(): jest.Mocked<CdpSyncService> {
  return {
    syncUser: jest.fn().mockResolvedValue(null),
  } as unknown as jest.Mocked<CdpSyncService>;
}

export function createMockRegistrationVoucherService(): jest.Mocked<RegistrationVoucherService> {
  return {
    sendRegistrationVoucher: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<RegistrationVoucherService>;
}

export function createMockOrderRepository(): jest.Mocked<OrderRepository> {
  return {
    findById: jest.fn(),
    findByOrderNumber: jest.fn(),
    findByNhanhOrderId: jest.fn(),
    countUnsyncedToNhanh: jest.fn(),
    findManyWithPagination: jest.fn(),
    findByUserId: jest.fn(),
    findBySessionId: jest.fn(),
    findBySessionIdAndOrderNumber: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    generateOrderNumber: jest.fn(),
    countTodayOrders: jest.fn(),
    findGuestOrdersByPhone: jest.fn(),
    assignOrdersToUser: jest.fn(),
    updateCdpSyncStatus: jest.fn(),
    updateNhanhSyncStatus: jest.fn(),
    addPaymentEvent: jest.fn(),
  } as unknown as jest.Mocked<OrderRepository>;
}

export function createMockOnepayService(): jest.Mocked<OnepayService> {
  return {
    createPaymentUrl: jest
      .fn()
      .mockResolvedValue('https://onepay.example.com/pay'),
    verifyWebhook: jest.fn(),
  } as unknown as jest.Mocked<OnepayService>;
}

export function createMockInfocmsService(): jest.Mocked<InfocmsService> {
  return {
    createPaymentQr: jest.fn().mockResolvedValue({
      success: true,
      qrUrl: 'https://vietqr.example.com/qr',
      qrData: 'mock-qr-data',
      transactionUuid: 'mock-tx-uuid',
      ecollectionCd: 'mock-ecollection',
    }),
    verifyWebhook: jest.fn(),
  } as unknown as jest.Mocked<InfocmsService>;
}

export function createMockOrderCdpSyncService(): jest.Mocked<OrderCdpSyncService> {
  return {
    syncOrder: jest.fn().mockResolvedValue(undefined),
    syncOrderCancellation: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<OrderCdpSyncService>;
}

export function createMockOrderNhanhSyncService(): jest.Mocked<OrderNhanhSyncService> {
  return {
    syncOrder: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<OrderNhanhSyncService>;
}

export function createMockNhanhAuthService(): jest.Mocked<NhanhAuthService> {
  return {
    getAccessToken: jest.fn().mockResolvedValue({
      businessId: 12345,
      accessToken: 'mock-nhanh-token',
      expiredAt: Date.now() + 3600000,
    }),
  } as unknown as jest.Mocked<NhanhAuthService>;
}

export function createMockProductRepository(): jest.Mocked<ProductRepository> {
  return {
    findById: jest.fn(),
    findByCode: jest.fn(),
    findManyWithPagination: jest.fn(),
    updateDetails: jest.fn(),
    bulkUpdateHide: jest.fn(),
  } as unknown as jest.Mocked<ProductRepository>;
}

export function createMockOrderTasksService(): jest.Mocked<OrderTasksService> {
  return {
    queueSyncOrderCdp: jest.fn().mockResolvedValue(undefined),
    queueSyncOrderCancellationCdp: jest.fn().mockResolvedValue(undefined),
    queueSyncOrderNhanh: jest.fn().mockResolvedValue(undefined),
    queueCreateOrderConfirmation: jest.fn().mockResolvedValue(undefined),
    queueCreateAffiliateCommission: jest.fn().mockResolvedValue(undefined),
    queueUpdateAffiliateCommissionStatus: jest.fn().mockResolvedValue(undefined),
    queueIncrementPromotionUsage: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<OrderTasksService>;
}

export function createMockSearchKeywordsService(): jest.Mocked<SearchKeywordsService> {
  return {
    trackKeyword: jest.fn().mockResolvedValue(undefined),
    getTopKeywords: jest.fn().mockResolvedValue([]),
  } as unknown as jest.Mocked<SearchKeywordsService>;
}
