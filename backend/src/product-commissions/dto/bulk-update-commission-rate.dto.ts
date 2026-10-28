import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, Max, Min } from 'class-validator';

export class BulkUpdateCommissionRateDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  productIds: string[];

  @ApiProperty({ type: Number, example: 10 })
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate: number;
}
