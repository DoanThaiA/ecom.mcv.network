import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';
import { DiscountType } from '../../combos/domain/discount-type.enum';

/**
 * DTO for file upload with form data for product discount validation
 */
export class ValidateProductDiscountExcelFileDto {
  @ApiProperty({
    type: String,
    description: 'Promotion start time (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    type: String,
    description: 'Promotion end time (ISO 8601)',
    example: '2024-01-07T23:59:59Z',
  })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Promotion ID for edit mode (exclude from conflict check)',
  })
  @IsOptional()
  @IsString()
  promotionId?: string;
}

/**
 * Parsed row from Excel file (simple format: code and name only)
 */
export interface ProductDiscountExcelRow {
  code: string;
  name: string;
  rowNumber: number;
  discountType: DiscountType;
  discountValue: number;
}

/**
 * Validation error codes for product discount
 */
export enum ProductDiscountValidationErrorCode {
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  NO_IMAGE = 'NO_IMAGE',
  CONFLICT_FLASH_SALE = 'CONFLICT_FLASH_SALE',
  CONFLICT_PROMOTION = 'CONFLICT_PROMOTION',
  DUPLICATE_IN_EXCEL = 'DUPLICATE_IN_EXCEL',
  INVALID_ROW_FORMAT = 'INVALID_ROW_FORMAT',
}

/**
 * DTO for a validated product in product discount
 */
export class ValidatedProductDiscountProductDto {
  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Product code' })
  code: string;

  @ApiProperty({ description: 'Product name from Excel' })
  name: string;

  @ApiPropertyOptional({ description: 'Actual product name from database' })
  actualName?: string;

  @ApiPropertyOptional({ description: 'Product image URL' })
  image?: string;

  @ApiProperty({ description: 'Original retail price' })
  originalPrice: number;

  @ApiProperty({ description: 'Whether product passed validation' })
  isValid: boolean;

  @ApiProperty({
    type: [String],
    description: 'Validation error codes',
    enum: ProductDiscountValidationErrorCode,
  })
  errors: ProductDiscountValidationErrorCode[];

  @ApiProperty({ description: 'Row number in Excel file' })
  rowNumber: number;
}

/**
 * Response DTO for product discount Excel validation
 */
export class ValidateProductDiscountExcelResponseDto {
  @ApiProperty({
    type: [ValidatedProductDiscountProductDto],
    description: 'Products that passed validation',
  })
  validProducts: ValidatedProductDiscountProductDto[];

  @ApiProperty({
    type: [ValidatedProductDiscountProductDto],
    description: 'Products that failed validation',
  })
  invalidProducts: ValidatedProductDiscountProductDto[];

  @ApiProperty({ description: 'Total products in request' })
  total: number;

  @ApiProperty({ description: 'Count of valid products' })
  validCount: number;

  @ApiProperty({ description: 'Count of invalid products' })
  invalidCount: number;
}
