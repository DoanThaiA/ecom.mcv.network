import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ShippingService } from '../../../src/shop/shipping/shipping.service';
import { ProductRepository } from '../../../src/products/domain/product.repository';
import { DepotRepository } from '../../../src/depots/domain/depot.repository';
import { NhanhAuthService } from '../../../src/nhanh/services/nhanh-auth.service';
import { NhanhShippingService } from '../../../src/nhanh/services/nhanh-shipping.service';
import { CalculateShippingDto } from '../../../src/shop/shipping/dto/shipping.dto';

describe('ShippingService', () => {
  let service: ShippingService;
  let productRepository: jest.Mocked<ProductRepository>;
  let depotRepository: jest.Mocked<DepotRepository>;
  let nhanhAuthService: jest.Mocked<NhanhAuthService>;
  let nhanhShippingService: jest.Mocked<NhanhShippingService>;
  let i18n: jest.Mocked<I18nService>;

  const mockDepot = {
    id: 'depot-123',
    name: 'Hanoi Depot',
    cityId: 1,
    districtId: 10,
    wardId: 100,
    address: '123 Test Street',
    snapshot: { id: 1 },
  };

  const mockProduct = {
    id: 'product-123',
    name: 'Test Product',
    prices: { retail: 100000 },
    snapshot: { shipping: { weight: 500 } },
  };

  const mockShippingDto: CalculateShippingDto = {
    items: [
      {
        productId: 'product-123',
        quantity: 2,
      },
    ],
    shippingAddress: {
      cityId: 2,
      districtId: 20,
      wardId: 200,
      address: '456 Customer Street',
    },
  };

  // calculateShippingFee returns options for a single carrier (SPX preferred,
  // else Viettel) or the TVC fallback — mirror that with a single-carrier mock.
  const mockNhanhShippingResult = [
    {
      carrierId: 29,
      carrierName: 'SPX Express',
      carrierLogo: 'https://nhanh.vn/carriers/spx.png',
      serviceId: 0,
      serviceName: 'Giao tiêu chuẩn',
      serviceCode: 'STANDARD',
      customerShipFee: 28000,
      shipFee: 23000,
      codFee: 0,
      carrierType: 2 as const,
      accountId: 456,
      shopId: 'SHOP002',
    },
  ];

  beforeEach(async () => {
    const mockProductRepository = {
      findByIds: jest.fn(),
    };

    const mockDepotRepository = {
      findAllByBusiness: jest.fn(),
    };

    const mockNhanhAuthService = {
      getAccessToken: jest.fn(),
    };

    const mockNhanhShippingService = {
      calculateShippingFee: jest.fn(),
    };

    const mockI18nService = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippingService,
        { provide: ProductRepository, useValue: mockProductRepository },
        { provide: DepotRepository, useValue: mockDepotRepository },
        { provide: NhanhAuthService, useValue: mockNhanhAuthService },
        { provide: NhanhShippingService, useValue: mockNhanhShippingService },
        { provide: I18nService, useValue: mockI18nService },
      ],
    }).compile();

    service = module.get<ShippingService>(ShippingService);
    productRepository = module.get(ProductRepository);
    depotRepository = module.get(DepotRepository);
    nhanhAuthService = module.get(NhanhAuthService);
    nhanhShippingService = module.get(NhanhShippingService);
    i18n = module.get(I18nService);

    // Suppress logger output in tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateShipping', () => {
    beforeEach(() => {
      nhanhAuthService.getAccessToken.mockResolvedValue({
        businessId: 'business-123',
        accessToken: 'token',
      } as any);
      depotRepository.findAllByBusiness.mockResolvedValue([mockDepot] as any);
      productRepository.findByIds.mockResolvedValue([mockProduct] as any);
      nhanhShippingService.calculateShippingFee.mockResolvedValue(
        mockNhanhShippingResult,
      );
    });

    it('should calculate shipping fee successfully', async () => {
      const result = await service.calculateShipping(mockShippingDto);

      expect(result).toEqual({
        depot: {
          id: 1,
          name: 'Hanoi Depot',
        },
        items: [
          {
            productId: 'product-123',
            productName: 'Test Product',
            quantity: 2,
            weight: 500,
          },
        ],
        totalWeight: 1000, // 500 * 2
        totalValue: 200000, // 100000 * 2
        selectedCarrier: {
          carrierId: 29,
          carrierName: 'SPX Express',
          carrierLogo: 'https://nhanh.vn/carriers/spx.png',
          serviceId: 0,
          serviceName: 'Giao tiêu chuẩn',
          serviceCode: 'STANDARD',
          customerShipFee: 28000,
          shipFee: 23000,
          codFee: 0,
          carrierType: 2,
          accountId: 456,
          shopId: 'SHOP002',
        },
        totalShippingFee: 28000,
      });
    });

    it('should prefer SPX carrier when available', async () => {
      const result = await service.calculateShipping(mockShippingDto);

      expect(result.selectedCarrier.carrierId).toBe(29);
      expect(result.selectedCarrier.carrierName).toBe('SPX Express');
    });

    it('should select the SELF_SHIP (TVC) option when SPX is unavailable', async () => {
      // When SPX (29) has no rate, calculateShippingFee returns the TVC
      // fallback option; the selection picks it.
      nhanhShippingService.calculateShippingFee.mockResolvedValue([
        {
          carrierId: 12,
          carrierName: 'Tự Vận Chuyển',
          carrierLogo: '',
          serviceId: 25,
          serviceName: 'Chuyển Thường',
          serviceCode: '',
          customerShipFee: 0,
          shipFee: 0,
          codFee: 0,
          carrierType: 3 as const,
        },
      ]);

      const result = await service.calculateShipping(mockShippingDto);

      expect(result.selectedCarrier.carrierId).toBe(12);
      expect(result.selectedCarrier.carrierType).toBe(3);
    });

    it('should use default weight when product has no weight specified', async () => {
      const productWithoutWeight = {
        ...mockProduct,
        snapshot: {},
      };
      productRepository.findByIds.mockResolvedValue([
        productWithoutWeight,
      ] as any);

      await service.calculateShipping(mockShippingDto);

      expect(nhanhShippingService.calculateShippingFee).toHaveBeenCalledWith(
        expect.objectContaining({
          weight: 400, // DEFAULT_WEIGHT (200) * 2
        }),
      );
    });

    it('should calculate total weight correctly for multiple items', async () => {
      const multiItemDto: CalculateShippingDto = {
        ...mockShippingDto,
        items: [
          { productId: 'product-123', quantity: 2 },
          { productId: 'product-456', quantity: 3 },
        ],
      };
      const product2 = {
        id: 'product-456',
        name: 'Product 2',
        prices: { retail: 50000 },
        snapshot: { shipping: { weight: 300 } },
      };
      productRepository.findByIds.mockResolvedValue([
        mockProduct,
        product2,
      ] as any);

      const result = await service.calculateShipping(multiItemDto);

      expect(result.totalWeight).toBe(1900); // (500*2) + (300*3)
      expect(result.totalValue).toBe(350000); // (100000*2) + (50000*3)
    });

    it('should throw exception when product not found', async () => {
      productRepository.findByIds.mockResolvedValue([]);
      i18n.t.mockReturnValue('Product not found');

      await expect(
        service.calculateShipping(mockShippingDto),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('product.notFound');
    });

    it('should throw exception when no access token', async () => {
      nhanhAuthService.getAccessToken.mockResolvedValue(null);
      i18n.t.mockReturnValue('No access token');

      await expect(
        service.calculateShipping(mockShippingDto),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('nhanh.noAccessToken');
    });

    it('should throw exception when no depot found', async () => {
      depotRepository.findAllByBusiness.mockResolvedValue([]);
      i18n.t.mockReturnValue('Depot not found');

      await expect(
        service.calculateShipping(mockShippingDto),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('nhanh.depotNotFound');
    });

    it('should throw exception when depot missing cityId', async () => {
      const depotWithoutCity = { ...mockDepot, cityId: undefined };
      depotRepository.findAllByBusiness.mockResolvedValue([
        depotWithoutCity,
      ] as any);
      i18n.t.mockReturnValue('Depot not found');

      await expect(
        service.calculateShipping(mockShippingDto),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('nhanh.depotNotFound');
    });

    it('should throw exception when depot missing districtId', async () => {
      const depotWithoutDistrict = { ...mockDepot, districtId: undefined };
      depotRepository.findAllByBusiness.mockResolvedValue([
        depotWithoutDistrict,
      ] as any);
      i18n.t.mockReturnValue('Depot not found');

      await expect(
        service.calculateShipping(mockShippingDto),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('nhanh.depotNotFound');
    });

    it('should pass correct depot info to Nhanh shipping service', async () => {
      await service.calculateShipping(mockShippingDto);

      expect(nhanhShippingService.calculateShippingFee).toHaveBeenCalledWith({
        depot: mockDepot,
        destination: {
          cityId: 2,
          districtId: 20,
          wardId: 200,
          address: '456 Customer Street',
        },
        weight: 1000,
        orderValue: 200000,
      });
    });

    it('should handle multiple products in shipping calculation', async () => {
      const multiProductDto: CalculateShippingDto = {
        ...mockShippingDto,
        items: [
          { productId: 'product-1', quantity: 1 },
          { productId: 'product-2', quantity: 2 },
          { productId: 'product-3', quantity: 3 },
        ],
      };
      const products = [
        {
          id: 'product-1',
          name: 'Product 1',
          prices: { retail: 100000 },
          snapshot: { shipping: { weight: 200 } },
        },
        {
          id: 'product-2',
          name: 'Product 2',
          prices: { retail: 150000 },
          snapshot: { shipping: { weight: 300 } },
        },
        {
          id: 'product-3',
          name: 'Product 3',
          prices: { retail: 80000 },
          snapshot: { shipping: { weight: 250 } },
        },
      ];
      productRepository.findByIds.mockResolvedValue(products as any);

      const result = await service.calculateShipping(multiProductDto);

      expect(result.items).toHaveLength(3);
      expect(result.totalWeight).toBe(1550); // 200 + (300*2) + (250*3)
      expect(result.totalValue).toBe(640000); // 100000 + (150000*2) + (80000*3)
    });

    it('should log warning when no depot found', async () => {
      depotRepository.findAllByBusiness.mockResolvedValue([]);
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      await expect(
        service.calculateShipping(mockShippingDto),
      ).rejects.toThrow();
      expect(warnSpy).toHaveBeenCalledWith('No depot found for business');
    });

    it('should log warning when depot missing location info', async () => {
      const depotWithoutLocation = { ...mockDepot, cityId: undefined };
      depotRepository.findAllByBusiness.mockResolvedValue([
        depotWithoutLocation,
      ] as any);
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      await expect(
        service.calculateShipping(mockShippingDto),
      ).rejects.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('missing location info'),
      );
    });
  });

  describe('calculateFixedShipping', () => {
    beforeEach(() => {
      nhanhAuthService.getAccessToken.mockResolvedValue({
        businessId: 'business-123',
        accessToken: 'token',
      } as any);
      depotRepository.findAllByBusiness.mockResolvedValue([mockDepot] as any);
      productRepository.findByIds.mockResolvedValue([mockProduct] as any);
      nhanhShippingService.calculateShippingFee.mockResolvedValue(
        mockNhanhShippingResult,
      );
    });

    it('should apply fixed shipping fee for orders below threshold', async () => {
      // Order value: 200,000 VND (below 600,000 threshold)
      const result = await service.calculateFixedShipping(mockShippingDto);

      expect(result.totalShippingFee).toBe(30000);
      expect(result.selectedCarrier.customerShipFee).toBe(30000);
    });

    it('should apply fixed shipping fee for orders at or above 600k', async () => {
      // Create order with value >= 600,000 VND
      const highValueProduct = {
        ...mockProduct,
        prices: { retail: 300000 },
      };
      productRepository.findByIds.mockResolvedValue([highValueProduct] as any);

      const result = await service.calculateFixedShipping(mockShippingDto);

      // Order value: 600,000 VND (300,000 * 2) - fixed fee always applies
      expect(result.totalValue).toBe(600000);
      expect(result.totalShippingFee).toBe(30000);
      expect(result.selectedCarrier.customerShipFee).toBe(30000);
    });

    it('should apply fixed shipping fee for orders above 600k', async () => {
      const highValueProduct = {
        ...mockProduct,
        prices: { retail: 400000 },
      };
      productRepository.findByIds.mockResolvedValue([highValueProduct] as any);

      const result = await service.calculateFixedShipping(mockShippingDto);

      // Order value: 800,000 VND (400,000 * 2) - fixed fee always applies
      expect(result.totalValue).toBe(800000);
      expect(result.totalShippingFee).toBe(30000);
    });

    it('should charge fixed fee for orders just below threshold', async () => {
      const product = {
        ...mockProduct,
        prices: { retail: 299000 },
      };
      productRepository.findByIds.mockResolvedValue([product] as any);

      const result = await service.calculateFixedShipping(mockShippingDto);

      // Order value: 598,000 VND (299,000 * 2) - just below 600k
      expect(result.totalValue).toBe(598000);
      expect(result.totalShippingFee).toBe(30000);
    });

    it('should preserve all other shipping calculation details', async () => {
      const result = await service.calculateFixedShipping(mockShippingDto);

      expect(result.depot).toEqual({
        id: 1,
        name: 'Hanoi Depot',
      });
      expect(result.items).toHaveLength(1);
      expect(result.totalWeight).toBe(1000);
      expect(result.totalValue).toBe(200000);
      expect(result.selectedCarrier.carrierId).toBe(29);
    });

    it('should use calculateShipping internally', async () => {
      const calculateShippingSpy = jest.spyOn(service, 'calculateShipping');

      await service.calculateFixedShipping(mockShippingDto);

      expect(calculateShippingSpy).toHaveBeenCalledWith(mockShippingDto);
    });

    it('should handle errors from calculateShipping', async () => {
      productRepository.findByIds.mockResolvedValue([]);
      i18n.t.mockReturnValue('Product not found');

      await expect(
        service.calculateFixedShipping(mockShippingDto),
      ).rejects.toThrow();
    });

    it('should apply fixed shipping logic to multi-item orders', async () => {
      const multiItemDto: CalculateShippingDto = {
        ...mockShippingDto,
        items: [
          { productId: 'product-1', quantity: 5 },
          { productId: 'product-2', quantity: 2 },
        ],
      };
      const products = [
        {
          id: 'product-1',
          name: 'Product 1',
          prices: { retail: 80000 },
          snapshot: { shipping: { weight: 200 } },
        },
        {
          id: 'product-2',
          name: 'Product 2',
          prices: { retail: 100000 },
          snapshot: { shipping: { weight: 300 } },
        },
      ];
      productRepository.findByIds.mockResolvedValue(products as any);

      const result = await service.calculateFixedShipping(multiItemDto);

      // Total: (80000*5) + (100000*2) = 600,000 VND
      expect(result.totalValue).toBe(600000);
      expect(result.totalShippingFee).toBe(30000); // Fixed shipping fee
    });

    it('should charge fixed fee for multi-item orders below threshold', async () => {
      const multiItemDto: CalculateShippingDto = {
        ...mockShippingDto,
        items: [
          { productId: 'product-1', quantity: 2 },
          { productId: 'product-2', quantity: 1 },
        ],
      };
      const products = [
        {
          id: 'product-1',
          name: 'Product 1',
          prices: { retail: 100000 },
          snapshot: { shipping: { weight: 200 } },
        },
        {
          id: 'product-2',
          name: 'Product 2',
          prices: { retail: 150000 },
          snapshot: { shipping: { weight: 300 } },
        },
      ];
      productRepository.findByIds.mockResolvedValue(products as any);

      const result = await service.calculateFixedShipping(multiItemDto);

      // Total: (100000*2) + (150000*1) = 350,000 VND (below threshold)
      expect(result.totalValue).toBe(350000);
      expect(result.totalShippingFee).toBe(30000);
    });
  });
});
