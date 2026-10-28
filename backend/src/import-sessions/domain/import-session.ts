import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImportSessionStatus } from './import-session-status.enum';

/**
 * Import session entity - metadata for flash sale or product discount Excel import
 */
export class ImportSession {
  @ApiProperty({ type: String, description: 'Document ID' })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Session type',
    enum: [
      'flash_sale',
      'product_discount',
      'topic',
      'affiliate_product_commission',
    ],
  })
  type: string;

  @ApiPropertyOptional({ type: String, description: 'Flash sale ID' })
  flashSaleId?: string;

  @ApiPropertyOptional({ type: String, description: 'Promotion ID' })
  promotionId?: string;

  @ApiPropertyOptional({ type: String, description: 'Topic ID' })
  topicId?: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'Affiliate ID for affiliate_product_commission imports (null = global commission settings)',
  })
  affiliateId?: string;

  @ApiProperty({
    enum: ImportSessionStatus,
    description: 'Session status',
  })
  status: ImportSessionStatus;

  @ApiProperty({ type: Number, description: 'Total rows parsed from Excel' })
  totalRows: number;

  @ApiProperty({ type: Number, description: 'Count of valid rows' })
  validCount: number;

  @ApiProperty({ type: Number, description: 'Count of invalid rows' })
  invalidCount: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Job ID (set after confirm)',
  })
  jobId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'CMS user who created the session',
  })
  createdBy?: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
