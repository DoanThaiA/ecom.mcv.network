import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { DepotsService } from '../../src/depots/depots.service';
import { DepotRepository } from '../../src/depots/domain/depot.repository';
import { NhanhAuthService } from '../../src/nhanh/services/nhanh-auth.service';
import { Depot } from '../../src/depots/domain/depot';

describe('DepotsService', () => {
  let service: DepotsService;
  let depotRepository: jest.Mocked<DepotRepository>;
  let nhanhAuthService: jest.Mocked<NhanhAuthService>;
  let i18n: jest.Mocked<I18nService>;

  const mockDepot: Depot = {
    id: 'depot-123',
    businessId: '110668',
    source: 'nhanh',
    name: 'Main Warehouse',
    phone: '0901234567',
    address: '123 Nguyen Hue',
    cityId: 50,
    districtId: 500,
    wardId: 5000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDepot2: Depot = {
    id: 'depot-456',
    businessId: '110668',
    source: 'nhanh',
    name: 'Secondary Warehouse',
    phone: '0907654321',
    address: '456 Le Loi',
    cityId: 50,
    districtId: 501,
    wardId: 5001,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockDepotRepository = {
      findAllByBusiness: jest.fn(),
      findById: jest.fn(),
    };

    const mockNhanhAuthService = {
      getAccessToken: jest.fn(),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepotsService,
        { provide: DepotRepository, useValue: mockDepotRepository },
        { provide: NhanhAuthService, useValue: mockNhanhAuthService },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<DepotsService>(DepotsService);
    depotRepository = module.get(DepotRepository);
    nhanhAuthService = module.get(NhanhAuthService);
    i18n = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all depots for business', async () => {
      const tokenData = { businessId: 110668 };
      nhanhAuthService.getAccessToken.mockResolvedValue(tokenData as any);
      depotRepository.findAllByBusiness.mockResolvedValue([
        mockDepot,
        mockDepot2,
      ]);

      const result = await service.findAll();

      expect(result).toEqual([mockDepot, mockDepot2]);
      expect(result).toHaveLength(2);
      expect(nhanhAuthService.getAccessToken).toHaveBeenCalled();
      expect(depotRepository.findAllByBusiness).toHaveBeenCalledWith('110668');
    });

    it('should return empty array when no depots exist', async () => {
      const tokenData = { businessId: 110668 };
      nhanhAuthService.getAccessToken.mockResolvedValue(tokenData as any);
      depotRepository.findAllByBusiness.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw error when not connected to Nhanh', async () => {
      nhanhAuthService.getAccessToken.mockResolvedValue(null);

      await expect(service.findAll()).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
      });

      expect(i18n.t).toHaveBeenCalledWith('nhanh.notConnected');
      expect(depotRepository.findAllByBusiness).not.toHaveBeenCalled();
    });

    it('should throw error when token has no businessId', async () => {
      nhanhAuthService.getAccessToken.mockResolvedValue({} as any);

      await expect(service.findAll()).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should return depot by id', async () => {
      depotRepository.findById.mockResolvedValue(mockDepot);

      const result = await service.findById('depot-123');

      expect(result).toEqual(mockDepot);
      expect(depotRepository.findById).toHaveBeenCalledWith('depot-123');
    });

    it('should throw error when depot not found', async () => {
      depotRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18n.t).toHaveBeenCalledWith('depot.notFound');
    });
  });
});
