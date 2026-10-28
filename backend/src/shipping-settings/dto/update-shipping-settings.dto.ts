import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { ShippingCalculationMethod } from '../domain/shipping-calculation-method.enum';

export class UpdateShippingSettingsDto {
  @ApiPropertyOptional({
    enum: ShippingCalculationMethod,
    example: ShippingCalculationMethod.FIXED,
  })
  @IsOptional()
  @IsEnum(ShippingCalculationMethod)
  calculationMethod?: ShippingCalculationMethod;

  @ApiPropertyOptional({ example: 30000, type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedShippingFee?: number;
}
