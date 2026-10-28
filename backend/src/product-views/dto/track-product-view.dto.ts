import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

/**
 * DTO for tracking a product view
 */
export class TrackProductViewDto {
  @ApiProperty({
    type: String,
    description: 'ID of the product being viewed',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  productId: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'Category ID of the product (optional, avoids backend lookup if provided)',
    example: '507f1f77bcf86cd799439012',
  })
  @IsOptional()
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  categoryId?: string;
}
