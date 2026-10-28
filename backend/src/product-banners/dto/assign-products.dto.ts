import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, ArrayMinSize } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

/**
 * DTO for assigning products to a banner
 */
export class AssignProductsDto {
  @ApiProperty({
    type: [String],
    description: 'Array of product IDs to assign to the banner',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({
    each: true,
    message: i18nValidationMessage('validation.isMongoId'),
  })
  productIds: string[];
}

/**
 * DTO for removing products from a banner
 */
export class RemoveBannerProductsDto {
  @ApiProperty({
    type: [String],
    description: 'Array of product IDs to remove from the banner',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({
    each: true,
    message: i18nValidationMessage('validation.isMongoId'),
  })
  productIds: string[];
}
