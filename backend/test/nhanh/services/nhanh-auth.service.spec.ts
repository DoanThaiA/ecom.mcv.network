import {
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import axios from 'axios';
import { NhanhAuthService } from '../../../src/nhanh/services/nhanh-auth.service';

jest.mock('axios');

describe('NhanhAuthService OAuth flow', () => {
  const mockedAxios = jest.mocked(axios);

  const config: Record<string, unknown> = {
    'nhanh.appId': '76504',
    'nhanh.appSecret': 'app-secret',
    'nhanh.apiVersion': '3.0',
    'nhanh.oauthUrl': 'https://nhanh.vn/oauth',
    'nhanh.apiUrl': 'https://pos.open.nhanh.vn',
    'app.cmsDomain': 'https://ecom-cms.mcv.network',
  };

  let store: Map<string, unknown>;
  let cacheManager: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
  };
  let secretRepo: { get: jest.Mock; set: jest.Mock };
  let service: NhanhAuthService;

  const tokenResponse = () => ({
    data: {
      code: 1,
      data: {
        accessToken: 'access-token',
        version: '3.0',
        expiredAt: Math.floor(Date.now() / 1000) + 3600,
        businessId: 110668,
        depotIds: [],
        pageIds: [],
        permissions: [],
      },
    },
  });

  /** Starts the login the same way the CMS does and returns the verify code. */
  const startLogin = async (): Promise<string> => {
    const { url } = await service.getAuthorizationUrl();
    return new URL(url).searchParams.get('verifyCode') as string;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    store = new Map();
    cacheManager = {
      get: jest.fn((key: string) => Promise.resolve(store.get(key))),
      set: jest.fn((key: string, value: unknown) => {
        store.set(key, value);
        return Promise.resolve();
      }),
      del: jest.fn((key: string) => {
        store.delete(key);
        return Promise.resolve();
      }),
    };
    secretRepo = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
    };
    const configService = {
      get: jest.fn((key: string) => config[key]),
      getOrThrow: jest.fn((key: string) => config[key]),
    };
    const i18n = { t: jest.fn((key: string) => key) };

    service = new NhanhAuthService(
      configService as never,
      i18n as never,
      cacheManager as never,
      secretRepo as never,
    );
  });

  describe('getAuthorizationUrl', () => {
    it('should send appId, service, verifyCode and returnLink without a version', async () => {
      const { url } = await service.getAuthorizationUrl();
      const params = new URL(url).searchParams;

      expect(url.startsWith('https://nhanh.vn/oauth?')).toBe(true);
      expect(params.get('appId')).toBe('76504');
      expect(params.get('service')).toBe('pos');
      expect(params.get('returnLink')).toBe(
        'https://ecom-cms.mcv.network/auth/nhanh',
      );
      expect(params.get('verifyCode')).toMatch(/^[a-z0-9]{12,64}$/);
      expect(params.has('version')).toBe(false);
    });

    it('should keep the verify code server-side for the callback', async () => {
      const verifyCode = await startLogin();

      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('nhanh:verify-code'),
        verifyCode,
        expect.any(Number),
      );
    });

    it('should generate a new verify code for every login', async () => {
      const first = await startLogin();
      const second = await startLogin();

      expect(first).not.toBe(second);
    });

    it('should fail when the app id is not configured', async () => {
      delete config['nhanh.appId'];

      try {
        await expect(service.getAuthorizationUrl()).rejects.toThrow(
          'nhanh.credentialsNotConfigured',
        );
        expect(cacheManager.set).not.toHaveBeenCalled();
      } finally {
        config['nhanh.appId'] = '76504';
      }
    });
  });

  describe('exchangeAccessToken', () => {
    it('should exchange the code using the secret header and the verify code', async () => {
      const verifyCode = await startLogin();
      mockedAxios.post.mockResolvedValue(tokenResponse());

      const result = await service.exchangeAccessToken('ac-1', verifyCode);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://pos.open.nhanh.vn/v3.0/app/getaccesstoken?appId=76504',
        { accessCode: 'ac-1', verifyCode, secretKey: 'app-secret' },
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'app-secret' }),
        }),
      );
      expect(result.businessId).toBe(110668);
      expect(result).not.toHaveProperty('accessToken');
    });

    it('should save the token and consume the verify code on success', async () => {
      const verifyCode = await startLogin();
      mockedAxios.post.mockResolvedValue(tokenResponse());

      await service.exchangeAccessToken('ac-1', verifyCode);

      expect(secretRepo.set).toHaveBeenCalledWith(
        'nhanh:token',
        expect.objectContaining({
          accessToken: 'access-token',
          businessId: 110668,
        }),
      );
      expect(cacheManager.del).toHaveBeenCalledWith(
        expect.stringContaining('nhanh:verify-code'),
      );
      await expect(service.exchangeAccessToken('ac-1')).rejects.toThrow(
        'nhanh.authorizationExpired',
      );
    });

    it('should use the stored verify code when the callback does not send one', async () => {
      const verifyCode = await startLogin();
      mockedAxios.post.mockResolvedValue(tokenResponse());

      await service.exchangeAccessToken('ac-1');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ verifyCode }),
        expect.any(Object),
      );
    });

    it('should reject a callback when no login was started or it expired', async () => {
      await expect(
        service.exchangeAccessToken('ac-1', 'whatever'),
      ).rejects.toThrow(UnprocessableEntityException);

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should reject a callback whose verify code does not match', async () => {
      await startLogin();

      await expect(
        service.exchangeAccessToken('ac-1', 'forged-code'),
      ).rejects.toThrow(ForbiddenException);

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(secretRepo.set).not.toHaveBeenCalled();
    });

    it('should keep the verify code when Nhanh rejects the exchange so it can be retried', async () => {
      const verifyCode = await startLogin();
      mockedAxios.post.mockResolvedValue({
        data: {
          code: 0,
          messages: ['Invalid appId or accessCode or secretKey or verifyCode'],
        },
      });

      await expect(
        service.exchangeAccessToken('ac-1', verifyCode),
      ).rejects.toThrow(UnprocessableEntityException);

      expect(cacheManager.del).not.toHaveBeenCalled();
      expect(secretRepo.set).not.toHaveBeenCalled();
    });
  });
});
