import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditLogStatus } from './audit-log-status.enum';

const idType = String;

/**
 * AuditLog domain entity
 * Represents an audit trail entry for tracking system changes
 */
export class AuditLog {
  @ApiProperty({
    type: idType,
    description: 'Internal audit log ID',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Action identifier (e.g., SYNC_PRODUCTS, CREATE_PRODUCT)',
    example: 'SYNC_PRODUCTS',
  })
  action: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Category/module (e.g., nhanh-integration, products)',
    example: 'nhanh-integration',
  })
  category?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Human-readable description',
    example: 'Sync products from Nhanh.vn',
  })
  description?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'CMS user ID who performed the action',
  })
  userId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'User email for display',
    example: 'admin@example.com',
  })
  userEmail?: string | null;

  @ApiProperty({
    type: String,
    enum: ['cms', 'system'],
    description: 'Type of user performing the action',
    example: 'cms',
  })
  userType: 'cms' | 'system';

  @ApiProperty({
    enum: AuditLogStatus,
    enumName: 'AuditLogStatus',
    description: 'Status of the action',
    example: AuditLogStatus.SUCCESS,
  })
  status: AuditLogStatus;

  @ApiPropertyOptional({
    type: String,
    description: 'HTTP method',
    example: 'POST',
  })
  httpMethod?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Request endpoint/URL path',
    example: '/api/v1/integration/nhanh/sync/products',
  })
  endpoint?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Client IP address',
    example: '192.168.1.100',
  })
  ipAddress?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Client user agent',
  })
  userAgent?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Unique request identifier for correlation',
  })
  requestId?: string | null;

  @ApiPropertyOptional({
    description: 'Request input data (body, params, query) - sanitized',
  })
  input?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    description: 'Response output summary - truncated if large',
  })
  output?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    description: 'Error details if action failed',
  })
  error?: {
    message: string;
    name?: string;
    stack?: string;
  } | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Execution duration in milliseconds',
    example: 1500,
  })
  durationMs?: number | null;

  @ApiPropertyOptional({
    description: 'Additional metadata (entity IDs, counts, etc.)',
  })
  metadata?: Record<string, unknown> | null;

  @ApiProperty({
    type: Date,
    description: 'Audit log creation timestamp',
  })
  createdAt: Date;
}
