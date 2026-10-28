import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { OnepayService } from '../../../src/payment/onepay/onepay.service';
import { OrderRepository } from '../../../src/shop/order/domain/order.repository';
import { CheckoutPaymentHandlerService } from '../../../src/shop/checkout/checkout-payment-handler.service';
import {
  PaymentMethod,
  PaymentStatus,
} from '../../../src/shop/order/domain/order.enums';
import { PaymentEventStatus } from '../../../src/shop/order/domain/order';
import * as OnepayUtils from '../../../src/payment/onepay/onepay.utils';
import {
  generateMerchTxnRef,
  generateSecureHash,
  extractOrderNumber,
  verifySecureHash,
} from '../../../src/payment/onepay/onepay.utils';

// Mock utilities
jest.mock('../../../src/payment/onepay/onepay.utils', () => ({
  ...jest.requireActual('../../../src/payment/onepay/onepay.utils'),
  generateMerchTxnRef: jest.fn(),
  generateSecureHash: jest.fn(),
  verifySecureHash: jest.fn(),
  extractOrderNumber: jest.fn(),
}));

describe('OnepayService', () => {
  let service: OnepayService;
  let configService: jest.Mocked<ConfigService>;
  let orderRepository: jest.Mocked<OrderRepository>;
  let checkoutPaymentHandler: jest.Mocked<CheckoutPaymentHandlerService>;

  const mockConfig = {
    merchantId: 'MERCHANT123',
    accessCode: 'ACCESS123',
    hashCode: 'HASH123',
    backendDomain: 'https://api.example.com',
    websiteDomain: 'https://shop.example.com',
  };

  const mockOrder = {
    id: 'order-123',
    orderNumber: 'ORD-001',
    total: 250000,
    paymentMethod: PaymentMethod.ONEPAY_DOMESTIC,
    paymentStatus: PaymentStatus.PENDING,
  };

  beforeEach(async () => {
    // Setup config mock implementation before module creation
    const mockConfigGetOrThrow = jest.fn().mockImplementation((key: string) => {
      const keyMap: Record<string, string> = {
        'onepay.merchantId': mockConfig.merchantId,
        'onepay.accessCode': mockConfig.accessCode,
        'onepay.hashCode': mockConfig.hashCode,
        'app.backendDomain': mockConfig.backendDomain,
        'app.websiteDomain': mockConfig.websiteDomain,
      };
      return keyMap[key];
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnepayService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: mockConfigGetOrThrow,
          },
        },
        {
          provide: OrderRepository,
          useValue: {
            findByOrderNumber: jest.fn(),
            addPaymentEvent: jest.fn(),
          },
        },
        {
          provide: CheckoutPaymentHandlerService,
          useValue: {
            handlePaymentSuccess: jest.fn(),
            handlePaymentFailed: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OnepayService>(OnepayService);
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
    (generateMerchTxnRef as jest.Mock).mockReturnValue('ORD-001-1234567890');
    (generateSecureHash as jest.Mock).mockReturnValue(
      'ABC123DEF456789SECURE_HASH',
    );
    (verifySecureHash as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentUrl', () => {
    beforeEach(() => {
      orderRepository.addPaymentEvent.mockResolvedValue(mockOrder as any);
    });

    it('should create payment URL with all required parameters', async () => {
      const url = await service.createPaymentUrl(
        mockOrder as any,
        '192.168.1.1',
      );

      expect(url).toContain('https://mtf.onepay.vn/paygate/vpcpay.op?');
      expect(url).toContain('vpc_Merchant=MERCHANT123');
      expect(url).toContain('vpc_AccessCode=ACCESS123');
      expect(url).toContain('vpc_Amount=25000000'); // 250000 * 100
      expect(url).toContain('vpc_MerchTxnRef=ORD-001-1234567890');
      expect(url).toContain('vpc_TicketNo=192.168.1.1');
      expect(url).toContain('vpc_SecureHash=ABC123DEF456789SECURE_HASH');
    });

    it('should use DOMESTIC card list for domestic payment method', async () => {
      const order = {
        ...mockOrder,
        paymentMethod: PaymentMethod.ONEPAY_DOMESTIC,
      };

      const url = await service.createPaymentUrl(order as any, '192.168.1.1');

      expect(url).toContain('vpc_CardList=DOMESTIC');
    });

    it('should use INTERCARD card list for international payment method', async () => {
      const order = {
        ...mockOrder,
        paymentMethod: PaymentMethod.ONEPAY_INTERCARD,
      };

      const url = await service.createPaymentUrl(order as any, '192.168.1.1');

      expect(url).toContain('vpc_CardList=INTERCARD');
    });

    it('should use both card types for other payment methods', async () => {
      const order = {
        ...mockOrder,
        paymentMethod: PaymentMethod.COD, // Not OnePay method
      };

      const url = await service.createPaymentUrl(order as any, '192.168.1.1');

      expect(url).toContain('vpc_CardList=INTERCARD%2CDOMESTIC'); // URL encoded
    });

    it('should include return URL pointing to backend', async () => {
      const url = await service.createPaymentUrl(
        mockOrder as any,
        '192.168.1.1',
      );

      expect(url).toContain(
        'vpc_ReturnURL=https%3A%2F%2Fapi.example.com%2Fapi%2Fv1%2Fshop%2Fpayment%2Fonepay%2Freturn',
      );
    });

    it('should use default locale when not provided', async () => {
      const url = await service.createPaymentUrl(
        mockOrder as any,
        '192.168.1.1',
      );

      expect(url).toContain('vpc_Locale=vn');
    });

    it('should use custom locale when provided', async () => {
      const url = await service.createPaymentUrl(
        mockOrder as any,
        '192.168.1.1',
        'en',
      );

      expect(url).toContain('vpc_Locale=en');
    });

    it('should record payment initiated event', async () => {
      await service.createPaymentUrl(mockOrder as any, '192.168.1.1');

      expect(orderRepository.addPaymentEvent).toHaveBeenCalledWith(
        'order-123',
        {
          status: PaymentEventStatus.INITIATED,
          timestamp: expect.any(Date),
          amount: 250000,
          ref: 'ORD-001-1234567890',
        },
      );
    });

    it('should round order total to cents', async () => {
      const orderWithDecimal = {
        ...mockOrder,
        total: 123456.789,
      };

      const url = await service.createPaymentUrl(
        orderWithDecimal as any,
        '192.168.1.1',
      );

      expect(url).toContain('vpc_Amount=12345679'); // 123457 * 100 (rounded)
    });

    it('should generate merchant transaction reference', async () => {
      await service.createPaymentUrl(mockOrder as any, '192.168.1.1');

      expect(generateMerchTxnRef).toHaveBeenCalledWith('ORD-001');
    });

    it('should generate secure hash with all vpc_ parameters', async () => {
      await service.createPaymentUrl(mockOrder as any, '192.168.1.1');

      expect(generateSecureHash).toHaveBeenCalledWith(
        expect.objectContaining({
          vpc_Version: expect.any(String),
          vpc_Currency: expect.any(String),
          vpc_Command: expect.any(String),
          vpc_AccessCode: 'ACCESS123',
          vpc_Merchant: 'MERCHANT123',
          vpc_Locale: 'vn',
          vpc_MerchTxnRef: 'ORD-001-1234567890',
          vpc_Amount: '25000000',
          vpc_TicketNo: '192.168.1.1',
          vpc_CardList: 'DOMESTIC',
        }),
        'HASH123',
      );
    });
  });

  describe('processIpnCallback', () => {
    const mockIpnParams = {
      vpc_MerchTxnRef: 'ORD-001-1234567890',
      vpc_TxnResponseCode: '0',
      vpc_Amount: '25000000',
      vpc_TransactionNo: 'TXN-123',
      vpc_Message: 'Transaction successful',
      vpc_SecureHash: 'VALID_HASH',
    };

    beforeEach(() => {
      // Mock extractOrderNumber directly from actual implementation
      (extractOrderNumber as jest.Mock).mockReturnValue('ORD-001');

      orderRepository.findByOrderNumber.mockResolvedValue(mockOrder as any);
      orderRepository.addPaymentEvent.mockResolvedValue({
        ...mockOrder,
        paymentStatus: PaymentStatus.PAID,
      } as any);
      checkoutPaymentHandler.handlePaymentSuccess.mockResolvedValue(
        undefined as any,
      );
      checkoutPaymentHandler.handlePaymentFailed.mockReturnValue(
        undefined as any,
      );
    });

    it('should process successful payment callback', async () => {
      const result = await service.processIpnCallback(mockIpnParams);

      expect(result.success).toBe(true);
      expect(result.orderNumber).toBe('ORD-001');
      expect(result.message).toBe('Payment successful');
    });

    it('should verify secure hash', async () => {
      await service.processIpnCallback(mockIpnParams);

      expect(verifySecureHash).toHaveBeenCalledWith(mockIpnParams, 'HASH123');
    });

    it('should return error when secure hash is invalid', async () => {
      (verifySecureHash as jest.Mock).mockReturnValue(false);

      const result = await service.processIpnCallback(mockIpnParams);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid secure hash');
    });

    it('should extract order number from merchant transaction reference', async () => {
      await service.processIpnCallback(mockIpnParams);

      expect(extractOrderNumber).toHaveBeenCalledWith('ORD-001-1234567890');
    });

    it('should return error when order number cannot be extracted', async () => {
      (extractOrderNumber as jest.Mock).mockReturnValue(null);

      const result = await service.processIpnCallback(mockIpnParams);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid merchant transaction reference');
    });

    it('should return error when order not found', async () => {
      orderRepository.findByOrderNumber.mockResolvedValue(null);

      const result = await service.processIpnCallback(mockIpnParams);

      expect(result.success).toBe(false);
      expect(result.orderNumber).toBe('ORD-001');
      expect(result.message).toBe('Order not found');
    });

    it('should skip processing if order already processed', async () => {
      orderRepository.findByOrderNumber.mockResolvedValue({
        ...mockOrder,
        paymentStatus: PaymentStatus.PAID,
      } as any);

      const result = await service.processIpnCallback(mockIpnParams);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Order already processed');
      expect(orderRepository.addPaymentEvent).not.toHaveBeenCalled();
    });

    it('should record payment success event for successful transaction', async () => {
      await service.processIpnCallback(mockIpnParams);

      expect(orderRepository.addPaymentEvent).toHaveBeenCalledWith(
        'order-123',
        {
          status: PaymentEventStatus.SUCCESS,
          timestamp: expect.any(Date),
          amount: 250000, // 25000000 / 100
          ref: 'TXN-123',
          code: '0',
          message: 'Transaction successful',
        },
      );
    });

    it('should record payment failed event for failed transaction', async () => {
      const failedParams = {
        ...mockIpnParams,
        vpc_TxnResponseCode: '99',
        vpc_Message: 'Transaction failed',
      };

      orderRepository.addPaymentEvent.mockResolvedValue({
        ...mockOrder,
        paymentStatus: PaymentStatus.FAILED,
      } as any);

      await service.processIpnCallback(failedParams);

      expect(orderRepository.addPaymentEvent).toHaveBeenCalledWith(
        'order-123',
        {
          status: PaymentEventStatus.FAILED,
          timestamp: expect.any(Date),
          amount: 250000,
          ref: 'TXN-123',
          code: '99',
          message: 'Transaction failed',
        },
      );
    });

    it('should call handlePaymentSuccess for successful transaction', async () => {
      const updatedOrder = {
        ...mockOrder,
        paymentStatus: PaymentStatus.PAID,
      };

      orderRepository.addPaymentEvent.mockResolvedValue(updatedOrder as any);

      await service.processIpnCallback(mockIpnParams);

      expect(checkoutPaymentHandler.handlePaymentSuccess).toHaveBeenCalledWith(
        updatedOrder,
      );
    });

    it('should call handlePaymentFailed for failed transaction', async () => {
      const failedParams = {
        ...mockIpnParams,
        vpc_TxnResponseCode: '99',
      };

      const updatedOrder = {
        ...mockOrder,
        paymentStatus: PaymentStatus.FAILED,
      };

      orderRepository.addPaymentEvent.mockResolvedValue(updatedOrder as any);

      await service.processIpnCallback(failedParams);

      expect(checkoutPaymentHandler.handlePaymentFailed).toHaveBeenCalledWith(
        updatedOrder,
      );
    });

    it('should handle handlePaymentSuccess error gracefully', async () => {
      checkoutPaymentHandler.handlePaymentSuccess.mockRejectedValue(
        new Error('Post-payment error'),
      );

      const result = await service.processIpnCallback(mockIpnParams);

      // Should still return success since payment was recorded
      expect(result.success).toBe(true);

      // Wait for async error handler
      await new Promise((resolve) => setTimeout(resolve, 100));

      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to handle payment success'),
      );
    });

    it('should return error when addPaymentEvent fails', async () => {
      orderRepository.addPaymentEvent.mockResolvedValue(null);

      const result = await service.processIpnCallback(mockIpnParams);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update order');
    });

    it('should handle amount parsing correctly', async () => {
      const paramsWithAmount = {
        ...mockIpnParams,
        vpc_Amount: '12345600', // 123456.00
      };

      await service.processIpnCallback(paramsWithAmount);

      expect(orderRepository.addPaymentEvent).toHaveBeenCalledWith(
        'order-123',
        expect.objectContaining({
          amount: 123456, // Converted from cents
        }),
      );
    });

    it('should handle missing amount parameter', async () => {
      const paramsWithoutAmount = {
        ...mockIpnParams,
        vpc_Amount: undefined as any,
      };
      delete paramsWithoutAmount.vpc_Amount;

      await service.processIpnCallback(paramsWithoutAmount);

      expect(orderRepository.addPaymentEvent).toHaveBeenCalledWith(
        'order-123',
        expect.objectContaining({
          amount: null,
        }),
      );
    });

    it('should return failure message with response code for failed transaction', async () => {
      const failedParams = {
        ...mockIpnParams,
        vpc_TxnResponseCode: '05',
        vpc_Message: 'Insufficient funds',
      };

      orderRepository.addPaymentEvent.mockResolvedValue({
        ...mockOrder,
        paymentStatus: PaymentStatus.FAILED,
      } as any);

      const result = await service.processIpnCallback(failedParams);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Payment failed with code: 05');
    });
  });

  describe('verifyReturnParams', () => {
    it('should verify valid return parameters', () => {
      const params = {
        vpc_MerchTxnRef: 'ORD-001-1234567890',
        vpc_TxnResponseCode: '0',
        vpc_Message: 'Success',
        vpc_SecureHash: 'VALID_HASH',
      };

      // Mock extractOrderNumber
      (extractOrderNumber as jest.Mock).mockReturnValue('ORD-001');

      const result = service.verifyReturnParams(params);

      expect(result.valid).toBe(true);
      expect(result.orderNumber).toBe('ORD-001');
      expect(result.success).toBe(true);
      expect(result.responseCode).toBe('0');
      expect(result.message).toBe('Success');
    });

    it('should verify secure hash', () => {
      const params = {
        vpc_MerchTxnRef: 'ORD-001-1234567890',
        vpc_TxnResponseCode: '0',
        vpc_SecureHash: 'VALID_HASH',
      };

      service.verifyReturnParams(params);

      expect(verifySecureHash).toHaveBeenCalledWith(params, 'HASH123');
    });

    it('should return invalid when secure hash fails', () => {
      (verifySecureHash as jest.Mock).mockReturnValue(false);

      const params = {
        vpc_MerchTxnRef: 'ORD-001-1234567890',
        vpc_TxnResponseCode: '0',
        vpc_SecureHash: 'INVALID_HASH',
      };

      const result = service.verifyReturnParams(params);

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid signature');
    });

    it('should extract order number from merchTxnRef', () => {
      const params = {
        vpc_MerchTxnRef: 'ORD-001-1234567890',
        vpc_TxnResponseCode: '0',
        vpc_SecureHash: 'VALID_HASH',
      };

      (extractOrderNumber as jest.Mock).mockReturnValue('ORD-001');

      const result = service.verifyReturnParams(params);

      expect(result.orderNumber).toBe('ORD-001');
    });

    it('should return undefined orderNumber when extraction fails', () => {
      const params = {
        vpc_MerchTxnRef: 'INVALID',
        vpc_TxnResponseCode: '0',
        vpc_SecureHash: 'VALID_HASH',
      };

      (extractOrderNumber as jest.Mock).mockReturnValue(null);

      const result = service.verifyReturnParams(params);

      expect(result.orderNumber).toBeUndefined();
    });

    it('should return success=true for response code 0', () => {
      const params = {
        vpc_MerchTxnRef: 'ORD-001-1234567890',
        vpc_TxnResponseCode: '0',
        vpc_SecureHash: 'VALID_HASH',
      };

      const result = service.verifyReturnParams(params);

      expect(result.success).toBe(true);
    });

    it('should return success=false for non-zero response code', () => {
      const params = {
        vpc_MerchTxnRef: 'ORD-001-1234567890',
        vpc_TxnResponseCode: '99',
        vpc_SecureHash: 'VALID_HASH',
      };

      const result = service.verifyReturnParams(params);

      expect(result.success).toBe(false);
    });

    it('should include response code in result', () => {
      const params = {
        vpc_MerchTxnRef: 'ORD-001-1234567890',
        vpc_TxnResponseCode: '05',
        vpc_SecureHash: 'VALID_HASH',
      };

      const result = service.verifyReturnParams(params);

      expect(result.responseCode).toBe('05');
    });

    it('should include message in result when present', () => {
      const params = {
        vpc_MerchTxnRef: 'ORD-001-1234567890',
        vpc_TxnResponseCode: '0',
        vpc_Message: 'Payment successful',
        vpc_SecureHash: 'VALID_HASH',
      };

      const result = service.verifyReturnParams(params);

      expect(result.message).toBe('Payment successful');
    });

    it('should return undefined message when not present', () => {
      const params = {
        vpc_MerchTxnRef: 'ORD-001-1234567890',
        vpc_TxnResponseCode: '0',
        vpc_SecureHash: 'VALID_HASH',
      };

      const result = service.verifyReturnParams(params);

      expect(result.message).toBeUndefined();
    });
  });
});
