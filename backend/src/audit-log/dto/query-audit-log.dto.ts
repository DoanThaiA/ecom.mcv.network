import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  IsDate,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { AuditLogStatus } from '../domain/audit-log-status.enum';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import { AUDIT_LOG_STATUS_PROTO_MAP } from '../../utils/transformers/proto-enum.transformer';

/**
 * DTO for filtering audit logs
 */
export class FilterAuditLogDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search by action or description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by action identifier',
    example: 'SYNC_PRODUCTS',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by category/module',
    example: 'nhanh-integration',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by user ID',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    enum: ['cms', 'system'],
    description: 'Filter by user type',
  })
  @IsOptional()
  @IsEnum(['cms', 'system'])
  userType?: 'cms' | 'system';

  @ApiPropertyOptional({
    enum: AuditLogStatus,
    description: 'Filter by status',
  })
  @IsOptional()
  @TransformProtoEnum(AuditLogStatus, AUDIT_LOG_STATUS_PROTO_MAP)
  status?: AuditLogStatus;

  @ApiPropertyOptional({
    type: Date,
    description: 'Filter by start date (ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Filter by end date (ISO 8601)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}

/**
 * DTO for querying audit logs
 */
export class QueryAuditLogDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Page number (starts from 1)',
    default: 1,
  })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Items per page',
    default: 20,
  })
  @Transform(({ value }) => (value ? Number(value) : 20))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    type: FilterAuditLogDto,
    description:
      'Filter criteria (passed as JSON string in query). Example: {"action":"SYNC_PRODUCTS","status":"success"}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterAuditLogDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterAuditLogDto)
  filters?: FilterAuditLogDto | null;
}
