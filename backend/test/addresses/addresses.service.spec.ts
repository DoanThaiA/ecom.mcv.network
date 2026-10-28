import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AddressesService } from '../../src/addresses/addresses.service';
import { AddressRepository } from '../../src/addresses/domain/address.repository';
import { Address } from '../../src/addresses/domain/address';
import * as addressesFixtures from '../../test/fixtures/addresses.json';

describe('AddressesService', () => {
  let service: AddressesService;
  let addressRepository: jest.Mocked<AddressRepository>;
  let i18n: jest.Mocked<I18nService>;

  const mockAddress: Address = {
    ...addressesFixtures.singleAddress,
    id: addressesFixtures.singleAddress._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserId = '6956a42daee8d523921d7051';

  beforeEach(async () => {
    const mockAddressRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findDefaultByUserId: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      setDefaultAddress: jest.fn(),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        { provide: AddressRepository, useValue: mockAddressRepository },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
    addressRepository = module.get(AddressRepository);
    i18n = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should return list of addresses for user', async () => {
      const addresses = addressesFixtures.addresses.map((a) => ({
        ...a,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      addressRepository.findByUserId.mockResolvedValue(addresses as any);

      const result = await service.findByUserId(mockUserId);

      expect(result).toEqual(addresses);
      expect(addressRepository.findByUserId).toHaveBeenCalledWith(mockUserId);
    });

    it('should return empty array when user has no addresses', async () => {
      addressRepository.findByUserId.mockResolvedValue([]);

      const result = await service.findByUserId(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('findDefaultByUserId', () => {
    it('should return default address for user', async () => {
      addressRepository.findDefaultByUserId.mockResolvedValue(
        mockAddress as any,
      );

      const result = await service.findDefaultByUserId(mockUserId);

      expect(result).toEqual(mockAddress);
      expect(addressRepository.findDefaultByUserId).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it('should return null when user has no default address', async () => {
      addressRepository.findDefaultByUserId.mockResolvedValue(null);

      const result = await service.findDefaultByUserId(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create address successfully', async () => {
      const createDto = {
        fullName: 'Test User',
        phone: '0901234567',
        email: 'test@example.com',
        street: '123 Test Street',
        cityId: 255,
        cityName: 'Hồ Chí Minh',
        districtId: 360,
        districtName: 'Quận Bình Thạnh',
        wardId: 10341,
        wardName: 'Phường 1',
        isDefault: false,
      };

      addressRepository.findDefaultByUserId.mockResolvedValue(null);
      addressRepository.create.mockResolvedValue(mockAddress as any);

      const result = await service.create(mockUserId, createDto);

      expect(result).toEqual(mockAddress);
      expect(addressRepository.create).toHaveBeenCalledWith({
        userId: mockUserId,
        ...createDto,
        isDefault: false,
      });
    });

    it('should unset existing default when creating new default address', async () => {
      const createDto = {
        fullName: 'Test User',
        phone: '0901234567',
        street: '123 Test Street',
        cityId: 255,
        cityName: 'Hồ Chí Minh',
        districtId: 360,
        districtName: 'Quận Bình Thạnh',
        wardId: 10341,
        wardName: 'Phường 1',
        isDefault: true,
      };

      const existingDefault = {
        ...mockAddress,
        id: 'existing-default-id',
      };

      addressRepository.findDefaultByUserId.mockResolvedValue(
        existingDefault as any,
      );
      addressRepository.create.mockResolvedValue(mockAddress as any);

      await service.create(mockUserId, createDto);

      expect(addressRepository.update).toHaveBeenCalledWith(
        existingDefault.id,
        { isDefault: false },
      );
      expect(addressRepository.create).toHaveBeenCalledWith({
        userId: mockUserId,
        ...createDto,
        isDefault: true,
      });
    });

    it('should default isDefault to false if not provided', async () => {
      const createDto = {
        fullName: 'Test User',
        phone: '0901234567',
        street: '123 Test Street',
        cityId: 255,
        cityName: 'Hồ Chí Minh',
        districtId: 360,
        districtName: 'Quận Bình Thạnh',
        wardId: 10341,
        wardName: 'Phường 1',
      };

      addressRepository.findDefaultByUserId.mockResolvedValue(null);
      addressRepository.create.mockResolvedValue(mockAddress as any);

      await service.create(mockUserId, createDto);

      expect(addressRepository.create).toHaveBeenCalledWith({
        userId: mockUserId,
        ...createDto,
        isDefault: false,
      });
    });
  });

  describe('update', () => {
    it('should update address successfully', async () => {
      const updateDto = {
        fullName: 'Updated Name',
        phone: '0987654321',
      };

      addressRepository.findById.mockResolvedValue(mockAddress as any);
      addressRepository.update.mockResolvedValue({
        ...mockAddress,
        ...updateDto,
      } as any);

      const result = await service.update(
        mockUserId,
        mockAddress.id,
        updateDto,
      );

      expect(result.fullName).toBe(updateDto.fullName);
      expect(addressRepository.update).toHaveBeenCalledWith(
        mockAddress.id,
        updateDto,
      );
    });

    it('should throw error when address not found', async () => {
      addressRepository.findById.mockResolvedValue(null);

      await expect(
        service.update(mockUserId, 'non-existent-id', { fullName: 'Test' }),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(addressRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when user does not own address', async () => {
      const otherUserAddress = {
        ...mockAddress,
        userId: 'other-user-id',
      };

      addressRepository.findById.mockResolvedValue(otherUserAddress as any);

      await expect(
        service.update(mockUserId, mockAddress.id, { fullName: 'Test' }),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });

      expect(addressRepository.update).not.toHaveBeenCalled();
    });

    it('should set address as default when isDefault is true', async () => {
      const updateDto = {
        isDefault: true,
      };

      addressRepository.findById.mockResolvedValue(mockAddress as any);
      addressRepository.update.mockResolvedValue({
        ...mockAddress,
        isDefault: true,
      } as any);

      await service.update(mockUserId, mockAddress.id, updateDto);

      expect(addressRepository.setDefaultAddress).toHaveBeenCalledWith(
        mockUserId,
        mockAddress.id,
      );
    });

    it('should throw error when update returns null', async () => {
      addressRepository.findById.mockResolvedValue(mockAddress as any);
      addressRepository.update.mockResolvedValue(null);

      await expect(
        service.update(mockUserId, mockAddress.id, { fullName: 'Test' }),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('remove', () => {
    it('should remove address successfully', async () => {
      addressRepository.findById.mockResolvedValue(mockAddress as any);

      await service.remove(mockUserId, mockAddress.id);

      expect(addressRepository.remove).toHaveBeenCalledWith(mockAddress.id);
    });

    it('should throw error when address not found', async () => {
      addressRepository.findById.mockResolvedValue(null);

      await expect(
        service.remove(mockUserId, 'non-existent-id'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(addressRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw error when user does not own address', async () => {
      const otherUserAddress = {
        ...mockAddress,
        userId: 'other-user-id',
      };

      addressRepository.findById.mockResolvedValue(otherUserAddress as any);

      await expect(
        service.remove(mockUserId, mockAddress.id),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });

      expect(addressRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('setDefault', () => {
    it('should set address as default successfully', async () => {
      addressRepository.findById
        .mockResolvedValueOnce(mockAddress as any)
        .mockResolvedValueOnce({ ...mockAddress, isDefault: true } as any);

      const result = await service.setDefault(mockUserId, mockAddress.id);

      expect(result.isDefault).toBe(true);
      expect(addressRepository.setDefaultAddress).toHaveBeenCalledWith(
        mockUserId,
        mockAddress.id,
      );
    });

    it('should throw error when address not found', async () => {
      addressRepository.findById.mockResolvedValue(null);

      await expect(
        service.setDefault(mockUserId, 'non-existent-id'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(addressRepository.setDefaultAddress).not.toHaveBeenCalled();
    });

    it('should throw error when user does not own address', async () => {
      const otherUserAddress = {
        ...mockAddress,
        userId: 'other-user-id',
      };

      addressRepository.findById.mockResolvedValue(otherUserAddress as any);

      await expect(
        service.setDefault(mockUserId, mockAddress.id),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });

      expect(addressRepository.setDefaultAddress).not.toHaveBeenCalled();
    });

    it('should throw error when updated address not found after setDefault', async () => {
      addressRepository.findById
        .mockResolvedValueOnce(mockAddress as any)
        .mockResolvedValueOnce(null);

      await expect(
        service.setDefault(mockUserId, mockAddress.id),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });
});
