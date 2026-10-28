import { PaginateResult } from 'mongoose';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { NullableType } from '../../utils/types/nullable.type';
import { ImportSessionRow } from './import-session-row';
import { DiscountType } from '../../combos/domain/discount-type.enum';

/**
 * Abstract repository interface for ImportSessionRow entity
 */
export abstract class ImportSessionRowRepository {
  /**
   * Bulk insert rows after validation
   * @returns Number of rows inserted
   */
  abstract insertMany(
    rows: Omit<ImportSessionRow, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<number>;

  /**
   * Find rows with pagination, optional isValid filter and search
   */
  abstract findBySessionIdWithPagination(params: {
    sessionId: string;
    isValid?: boolean;
    search?: string;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<ImportSessionRow>>;

  /**
   * Find a single row by ID
   */
  abstract findById(id: string): Promise<NullableType<ImportSessionRow>>;

  /**
   * Update a single row (inline edit)
   */
  abstract updateOne(
    id: string,
    data: {
      discountType?: DiscountType;
      discountValue?: number;
      promotionalQuantity?: number;
      flashSalePrice?: number;
      isValid?: boolean;
      errors?: string[];
    },
  ): Promise<NullableType<ImportSessionRow>>;

  /**
   * Delete a single row
   * @returns True if deleted, false if not found
   */
  abstract deleteOne(id: string): Promise<boolean>;

  /**
   * Count rows by session ID with optional isValid filter
   */
  abstract countBySessionId(
    sessionId: string,
    isValid?: boolean,
  ): Promise<number>;

  /**
   * Find valid rows for a session in batches (for worker processing)
   * Uses skip/limit pagination
   */
  abstract findValidBySessionId(
    sessionId: string,
    skip: number,
    limit: number,
  ): Promise<ImportSessionRow[]>;

  /**
   * Delete all rows for a session
   * @returns Number of rows deleted
   */
  abstract deleteBySessionId(sessionId: string): Promise<number>;
}
