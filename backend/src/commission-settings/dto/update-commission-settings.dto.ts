import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { CommissionTrigger } from '../domain/commission-trigger.enum';

export class UpdateCommissionSettingsDto {
  @ApiPropertyOptional({ example: 10, type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultCommissionRate?: number;

  @ApiPropertyOptional({ example: true, type: Boolean })
  @IsOptional()
  @IsBoolean()
  autoUpdateProducts?: boolean;

  @ApiPropertyOptional({
    example: CommissionTrigger.ORDER_CREATION,
    enum: CommissionTrigger,
    description: 'When to create affiliate order commissions',
  })
  @IsOptional()
  @IsEnum(CommissionTrigger)
  commissionTrigger?: CommissionTrigger;
}
