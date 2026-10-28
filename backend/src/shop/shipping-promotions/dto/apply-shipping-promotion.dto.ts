import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApplyShippingPromotionDto {
  @ApiProperty({ description: 'Shipping promotion ID to apply' })
  @IsString()
  @IsNotEmpty()
  promotionId: string;
}
