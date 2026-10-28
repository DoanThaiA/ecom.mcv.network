import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class BulkActionDto {
  @ApiProperty({
    type: [String],
    description: 'Array of withdrawal request IDs',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids: string[];
}

export class BulkRejectDto extends BulkActionDto {
  @ApiPropertyOptional({ type: String, description: 'Rejection reason' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reason?: string;
}
