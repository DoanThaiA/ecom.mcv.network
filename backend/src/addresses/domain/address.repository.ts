import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { Address } from './address';

export abstract class AddressRepository {
  abstract create(
    data: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Address>;

  abstract findManyWithPagination({
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
  }): Promise<Address[]>;

  abstract findById(id: string): Promise<NullableType<Address>>;

  abstract findByUserId(userId: string): Promise<Address[]>;

  abstract findDefaultByUserId(userId: string): Promise<NullableType<Address>>;

  abstract update(
    id: string,
    payload: DeepPartial<Address>,
  ): Promise<Address | null>;

  abstract remove(id: string): Promise<void>;

  abstract setDefaultAddress(userId: string, addressId: string): Promise<void>;
}
