import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { InfocmsService } from '../../../src/payment/infocms/infocms.service';
import { OrderRepository } from '../../../src/shop/order/domain/order.repository';
import { CheckoutPaymentHandlerService } from '../../../src/shop/checkout/checkout-payment-handler.service';
import { PaymentStatus } from '../../../src/shop/order/domain/order.enums';
import { PaymentEventStatus } from '../../../src/shop/order/domain/order';
import * as InfocmsUtils from '../../../src/payment/infocms/infocms.utils';
import {
  generateHmacSignature,
  generateRsaSignature,
  generateRequestId,
  generateTransactionUuid,
  extractOrderNumberFromTransactionUuid,
  toBase64,
  isSuccessResponse,
  getErrorMessage,
  InfocmsBaseResponse,
  InfocmsLoginData,
  InfocmsCreateQrData,
  InfocmsCallbackData,
  InfocmsInquiryDataItem,
} from '../../../src/payment/infocms/infocms.utils';
import {
  INFOCMS_ACCESS_TOKEN_EXPIRY,
  INFOCMS_SUCCESS_CODE,
} from '../../../src/payment/infocms/infocms.constants';

// Mock utilities
jest.mock('../../../src/payment/infocms/infocms.utils', () => ({
  ...jest.requireActual('../../../src/payment/infocms/infocms.utils'),
  generateHmacSignature: jest.fn(),
  generateRsaSignature: jest.fn(),
  generateRequestId: jest.fn(),
  generateTransactionUuid: jest.fn(),
  extractOrderNumberFromTransactionUuid: jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn();

describe('InfocmsService', () => {
  let service: InfocmsService;
  let configService: jest.Mocked<ConfigService>;
  let orderRepository: jest.Mocked<OrderRepository>;
  let checkoutPaymentHandler: jest.Mocked<CheckoutPaymentHandlerService>;

  const mockConfig = {
    masterId: 'master-123',
    clientId: 'client-123',
    clientSecret: 'secret-123',
    bankCode: 'BIDV',
    posUniqueId: 'POS-001',
    posFranchiseeName: 'Test Franchise',
    posCompanyName: 'Test Company',
    privateKey: 'base64-private-key',
    backendDomain: 'https://api.example.com',
  };

  const mockOrder = {
    id: 'order-123',
    orderNumber: 'ORD-001',
    total: 100000,
    paymentStatus: PaymentStatus.PENDING,
    infocms: {
      transactionUuid: 'ORD-001-1234567890',
      ecollectionCd: 'EC-123',
    },
  };

  beforeEach(async () => {
    // Setup config mock implementation before module creation
    const mockConfigGet = jest.fn().mockImplementation((key: string) => {
      const keyMap: Record<string, string> = {
        'infocms.masterId': mockConfig.masterId,
        'infocms.clientId': mockConfig.clientId,
        'infocms.clientSecret': mockConfig.clientSecret,
        'infocms.bankCode': mockConfig.bankCode,
        'infocms.posUniqueId': mockConfig.posUniqueId,
        'infocms.posFranchiseeName': mockConfig.posFranchiseeName,
        'infocms.posCompanyName': mockConfig.posCompanyName,
        'infocms.privateKey': mockConfig.privateKey,
      };
      return keyMap[key];
    });

    const mockConfigGetOrThrow = jest
      .fn()
      .mockReturnValue(mockConfig.backendDomain);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InfocmsService,
        {
          provide: ConfigService,
          useValue: {
            get: mockConfigGet,
            getOrThrow: mockConfigGetOrThrow,
          },
        },
        {
          provide: OrderRepository,
          useValue: {
            findByOrderNumber: jest.fn(),
            addPaymentEvent: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: CheckoutPaymentHandlerService,
          useValue: {
            handlePaymentSuccess: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InfocmsService>(InfocmsService);
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
    orderRepository = module.get(
      OrderRepository,
    ) as jest.Mocked<OrderRepository>;
    checkoutPaymentHandler = module.get(
      CheckoutPaymentHandlerService,
    ) as jest.Mocked<CheckoutPaymentHandlerService>;

    // Suppress logger output
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    // Reset utility mocks
    (generateHmacSignature as jest.Mock).mockReturnValue(
      'hmac-signature-base64',
    );
    (generateRsaSignature as jest.Mock).mockReturnValue('rsa-signature-base64');
    (generateRequestId as jest.Mock).mockReturnValue(
      '12345678-1234-1234-1234-123456789012',
    );
    (generateTransactionUuid as jest.Mock).mockImplementation(
      (orderNumber: string) => `${orderNumber}-1234567890`,
    );

    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isConfigured', () => {
    it('should return true when all required config is present', () => {
      const result = service.isConfigured();

      expect(result).toBe(true);
    });

    it('should return false when masterId is missing', () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'infocms.masterId') return '';
        return mockConfig[key.split('.')[1] as keyof typeof mockConfig];
      });

      // Need to create new service instance with new config
      const newService = new InfocmsService(
        configService,
        orderRepository,
        checkoutPaymentHandler,
      );

      expect(newService.isConfigured()).toBe(false);
    });

    it('should return false when clientId is missing', () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'infocms.clientId') return '';
        return mockConfig[key.split('.')[1] as keyof typeof mockConfig];
      });

      const newService = new InfocmsService(
        configService,
        orderRepository,
        checkoutPaymentHandler,
      );

      expect(newService.isConfigured()).toBe(false);
    });

    it('should return false when privateKey is missing', () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'infocms.privateKey') return '';
        return mockConfig[key.split('.')[1] as keyof typeof mockConfig];
      });

      const newService = new InfocmsService(
        configService,
        orderRepository,
        checkoutPaymentHandler,
      );

      expect(newService.isConfigured()).toBe(false);
    });
  });

  describe('createPaymentQr', () => {
    const mockLoginResponse = {
      responseCd: '000000',
      responseMsg: 'Success',
      responseTs: '2024-01-01T00:00:00Z',
      responseTraceId: 'trace-123',
      data: {
        accessToken: 'access-token-123',
        refreshIdx: 1,
      },
    } as InfocmsBaseResponse;

    const mockCreateQrResponse = {
      responseCd: '000000',
      responseMsg: 'Success',
      responseTs: '2024-01-01T00:00:00Z',
      responseTraceId: 'trace-456',
      data: {
        qrUrl: 'https://qr.example.com/qr123',
        qrData: 'QR_DATA_STRING',
        transactionUuid: 'ORD-001-1234567890',
        ecollectionCd: 'EC-123',
        motherAccountNo: '123456789',
        accountHolderNm: 'Test Company',
      },
    } as InfocmsBaseResponse;

    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockLoginResponse),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockCreateQrResponse),
        });
    });

    it('should return error when service is not configured', async () => {
      configService.get.mockReturnValue('');

      const newService = new InfocmsService(
        configService,
        orderRepository,
        checkoutPaymentHandler,
      );

      const result = await newService.createPaymentQr(mockOrder as any);

      expect(result).toEqual({
        success: false,
        errorCode: 'NOT_CONFIGURED',
        errorMessage: 'InfoCMS is not configured',
      });
    });

    it('should create payment QR successfully', async () => {
      orderRepository.addPaymentEvent.mockResolvedValue(mockOrder as any);

      const result = await service.createPaymentQr(mockOrder as any);

      expect(result.success).toBe(true);
      expect(result.qrUrl).toBe('https://qr.example.com/qr123');
      expect(result.qrData).toBe('QR_DATA_STRING');
      expect(result.transactionUuid).toBe('ORD-001-1234567890');
      expect(result.ecollectionCd).toBe('EC-123');
    });

    it('should call login and create QR API', async () => {
      orderRepository.addPaymentEvent.mockResolvedValue(mockOrder as any);

      await service.createPaymentQr(mockOrder as any);

      // Should call login
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
        }),
      );

      // Should call create QR
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ec/po_create_qr'),
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    it('should record payment initiated event', async () => {
      orderRepository.addPaymentEvent.mockResolvedValue(mockOrder as any);

      await service.createPaymentQr(mockOrder as any);

      expect(orderRepository.addPaymentEvent).toHaveBeenCalledWith(
        'order-123',
        {
          status: PaymentEventStatus.INITIATED,
          timestamp: expect.any(Date),
          amount: 100000,
          ref: 'ORD-001-1234567890',
        },
      );
    });

    it('should round order total to integer', async () => {
      const orderWithDecimal = { ...mockOrder, total: 100050.5 };
      orderRepository.addPaymentEvent.mockResolvedValue(
        orderWithDecimal as any,
      );

      await service.createPaymentQr(orderWithDecimal as any);

      // Check the request body contains rounded amount
      const createQrCall = (global.fetch as jest.Mock).mock.calls.find((call) =>
        call[0].includes('/ec/po_create_qr'),
      );
      const body = JSON.parse(createQrCall[1].body);
      expect(body.data.depositAmt).toBe('100051');
    });

    it('should sanitize remark to remove special characters', async () => {
      orderRepository.addPaymentEvent.mockResolvedValue(mockOrder as any);

      await service.createPaymentQr(mockOrder as any, 'Payment @#$% test!');

      const createQrCall = (global.fetch as jest.Mock).mock.calls.find((call) =>
        call[0].includes('/ec/po_create_qr'),
      );
      const body = JSON.parse(createQrCall[1].body);
      expect(body.data.remark).toBe('Payment  test');
    });

    it('should handle API error response', async () => {
      const errorResponse = {
        responseCd: 'C00125',
        responseMsg: 'No available e-collection code',
        responseTs: '2024-01-01T00:00:00Z',
        responseTraceId: 'trace-error',
      };

      (global.fetch as jest.Mock).mockReset();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockLoginResponse),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(errorResponse),
        });

      const result = await service.createPaymentQr(mockOrder as any);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('C00125');
      expect(result.errorMessage).toBe('No available e-collection code');
    });

    it('should handle network error', async () => {
      (global.fetch as jest.Mock).mockReset();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockLoginResponse),
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const result = await service.createPaymentQr(mockOrder as any);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('API_ERROR');
      expect(result.errorMessage).toBe('Network error');
    });

    it('should use custom remark if provided', async () => {
      orderRepository.addPaymentEvent.mockResolvedValue(mockOrder as any);

      await service.createPaymentQr(mockOrder as any, 'Custom payment note');

      const createQrCall = (global.fetch as jest.Mock).mock.calls.find((call) =>
        call[0].includes('/ec/po_create_qr'),
      );
      const body = JSON.parse(createQrCall[1].body);
      expect(body.data.remark).toBe('Custom payment note');
    });

    it('should use default remark if not provided', async () => {
      orderRepository.addPaymentEvent.mockResolvedValue(mockOrder as any);

      await service.createPaymentQr(mockOrder as any);

      const createQrCall = (global.fetch as jest.Mock).mock.calls.find((call) =>
        call[0].includes('/ec/po_create_qr'),
      );
      const body = JSON.parse(createQrCall[1].body);
      expect(body.data.remark).toBe('Thanh toan ORD001');
    });
  });

  describe('cancelQr', () => {
    const mockLoginResponse = {
      responseCd: '000000',
      responseMsg: 'Success',
      responseTs: '2024-01-01T00:00:00Z',
      responseTraceId: 'trace-123',
      data: {
        accessToken: 'access-token-123',
        refreshIdx: 1,
      },
    } as InfocmsBaseResponse;

    const mockCancelResponse = {
      responseCd: '000000',
      responseMsg: 'Success',
      responseTs: '2024-01-01T00:00:00Z',
      responseTraceId: 'trace-cancel',
    };

    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockLoginResponse),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockCancelResponse),
        });
    });

    it('should cancel QR successfully', async () => {
      const result = await service.cancelQr('EC-123', 'ORD-001-1234567890');

      expect(result.success).toBe(true);
    });

    it('should call cancel QR API with correct params', async () => {
      await service.cancelQr('EC-123', 'ORD-001-1234567890');

      const cancelCall = (global.fetch as jest.Mock).mock.calls.find((call) =>
        call[0].includes('/ec/po_cancel_qr'),
      );
      const body = JSON.parse(cancelCall[1].body);

      expect(body.data.ecollectionCd).toBe('EC-123');
      expect(body.data.transactionUuid).toBe('ORD-001-1234567890');
      expect(body.data.posUniqueId).toBe('POS-001');
    });

    it('should handle API error response', async () => {
      const errorResponse = {
        responseCd: 'C00127',
        responseMsg: 'Already cancelled',
        responseTs: '2024-01-01T00:00:00Z',
        responseTraceId: 'trace-error',
      };

      (global.fetch as jest.Mock).mockReset();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockLoginResponse),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(errorResponse),
        });

      const result = await service.cancelQr('EC-123', 'ORD-001-1234567890');

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('Already cancelled');
    });

    it('should handle network error', async () => {
      (global.fetch as jest.Mock).mockReset();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockLoginResponse),
        })
        .mockRejectedValueOnce(new Error('Connection timeout'));

      const result = await service.cancelQr('EC-123', 'ORD-001-1234567890');

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('Connection timeout');
    });
  });

  describe('inquiryReceivables', () => {
    const mockLoginResponse = {
      responseCd: '000000',
      responseMsg: 'Success',
      responseTs: '2024-01-01T00:00:00Z',
      responseTraceId: 'trace-123',
      data: {
        accessToken: 'access-token-123',
        refreshIdx: 1,
      },
    } as InfocmsBaseResponse;

    const mockInquiryResponse = {
      responseCd: '000000',
      responseMsg: 'Success',
      responseTs: '2024-01-01T00:00:00Z',
      responseTraceId: 'trace-inquiry',
      data: [
        {
          receivableId: 'RCV-001',
          motherAccntNo: '123456789',
          ecollectionCd: 'EC-123',
          receivableAmt: 100000,
          paidYn: 'Y',
        },
      ],
    } as unknown as InfocmsBaseResponse;

    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockLoginResponse),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockInquiryResponse),
        });
    });

    it('should inquiry receivables successfully', async () => {
      const result = await service.inquiryReceivables('EC-123');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].ecollectionCd).toBe('EC-123');
      expect(result.data![0].paidYn).toBe('Y');
    });

    it('should use default paidYn=A when not specified', async () => {
      await service.inquiryReceivables('EC-123');

      const inquiryCall = (global.fetch as jest.Mock).mock.calls.find((call) =>
        call[0].includes('/ec/po_inquiry_eccode_recv'),
      );
      const body = JSON.parse(inquiryCall[1].body);

      expect(body.data.paidYn).toBe('A');
    });

    it('should accept custom paidYn option', async () => {
      await service.inquiryReceivables('EC-123', { paidYn: 'Y' });

      const inquiryCall = (global.fetch as jest.Mock).mock.calls.find((call) =>
        call[0].includes('/ec/po_inquiry_eccode_recv'),
      );
      const body = JSON.parse(inquiryCall[1].body);

      expect(body.data.paidYn).toBe('Y');
    });

    it('should accept transId option', async () => {
      await service.inquiryReceivables('EC-123', { transId: 'TRANS-123' });

      const inquiryCall = (global.fetch as jest.Mock).mock.calls.find((call) =>
        call[0].includes('/ec/po_inquiry_eccode_recv'),
      );
      const body = JSON.parse(inquiryCall[1].body);

      expect(body.data.transId).toBe('TRANS-123');
    });

    it('should accept transactionUuid option', async () => {
      await service.inquiryReceivables('EC-123', {
        transactionUuid: 'ORD-001-1234567890',
      });

      const inquiryCall = (global.fetch as jest.Mock).mock.calls.find((call) =>
        call[0].includes('/ec/po_inquiry_eccode_recv'),
      );
      const body = JSON.parse(inquiryCall[1].body);

      expect(body.data.transactionUuid).toBe('ORD-001-1234567890');
    });

    it('should handle API error response', async () => {
      const errorResponse = {
        responseCd: 'C00054',
        responseMsg: 'E-collection code does not exist',
        responseTs: '2024-01-01T00:00:00Z',
        responseTraceId: 'trace-error',
      };

      (global.fetch as jest.Mock).mockReset();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockLoginResponse),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(errorResponse),
        });

      const result = await service.inquiryReceivables('EC-INVALID');

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('E-collection code does not exist');
    });

    it('should handle network error', async () => {
      (global.fetch as jest.Mock).mockReset();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockLoginResponse),
        })
        .mockRejectedValueOnce(new Error('Timeout'));

      const result = await service.inquiryReceivables('EC-123');

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('Timeout');
    });
  });

  describe('processCallback', () => {
    const mockCallbackData: InfocmsCallbackData = {
      bankCd: 'BIDV',
      motherAccntNo: '123456789',
      ecollectionCd: 'EC-123',
      payerNo: 'PAYER-001',
      transId: 'TRANS-123',
      bankTransId: 'BANK-TRANS-456',
      depositAmt: 100000,
      depositDtm: '20240101120000',
      recvDtm: '20240101120100',
      transactionUuid: 'ORD-001-1234567890',
      posUniqueId: 'POS-001',
    };

    beforeEach(() => {
      // Mock extractOrderNumberFromTransactionUuid (not mocked globally)
      (extractOrderNumberFromTransactionUuid as jest.Mock).mockReturnValue(
        'ORD-001',
      );

      orderRepository.findByOrderNumber.mockResolvedValue(mockOrder as any);
      orderRepository.addPaymentEvent.mockResolvedValue({
        ...mockOrder,
        paymentStatus: PaymentStatus.PAID,
      } as any);
      orderRepository.update.mockResolvedValue({
        ...mockOrder,
        paymentStatus: PaymentStatus.PAID,
      } as any);
      checkoutPaymentHandler.handlePaymentSuccess.mockResolvedValue(
        undefined as any,
      );
    });

    it('should process callback successfully', async () => {
      const result = await service.processCallback(mockCallbackData);

      expect(result.success).toBe(true);
      expect(result.orderNumber).toBe('ORD-001');
      expect(result.message).toBe('Payment processed successfully');
    });

    it('should find order by orderNumber extracted from transactionUuid', async () => {
      await service.processCallback(mockCallbackData);

      expect(orderRepository.findByOrderNumber).toHaveBeenCalledWith('ORD-001');
    });

    it('should record payment success event', async () => {
      await service.processCallback(mockCallbackData);

      expect(orderRepository.addPaymentEvent).toHaveBeenCalledWith(
        'order-123',
        {
          status: PaymentEventStatus.SUCCESS,
          timestamp: expect.any(Date),
          amount: 100000,
          ref: 'TRANS-123',
        },
      );
    });

    it('should update order with InfoCMS transaction IDs', async () => {
      await service.processCallback(mockCallbackData);

      expect(orderRepository.update).toHaveBeenCalledWith('order-123', {
        infocms: {
          transactionUuid: 'ORD-001-1234567890',
          ecollectionCd: 'EC-123',
          transId: 'TRANS-123',
          bankTransId: 'BANK-TRANS-456',
        },
      });
    });

    it('should call handlePaymentSuccess', async () => {
      await service.processCallback(mockCallbackData);

      expect(checkoutPaymentHandler.handlePaymentSuccess).toHaveBeenCalledWith({
        ...mockOrder,
        paymentStatus: PaymentStatus.PAID,
      });
    });

    it('should return error when transactionUuid format is invalid', async () => {
      (extractOrderNumberFromTransactionUuid as jest.Mock).mockReturnValue(
        null,
      );

      const result = await service.processCallback({
        ...mockCallbackData,
        transactionUuid: 'INVALID',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid transaction UUID format');
    });

    it('should return error when order not found', async () => {
      orderRepository.findByOrderNumber.mockResolvedValue(null);

      const result = await service.processCallback(mockCallbackData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Order not found');
    });

    it('should skip processing if order already processed', async () => {
      orderRepository.findByOrderNumber.mockResolvedValue({
        ...mockOrder,
        paymentStatus: PaymentStatus.PAID,
      } as any);

      const result = await service.processCallback(mockCallbackData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Order already processed');
      expect(orderRepository.addPaymentEvent).not.toHaveBeenCalled();
    });

    it('should log warning when amount mismatch but still process', async () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      await service.processCallback({
        ...mockCallbackData,
        depositAmt: 50000, // Different amount
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Amount mismatch'),
      );
      expect(orderRepository.addPaymentEvent).toHaveBeenCalled();
    });

    it('should return error when addPaymentEvent fails', async () => {
      orderRepository.addPaymentEvent.mockResolvedValue(null);

      const result = await service.processCallback(mockCallbackData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update order');
    });

    it('should handle handlePaymentSuccess error gracefully', async () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      checkoutPaymentHandler.handlePaymentSuccess.mockRejectedValue(
        new Error('Post-payment error'),
      );

      const result = await service.processCallback(mockCallbackData);

      // Should still return success since payment was recorded
      expect(result.success).toBe(true);

      // Wait for async error handler
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to handle payment success'),
      );
    });
  });

  describe('getCallbackUrl', () => {
    it('should return correct callback URL', () => {
      const url = service.getCallbackUrl();

      expect(url).toBe(
        'https://api.example.com/api/v1/webhooks/infocms/callback',
      );
    });

    it('should use backend domain from config', () => {
      configService.getOrThrow.mockReturnValue('https://custom.domain.com');

      const newService = new InfocmsService(
        configService,
        orderRepository,
        checkoutPaymentHandler,
      );

      const url = newService.getCallbackUrl();

      expect(url).toContain('https://custom.domain.com');
    });
  });

  describe('token management', () => {
    const mockLoginResponse = {
      responseCd: '000000',
      responseMsg: 'Success',
      responseTs: '2024-01-01T00:00:00Z',
      responseTraceId: 'trace-123',
      data: {
        accessToken: 'new-access-token',
        refreshIdx: 2,
      },
    } as InfocmsBaseResponse;

    const mockRefreshResponse = {
      responseCd: '000000',
      responseMsg: 'Success',
      responseTs: '2024-01-01T00:00:00Z',
      responseTraceId: 'trace-refresh',
      data: {
        accessToken: 'refreshed-access-token',
        refreshIdx: 3,
      },
    } as InfocmsBaseResponse;

    it('should cache access token and reuse it', async () => {
      const mockCancelResponse = {
        responseCd: '000000',
        responseMsg: 'Success',
        responseTs: '2024-01-01T00:00:00Z',
        responseTraceId: 'trace-cancel',
      };

      // First call - login
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockLoginResponse),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockCancelResponse),
        })
        // Second call - should reuse token, no login
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockCancelResponse),
        });

      await service.cancelQr('EC-1', 'UUID-1');
      await service.cancelQr('EC-2', 'UUID-2');

      // Should only login once
      const loginCalls = (global.fetch as jest.Mock).mock.calls.filter((call) =>
        call[0].includes('/auth/login'),
      );
      expect(loginCalls).toHaveLength(1);
    });

    it('should refresh token when expired', async () => {
      const mockCancelResponse = {
        responseCd: '000000',
        responseMsg: 'Success',
        responseTs: '2024-01-01T00:00:00Z',
        responseTraceId: 'trace-cancel',
      };

      // First call - login
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockLoginResponse),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockCancelResponse),
        });

      await service.cancelQr('EC-1', 'UUID-1');

      // Wait for token to expire (simulate by advancing time)
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 4000000); // 66+ minutes

      // Next call should refresh token
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockRefreshResponse),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockCancelResponse),
        });

      await service.cancelQr('EC-2', 'UUID-2');

      const refreshCalls = (global.fetch as jest.Mock).mock.calls.filter(
        (call) => call[0].includes('/auth/refresh'),
      );
      expect(refreshCalls).toHaveLength(1);

      jest.spyOn(Date, 'now').mockRestore();
    });

    it('should login again when refresh token fails', async () => {
      const mockCancelResponse = {
        responseCd: '000000',
        responseMsg: 'Success',
        responseTs: '2024-01-01T00:00:00Z',
        responseTraceId: 'trace-cancel',
      };

      // First call - login
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockLoginResponse),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockCancelResponse),
        });

      await service.cancelQr('EC-1', 'UUID-1');

      // Wait for token to expire
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 4000000);

      // Refresh fails, should login again
      const mockRefreshError = {
        responseCd: '999999',
        responseMsg: 'Refresh failed',
        responseTs: '2024-01-01T00:00:00Z',
        responseTraceId: 'trace-error',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockRefreshError),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockLoginResponse),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockCancelResponse),
        });

      await service.cancelQr('EC-2', 'UUID-2');

      const loginCalls = (global.fetch as jest.Mock).mock.calls.filter((call) =>
        call[0].includes('/auth/login'),
      );
      expect(loginCalls).toHaveLength(2); // Original + retry after refresh failure

      jest.spyOn(Date, 'now').mockRestore();
    });

    it('should return error when login fails', async () => {
      const mockLoginError = {
        responseCd: '999999',
        responseMsg: 'Login failed',
        responseTs: '2024-01-01T00:00:00Z',
        responseTraceId: 'trace-error',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockLoginError),
      });

      const result = await service.cancelQr('EC-1', 'UUID-1');
      expect(result.success).toBe(false);
      expect(result.errorMessage).toBeTruthy();
    });

    it('should return error when login succeeds but no access token', async () => {
      const mockLoginNoToken = {
        responseCd: '000000',
        responseMsg: 'Success',
        responseTs: '2024-01-01T00:00:00Z',
        responseTraceId: 'trace-login',
        data: {
          accessToken: null, // No token
          refreshIdx: 1,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockLoginNoToken),
      });

      const result = await service.cancelQr('EC-1', 'UUID-1');
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain(
        'Failed to obtain InfoCMS access token',
      );
    });

    it('should handle network error during refresh', async () => {
      const mockCancelResponse = {
        responseCd: '000000',
        responseMsg: 'Success',
        responseTs: '2024-01-01T00:00:00Z',
        responseTraceId: 'trace-cancel',
      };

      // First call - login
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockLoginResponse),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockCancelResponse),
        });

      await service.cancelQr('EC-1', 'UUID-1');

      // Wait for token to expire
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 4000000);

      // Refresh throws network error, should login again
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockLoginResponse),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockCancelResponse),
        });

      await service.cancelQr('EC-2', 'UUID-2');

      const loginCalls = (global.fetch as jest.Mock).mock.calls.filter((call) =>
        call[0].includes('/auth/login'),
      );
      expect(loginCalls).toHaveLength(2);

      jest.spyOn(Date, 'now').mockRestore();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete payment flow from QR creation to callback', async () => {
      const mockLoginResponse = {
        responseCd: '000000',
        responseMsg: 'Success',
        responseTs: '2024-01-01T00:00:00Z',
        responseTraceId: 'trace-login',
        data: {
          accessToken: 'access-token',
          refreshIdx: 1,
        } as unknown as InfocmsLoginData,
      };

      const mockCreateQrResponse = {
        responseCd: '000000',
        responseMsg: 'Success',
        responseTs: '2024-01-01T00:00:00Z',
        responseTraceId: 'trace-qr',
        data: {
          qrUrl: 'https://qr.example.com/qr123',
          qrData: 'QR_DATA',
          transactionUuid: 'ORD-001-1234567890',
          ecollectionCd: 'EC-123',
          motherAccountNo: '123456789',
          accountHolderNm: 'Test',
        } as unknown as InfocmsCreateQrData,
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockLoginResponse),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockCreateQrResponse),
        });

      orderRepository.addPaymentEvent.mockResolvedValue(mockOrder as any);
      orderRepository.findByOrderNumber.mockResolvedValue(mockOrder as any);
      checkoutPaymentHandler.handlePaymentSuccess.mockResolvedValue(
        undefined as any,
      );

      (extractOrderNumberFromTransactionUuid as jest.Mock).mockReturnValue(
        'ORD-001',
      );

      // 1. Create QR
      const qrResult = await service.createPaymentQr(mockOrder as any);
      expect(qrResult.success).toBe(true);

      // 2. Process callback
      const callbackResult = await service.processCallback({
        bankCd: 'BIDV',
        motherAccntNo: '123456789',
        ecollectionCd: 'EC-123',
        payerNo: 'PAYER-001',
        transId: 'TRANS-123',
        bankTransId: 'BANK-TRANS-456',
        depositAmt: 100000,
        depositDtm: '20240101120000',
        recvDtm: '20240101120100',
        transactionUuid: 'ORD-001-1234567890',
        posUniqueId: 'POS-001',
      });

      expect(callbackResult.success).toBe(true);
      expect(callbackResult.orderNumber).toBe('ORD-001');
    });
  });
});
