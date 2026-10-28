import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { WithdrawalRequestStatus } from '../domain/withdrawal-request';

export class QueryWithdrawalRequestsDto {
  @ApiPropertyOptional({ type: Number, default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ type: Number, default: 10 })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    enum: WithdrawalRequestStatus,
    description: 'Filter by status',
  })
  @IsOptional()
  @Transform(({ value }) => {
    const map: Record<string, number> = {
      pending: WithdrawalRequestStatus.pending,
      approved: WithdrawalRequestStatus.approved,
      paid: WithdrawalRequestStatus.paid,
      rejected: WithdrawalRequestStatus.rejected,
    };
    return map[value] ?? (isNaN(Number(value)) ? undefined : Number(value));
  })
  @IsEnum(WithdrawalRequestStatus)
  status?: WithdrawalRequestStatus;

  @ApiPropertyOptional({ type: String, description: 'Search by agent name' })
  @IsOptional()
  @IsString()
  search?: string;
}
