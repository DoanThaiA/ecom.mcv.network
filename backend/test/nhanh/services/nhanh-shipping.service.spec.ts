import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { Cache } from 'cache-manager';
import { NhanhShippingService } from '../../../src/nhanh/services/nhanh-shipping.service';
import { NhanhAuthService } from '../../../src/nhanh/services/nhanh-auth.service';
import { Depot } from '../../../src/depots/domain/depot';
import { OrderNhanhMapper } from '../../../src/nhanh/mappers/order-nhanh.mapper';
import { OrderShippingCarrier } from '../../../src/shop/order/domain/order';
import { AllConfigType } from '../../../src/config/config.type';
import {
  CARRIER_TYPE_SELF_SHIP,
  NHANH_SELF_SHIP_CARRIER_ID,
  NHANH_SELF_SHIP_SERVICE_ID,
} from '../../../src/nhanh/dto/nhanh-order.dto';
import { createOrder } from '../../helpers/domain-factories';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const depot = {
  id: 'depot-1',
  name: 'Kho HN',
  cityId: 254,
  districtId: 319,
  wardId: 1091,
  address: 'Kho HN',
} as unknown as Depot;

const destination = {
  cityId: 258,
  districtId: 427,
  wardId: 4603,
  address: 'Khu pho lac tho nam',
};

function buildService(getAccessToken: jest.Mock): NhanhShippingService {
  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'nhanh.appId') return '76678';
      if (key === 'nhanh.apiUrl') return 'https://pos.open.nhanh.vn';
      return undefined;
    }),
  } as unknown as ConfigService<AllConfigType>;
  const i18n = { t: jest.fn((key: string) => key) } as unknown as I18nService;
  const cacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  } as unknown as Cache;
  const nhanhAuthService = {
    getAccessToken,
  } as unknown as NhanhAuthService;

  return new NhanhShippingService(
    configService,
    i18n,
    nhanhAuthService,
    cacheManager,
  );
}

const validToken = {
  accessToken: 'token',
  businessId: 211417,
  expiredAt: Date.now() + 3600000,
};

describe('NhanhShippingService.calculateShippingFee — SELF_SHIP (TVC) fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fall back to SELF_SHIP (TVC) when no access token is available', async () => {
    const getAccessToken = jest.fn().mockResolvedValue(null);
    const service = buildService(getAccessToken);

    const result = await service.calculateShippingFee({
      depot,
      destination,
      weight: 500,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      carrierId: NHANH_SELF_SHIP_CARRIER_ID,
      serviceId: NHANH_SELF_SHIP_SERVICE_ID,
      carrierType: CARRIER_TYPE_SELF_SHIP,
      shipFee: 0,
    });
    // Without a token, no Nhanh API call should be made
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('should fall back to SELF_SHIP (TVC) when SHOP_ACCOUNT (type 2) returns no carriers', async () => {
    const getAccessToken = jest.fn().mockResolvedValue(validToken);
    const service = buildService(getAccessToken);
    mockedAxios.post.mockResolvedValue({ data: { code: 1, data: [] } });

    const result = await service.calculateShippingFee({
      depot,
      destination,
      weight: 500,
    });

    expect(result).toHaveLength(1);
    expect(result[0].carrierType).toBe(CARRIER_TYPE_SELF_SHIP);
    expect(result[0].carrierId).toBe(NHANH_SELF_SHIP_CARRIER_ID);
  });

  it('should fall back to SELF_SHIP (TVC) when the SHOP_ACCOUNT lookup throws', async () => {
    const getAccessToken = jest.fn().mockResolvedValue(validToken);
    const service = buildService(getAccessToken);
    mockedAxios.post.mockRejectedValue(new Error('network error'));
    mockedAxios.isAxiosError.mockReturnValue(false);

    const result = await service.calculateShippingFee({
      depot,
      destination,
      weight: 500,
    });

    expect(result[0].carrierType).toBe(CARRIER_TYPE_SELF_SHIP);
  });

  it('should use SHOP_ACCOUNT (NVS, type 2) when carriers are available', async () => {
    const getAccessToken = jest.fn().mockResolvedValue(validToken);
    const service = buildService(getAccessToken);
    mockedAxios.post.mockResolvedValue({
      data: {
        code: 1,
        data: [
          {
            logo: 'https://carrier.nvncdn.com/carrier/carr_1692349682_711.png',
            carrier: {
              id: 29,
              accountId: 7610,
              accountName: 'Cchatclothes',
            },
            service: { id: 0, name: 'Giao tiêu chuẩn', code: 'DefaultService' },
            shipFee: 11000,
            codFee: 0,
            declaredFee: 0,
            customerShipFee: 30000,
          },
        ],
      },
    });

    const result = await service.calculateShippingFee({
      depot,
      destination,
      weight: 500,
    });

    expect(result).toHaveLength(1);
    expect(result[0].carrierType).toBe(2);
    expect(result[0].carrierId).toBe(29);
    expect(result[0].accountId).toBe(7610);
    expect(result[0].serviceCode).toBe('DefaultService');
  });

  it('should fall back to SELF_SHIP (TVC) when SPX (29) returns no rates', async () => {
    const getAccessToken = jest.fn().mockResolvedValue(validToken);
    const service = buildService(getAccessToken);
    // SPX (id 29) empty -> no Viettel fallback, straight to TVC
    mockedAxios.post.mockResolvedValue({ data: { code: 1, data: [] } });

    const result = await service.calculateShippingFee({
      depot,
      destination,
      weight: 500,
    });

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].carrierType).toBe(CARRIER_TYPE_SELF_SHIP);
    expect(result[0].carrierId).toBe(NHANH_SELF_SHIP_CARRIER_ID);
  });
});

describe('SELF_SHIP (TVC) end-to-end flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should carry a SELF_SHIP option through to a TVC order/add payload', async () => {
    const getAccessToken = jest.fn().mockResolvedValue(null);
    const service = buildService(getAccessToken);

    // 1. Shipping calc falls back to SELF_SHIP (type 2 unavailable)
    const options = await service.calculateShippingFee({
      depot,
      destination,
      weight: 500,
    });
    const selected = options[0];
    expect(selected.carrierType).toBe(CARRIER_TYPE_SELF_SHIP);

    // 2. Persist the selected carrier onto the order snapshot (as checkout does)
    const snapshot = new OrderShippingCarrier();
    snapshot.carrierId = selected.carrierId;
    snapshot.carrierName = selected.carrierName;
    snapshot.carrierType = selected.carrierType;
    snapshot.serviceId = selected.serviceId;
    snapshot.serviceCode = null;
    snapshot.accountId = null;
    snapshot.shopId = null;

    const order = createOrder({
      shippingFee: 20000,
      shippingDiscount: 0,
      shippingCarrier: snapshot,
    });
    const productNhanhIds = new Map<string, number>([
      [order.items[0].productId, 999],
    ]);

    // 3. Map to the Nhanh order/add payload
    const payload = OrderNhanhMapper.toNhanhRequest(
      order,
      productNhanhIds,
      null,
    );

    expect(payload.carrier).toEqual({
      id: NHANH_SELF_SHIP_CARRIER_ID,
      serviceId: NHANH_SELF_SHIP_SERVICE_ID,
      customerShipFee: 20000,
    });
    // TVC must not push to a carrier — no sendCarrierType, no NVN/NVS code
    expect(payload.carrier).not.toHaveProperty('sendCarrierType');
  });
});
