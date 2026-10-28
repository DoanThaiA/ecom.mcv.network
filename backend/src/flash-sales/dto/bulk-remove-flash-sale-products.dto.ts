import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize } from 'class-validator';

/**
 * DTO for bulk removing products from a flash sale
 */
export class BulkRemoveFlashSaleProductsDto {
  @ApiProperty({
    type: [String],
    description: 'Array of product IDs to remove from the flash sale',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  productIds: string[];
}
