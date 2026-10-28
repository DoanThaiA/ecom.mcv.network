import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImportSession } from '../domain/import-session';
import { ImportSessionRow } from '../domain/import-session-row';

/**
 * Response DTO for import session summary
 */
export class ImportSessionResponseDto {
  @ApiProperty({ description: 'Session ID' })
  id: string;

  @ApiProperty({
    description: 'Session type',
    enum: [
      'flash_sale',
      'product_discount',
      'topic',
      'affiliate_product_commission',
    ],
  })
  type: string;

  @ApiPropertyOptional({ description: 'Flash sale ID' })
  flashSaleId?: string;

  @ApiPropertyOptional({ description: 'Promotion ID' })
  promotionId?: string;

  @ApiPropertyOptional({ description: 'Topic ID' })
  topicId?: string;

  @ApiPropertyOptional({
    description: 'Affiliate ID (null for global commission settings imports)',
  })
  affiliateId?: string;

  @ApiProperty({ description: 'Session status' })
  status: string;

  @ApiProperty({ description: 'Total rows parsed from Excel' })
  totalRows: number;

  @ApiProperty({ description: 'Count of valid rows' })
  validCount: number;

  @ApiProperty({ description: 'Count of invalid rows' })
  invalidCount: number;

  @ApiPropertyOptional({ description: 'Job ID (set after confirm)' })
  jobId?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  /**
   * Create from domain entity
   */
  static fromDomain(session: ImportSession): ImportSessionResponseDto {
    const dto = new ImportSessionResponseDto();
    dto.id = session.id;
    dto.type = session.type;
    dto.flashSaleId = session.flashSaleId;
    dto.promotionId = session.promotionId;
    dto.topicId = session.topicId;
    dto.affiliateId = session.affiliateId;
    dto.status = session.status;
    dto.totalRows = session.totalRows;
    dto.validCount = session.validCount;
    dto.invalidCount = session.invalidCount;
    dto.jobId = session.jobId;
    dto.createdAt = session.createdAt;
    return dto;
  }
}

/**
 * Response DTO for a single import session row
 */
export class ImportSessionRowResponseDto {
  @ApiProperty({ description: 'Row ID' })
  id: string;

  @ApiProperty({ description: 'Session ID' })
  sessionId: string;

  @ApiProperty({ description: 'Row number in Excel' })
  rowNumber: number;

  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Product code' })
  code: string;

  @ApiProperty({ description: 'Product name from Excel' })
  name: string;

  @ApiPropertyOptional({ description: 'Actual product name from DB' })
  actualName?: string;

  @ApiPropertyOptional({ description: 'Product avatar image' })
  image?: string;

  @ApiProperty({ description: 'Original retail price' })
  originalPrice: number;

  @ApiProperty({ description: 'Discount type' })
  discountType: string;

  @ApiProperty({ description: 'Discount value' })
  discountValue: number;

  @ApiProperty({ description: 'Calculated flash sale price' })
  flashSalePrice: number;

  @ApiProperty({ description: 'Promotional quantity' })
  promotionalQuantity: number;

  @ApiProperty({ description: 'Available stock' })
  stock: number;

  @ApiPropertyOptional({
    description:
      'Commission rate percent (only for affiliate_product_commission imports)',
  })
  commissionRate?: number;

  @ApiProperty({ description: 'Whether the row is valid' })
  isValid: boolean;

  @ApiProperty({ type: [String], description: 'Validation error codes' })
  errors: string[];

  /**
   * Create from domain entity
   */
  static fromDomain(row: ImportSessionRow): ImportSessionRowResponseDto {
    const dto = new ImportSessionRowResponseDto();
    dto.id = row.id;
    dto.sessionId = row.sessionId;
    dto.rowNumber = row.rowNumber;
    dto.productId = row.productId;
    dto.code = row.code;
    dto.name = row.name;
    dto.actualName = row.actualName;
    dto.image = row.image;
    dto.originalPrice = row.originalPrice;
    dto.discountType = row.discountType;
    dto.discountValue = row.discountValue;
    dto.flashSalePrice = row.flashSalePrice;
    dto.promotionalQuantity = row.promotionalQuantity;
    dto.stock = row.stock;
    dto.commissionRate = row.commissionRate;
    dto.isValid = row.isValid;
    dto.errors = row.errors;
    return dto;
  }
}

/**
 * Response DTO for confirm action
 */
export class ConfirmImportSessionResponseDto {
  @ApiProperty({ description: 'Job ID for tracking progress' })
  jobId: string;
}
