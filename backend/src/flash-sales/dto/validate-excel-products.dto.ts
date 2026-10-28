import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';
import { DiscountType } from '../../combos/domain/discount-type.enum';

/**
 * DTO for file upload with form data
 */
export class ValidateExcelFileDto {
  @ApiProperty({
    type: String,
    description: 'Flash sale start time (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    type: String,
    description: 'Flash sale end time (ISO 8601)',
    example: '2024-01-07T23:59:59Z',
  })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Flash sale ID for edit mode (exclude from conflict check)',
  })
  @IsOptional()
  @IsString()
  flashSaleId?: string;
}

/**
 * Parsed row from Excel file
 */
export interface ExcelProductRow {
  code: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  promotionalQuantity: number;
  rowNumber: number;
}

/**
 * Validation error codes
 */
export enum ValidationErrorCode {
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  NO_STOCK = 'NO_STOCK',
  NO_IMAGE = 'NO_IMAGE',
  CONFLICT_FLASH_SALE = 'CONFLICT_FLASH_SALE',
  INVALID_DISCOUNT = 'INVALID_DISCOUNT',
  DUPLICATE_IN_EXCEL = 'DUPLICATE_IN_EXCEL',
  INVALID_ROW_FORMAT = 'INVALID_ROW_FORMAT',
}

/**
 * DTO for a validated product
 */
export class ValidatedProductDto {
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

  @ApiProperty({ enum: DiscountType, description: 'Discount type' })
  discountType: DiscountType;

  @ApiProperty({ description: 'Discount value' })
  discountValue: number;

  @ApiProperty({ description: 'Calculated flash sale price' })
  flashSalePrice: number;

  @ApiProperty({ description: 'Promotional quantity' })
  promotionalQuantity: number;

  @ApiProperty({ description: 'Available stock' })
  stock: number;

  @ApiProperty({ description: 'Whether product passed validation' })
  isValid: boolean;

  @ApiProperty({
    type: [String],
    description: 'Validation error codes',
    enum: ValidationErrorCode,
  })
  errors: ValidationErrorCode[];

  @ApiProperty({ description: 'Row number in Excel file' })
  rowNumber: number;
}

/**
 * Response DTO for Excel product validation
 */
export class ValidateExcelProductsResponseDto {
  @ApiProperty({
    type: [ValidatedProductDto],
    description: 'Products that passed validation',
  })
  validProducts: ValidatedProductDto[];

  @ApiProperty({
    type: [ValidatedProductDto],
    description: 'Products that failed validation',
  })
  invalidProducts: ValidatedProductDto[];

  @ApiProperty({ description: 'Total products in request' })
  total: number;

  @ApiProperty({ description: 'Count of valid products' })
  validCount: number;

  @ApiProperty({ description: 'Count of invalid products' })
  invalidCount: number;
}
