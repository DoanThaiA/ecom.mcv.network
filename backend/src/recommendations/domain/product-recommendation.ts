import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Recommendation type
 */
export type RecommendationType = 'personalized' | 'cross_sell' | 'trending';

/**
 * Product recommendation domain entity
 * Stores pre-computed recommendation results in MongoDB
 */
export class ProductRecommendation {
  @ApiProperty({ type: String, description: 'Recommendation record ID' })
  id: string;

  @ApiProperty({
    type: String,
    enum: ['personalized', 'cross_sell', 'trending'],
    description: 'Recommendation type',
  })
  type: RecommendationType;

  @ApiPropertyOptional({
    type: String,
    description: 'User ID (for personalized recommendations)',
  })
  userId?: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'SHA hash of sorted input product IDs (for cross-sell recommendations)',
  })
  productIdsHash?: string;

  @ApiProperty({
    type: [String],
    description: 'Ordered list of recommended product IDs',
  })
  recommendedProductIds: string[];

  @ApiProperty({
    type: Date,
    description: 'When this recommendation was last computed',
  })
  computedAt: Date;
}
