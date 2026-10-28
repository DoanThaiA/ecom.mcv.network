import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from '../../../products/domain/product';

/**
 * Flash sale detail response with paginated products
 */
export class ShopFlashSaleDetailResponseDto {
  @ApiProperty({ type: String, description: 'Flash sale ID' })
  id: string;

  @ApiProperty({ type: String, description: 'Flash sale campaign name' })
  name: string;

  @ApiProperty({ type: Date, description: 'Flash sale start time' })
  startTime: Date;

  @ApiProperty({ type: Date, description: 'Flash sale end time' })
  endTime: Date;

  @ApiProperty({
    type: String,
    enum: ['active'],
    description: 'Flash sale status',
  })
  status: 'active';

  @ApiProperty({
    type: [Product],
    description: 'Flash sale products for the current page',
  })
  data: Product[];

  @ApiProperty({ type: Number, description: 'Total number of products' })
  total: number;

  @ApiProperty({ type: Boolean, description: 'Whether more pages exist' })
  hasNextPage: boolean;

  @ApiProperty({ type: Number, description: 'Current page number' })
  page: number;

  @ApiProperty({ type: Number, description: 'Items per page' })
  limit: number;

  @ApiProperty({ type: Number, description: 'Total number of pages' })
  totalPages: number;
}

/**
 * Active flash sale response with paginated products
 */
export class ShopActiveFlashSaleResponseDto {
  @ApiProperty({ type: String, description: 'Flash sale ID' })
  id: string;

  @ApiProperty({ type: String, description: 'Flash sale campaign name' })
  name: string;

  @ApiProperty({ type: Date, description: 'Flash sale start time' })
  startTime: Date;

  @ApiProperty({ type: Date, description: 'Flash sale end time' })
  endTime: Date;

  @ApiProperty({
    type: [Product],
    description: 'Flash sale products (first page)',
  })
  data: Product[];

  @ApiProperty({ type: Number, description: 'Total number of products' })
  total: number;

  @ApiProperty({ type: Boolean, description: 'Whether more pages exist' })
  hasNextPage: boolean;

  @ApiProperty({ type: Number, description: 'Current page number' })
  page: number;

  @ApiProperty({ type: Number, description: 'Items per page' })
  limit: number;

  @ApiProperty({ type: Number, description: 'Total number of pages' })
  totalPages: number;
}

/**
 * Flash sale products response (paginated with filtering)
 */
export class ShopFlashSaleProductsResponseDto {
  @ApiProperty({
    type: [Product],
    description: 'Flash sale products matching the filters',
  })
  data: Product[];

  @ApiProperty({ type: Number, description: 'Total number of products' })
  total: number;

  @ApiProperty({ type: Boolean, description: 'Whether more pages exist' })
  hasNextPage: boolean;

  @ApiProperty({ type: Number, description: 'Current page number' })
  page: number;

  @ApiProperty({ type: Number, description: 'Items per page' })
  limit: number;

  @ApiProperty({ type: Number, description: 'Total number of pages' })
  totalPages: number;
}
