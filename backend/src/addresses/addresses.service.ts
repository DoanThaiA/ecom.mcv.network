import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { AddressRepository } from './domain/address.repository';
import { Address } from './domain/address';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { throwException } from '../utils/errors/throw-exception';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);

  constructor(
    private readonly addressRepository: AddressRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Get all addresses for a user
   */
  async findByUserId(userId: string): Promise<Address[]> {
    return this.addressRepository.findByUserId(userId);
  }

  /**
   * Get default address for a user
   */
  async findDefaultByUserId(userId: string): Promise<Address | null> {
    return this.addressRepository.findDefaultByUserId(userId);
  }

  /**
   * Create a new address
   */
  async create(
    userId: string,
    createAddressDto: CreateAddressDto,
  ): Promise<Address> {
    // If this is set as default, unset other defaults
    if (createAddressDto.isDefault) {
      const existingDefault =
        await this.addressRepository.findDefaultByUserId(userId);
      if (existingDefault) {
        await this.addressRepository.update(existingDefault.id, {
          isDefault: false,
        });
      }
    }

    return this.addressRepository.create({
      userId,
      ...createAddressDto,
      isDefault: createAddressDto.isDefault ?? false,
    });
  }

  /**
   * Update an address
   */
  async update(
    userId: string,
    addressId: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.addressRepository.findById(addressId);

    if (!address) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('address.notFound'),
      });
    }

    if (address.userId !== userId) {
      throwException({
        status: HttpStatus.FORBIDDEN,
        message: this.i18n.t('address.forbidden'),
      });
    }

    // If setting as default, unset other defaults
    if (updateAddressDto.isDefault) {
      await this.addressRepository.setDefaultAddress(userId, addressId);
    }

    const updated = await this.addressRepository.update(
      addressId,
      updateAddressDto,
    );

    if (!updated) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('address.notFound'),
      });
    }

    return updated;
  }

  /**
   * Delete an address
   */
  async remove(userId: string, addressId: string): Promise<void> {
    const address = await this.addressRepository.findById(addressId);

    if (!address) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('address.notFound'),
      });
    }

    if (address.userId !== userId) {
      throwException({
        status: HttpStatus.FORBIDDEN,
        message: this.i18n.t('address.forbidden'),
      });
    }

    await this.addressRepository.remove(addressId);
  }

  /**
   * Set an address as default
   */
  async setDefault(userId: string, addressId: string): Promise<Address> {
    const address = await this.addressRepository.findById(addressId);

    if (!address) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('address.notFound'),
      });
    }

    if (address.userId !== userId) {
      throwException({
        status: HttpStatus.FORBIDDEN,
        message: this.i18n.t('address.forbidden'),
      });
    }

    await this.addressRepository.setDefaultAddress(userId, addressId);

    const updated = await this.addressRepository.findById(addressId);
    if (!updated) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('address.notFound'),
      });
    }

    return updated;
  }
}
