import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { Affiliate } from './affiliate';
import { PaginateResult } from 'mongoose';
import {
  FilterAffiliateDto,
  SortAffiliateDto,
} from '../dto/query-affiliate.dto';

export abstract class AffiliateRepository {
  abstract create(
    data: Omit<Affiliate, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<Affiliate>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterAffiliateDto | null;
    sortOptions?: SortAffiliateDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Affiliate>>;

  abstract findById(id: Affiliate['id']): Promise<NullableType<Affiliate>>;

  abstract findByPhone(phone: string): Promise<NullableType<Affiliate>>;

  abstract findByAffiliateCode(code: string): Promise<NullableType<Affiliate>>;

  abstract findAutoUpdate(): Promise<Affiliate[]>;

  abstract update(
    id: Affiliate['id'],
    payload: DeepPartial<Affiliate>,
  ): Promise<Affiliate | null>;

  abstract softDelete(id: Affiliate['id']): Promise<boolean>;

  /**
   * Update pre-computed balance fields for an affiliate
   */
  abstract updateBalance(
    affiliateId: string,
    balance: {
      totalEarned: number;
      totalWithdrawn: number;
      pendingAmount: number;
      availableBalance: number;
    },
  ): Promise<void>;

  /**
   * Find all active (non-deleted) affiliate IDs
   */
  abstract findAllActiveIds(): Promise<string[]>;
}
