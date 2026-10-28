import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddressRepository } from '../domain/address.repository';
import { AddressSchemaClass } from './address.schema';
import { AddressMapper } from './address.mapper';
import { Address } from '../domain/address';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';

@Injectable()
export class AddressDocumentRepository implements AddressRepository {
  constructor(
    @InjectModel(AddressSchemaClass.name)
    private readonly addressModel: Model<AddressSchemaClass>,
  ) {}

  async create(
    data: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Address> {
    const persistenceModel = AddressMapper.toPersistence({
      ...data,
      id: undefined as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdAddress = new this.addressModel(persistenceModel);
    const addressObject = await createdAddress.save();
    return AddressMapper.toDomain(addressObject);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: {
      userId?: string;
      cityId?: number;
      districtId?: number;
      isDefault?: boolean;
    } | null;
    sortOptions?: Array<{ orderBy: keyof Address; order: string }> | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Address[]> {
    const where: Record<string, any> = {};

    if (filterOptions?.userId) {
      where.userId = filterOptions.userId;
    }
    if (filterOptions?.cityId) {
      where.cityId = filterOptions.cityId;
    }
    if (filterOptions?.districtId) {
      where.districtId = filterOptions.districtId;
    }
    if (filterOptions?.isDefault !== undefined) {
      where.isDefault = filterOptions.isDefault;
    }

    const addressObjects = await this.addressModel
      .find(where)
      .limit(paginationOptions.limit)
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .sort(
        sortOptions?.reduce(
          (acc, sort) => ({
            ...acc,
            [sort.orderBy]: sort.order === 'asc' ? 1 : -1,
          }),
          {},
        ) ?? { createdAt: -1 },
      )
      .exec();

    return addressObjects.map((addressObject) =>
      AddressMapper.toDomain(addressObject),
    );
  }

  async findById(id: string): Promise<NullableType<Address>> {
    const addressObject = await this.addressModel.findById(id).exec();
    return addressObject ? AddressMapper.toDomain(addressObject) : null;
  }

  async findByUserId(userId: string): Promise<Address[]> {
    const addressObjects = await this.addressModel
      .find({ userId })
      .sort({ isDefault: -1, createdAt: -1 })
      .exec();
    return addressObjects.map((addressObject) =>
      AddressMapper.toDomain(addressObject),
    );
  }

  async findDefaultByUserId(userId: string): Promise<NullableType<Address>> {
    const addressObject = await this.addressModel
      .findOne({ userId, isDefault: true })
      .exec();
    return addressObject ? AddressMapper.toDomain(addressObject) : null;
  }

  async update(id: string, payload: Partial<Address>): Promise<Address | null> {
    const addressObject = await this.addressModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();
    return addressObject ? AddressMapper.toDomain(addressObject) : null;
  }

  async remove(id: string): Promise<void> {
    await this.addressModel.findByIdAndDelete(id).exec();
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    // Unset all default addresses for this user
    await this.addressModel.updateMany({ userId }, { isDefault: false }).exec();
    // Set the new default
    await this.addressModel
      .findByIdAndUpdate(addressId, { isDefault: true })
      .exec();
  }
}
