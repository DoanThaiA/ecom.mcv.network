import { PaginateResult } from 'mongoose';
import { IPaginationOptions } from './types/pagination-options';
import { InfinityPaginationResponseDto } from './dto/infinity-pagination-response.dto';

export const infinityPagination = <T>(
  data: T[],
  options: IPaginationOptions,
  total: number,
): InfinityPaginationResponseDto<T> => {
  const totalPages = Math.ceil(total / options.limit);

  return {
    data,
    hasNextPage: options.page < totalPages,
    total,
    page: options.page,
    limit: options.limit,
    totalPages,
  };
};

/**
 * Convert mongoose-paginate-v2 PaginateResult to InfinityPaginationResponseDto
 */
export const infinityPaginationFromPaginate = <T>(
  paginateResult: PaginateResult<T>,
): InfinityPaginationResponseDto<T> => {
  return {
    data: paginateResult.docs,
    hasNextPage: paginateResult.hasNextPage ?? false,
    total: paginateResult.totalDocs,
    page: paginateResult.page ?? 1,
    limit: paginateResult.limit,
    totalPages: paginateResult.totalPages,
  };
};
