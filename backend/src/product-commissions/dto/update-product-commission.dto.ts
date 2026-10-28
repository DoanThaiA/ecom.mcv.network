import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class UpdateProductCommissionDto {
  @ApiProperty({ type: Number, example: 15 })
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate: number;
}
