import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Product view domain entity
 * Tracks product page views for both guests and authenticated users
 */
export class ProductView {
  @ApiProperty({ type: String, description: 'Product view ID' })
  id: string;

  @ApiPropertyOptional({
    type: String,
    description: 'User ID (null for guests)',
  })
  userId?: string;

  @ApiProperty({ type: String, description: 'Session ID (always present)' })
  sessionId: string;

  @ApiProperty({ type: String, description: 'Viewed product ID' })
  productId: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Category ID denormalized from product',
  })
  categoryId?: string;

  @ApiProperty({ type: Date, description: 'When the product was viewed' })
  viewedAt: Date;
}
