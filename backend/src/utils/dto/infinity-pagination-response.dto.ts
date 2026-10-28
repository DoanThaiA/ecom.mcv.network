import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class InfinityPaginationResponseDto<T> {
  data: T[];
  hasNextPage: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function InfinityPaginationResponse<T>(classReference: Type<T>) {
  abstract class Pagination {
    @ApiProperty({ type: [classReference] })
    data!: T[];

    @ApiProperty({
      type: Boolean,
      example: true,
      description: 'Indicates if there is a next page',
    })
    hasNextPage: boolean;

    @ApiProperty({
      type: Number,
      example: 100,
      description: 'Total number of items',
    })
    total: number;

    @ApiProperty({
      type: Number,
      example: 1,
      description: 'Current page number',
    })
    page: number;

    @ApiProperty({
      type: Number,
      example: 10,
      description: 'Number of items per page',
    })
    limit: number;

    @ApiProperty({
      type: Number,
      example: 10,
      description: 'Total number of pages',
    })
    totalPages: number;
  }

  Object.defineProperty(Pagination, 'name', {
    writable: false,
    value: `InfinityPagination${classReference.name}ResponseDto`,
  });

  return Pagination;
}
