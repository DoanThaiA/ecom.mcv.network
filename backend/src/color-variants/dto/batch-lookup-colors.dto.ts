import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator';

/**
 * DTO for batch lookup of color variants by name
 */
export class BatchLookupColorsDto {
  @ApiProperty({
    type: [String],
    description: 'Array of color names to look up (max 100)',
    example: ['Đen', 'Trắng', 'Xanh Dương'],
    minItems: 1,
    maxItems: 100,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  names: string[];
}
