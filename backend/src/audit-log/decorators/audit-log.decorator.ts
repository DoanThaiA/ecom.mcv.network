import { SetMetadata } from '@nestjs/common';

/**
 * Options for the @AuditLog decorator
 */
export interface AuditLogOptions {
  /**
   * Action identifier (e.g., 'SYNC_PRODUCTS', 'CREATE_PRODUCT')
   */
  action: string;

  /**
   * Category/module (e.g., 'nhanh-integration', 'products')
   */
  category?: string;

  /**
   * Human-readable description
   */
  description?: string;

  /**
   * Whether to capture request input (body, params, query)
   * @default true
   */
  captureInput?: boolean;

  /**
   * Whether to capture response output
   * @default false (to avoid large log entries)
   */
  captureOutput?: boolean;

  /**
   * Fields to redact from input (e.g., ['password', 'accessToken'])
   */
  sensitiveFields?: string[];
}

/**
 * Metadata key for audit log options
 */
export const AUDIT_LOG_KEY = 'auditLog';

/**
 * Decorator to mark controller methods for audit logging
 *
 * @example
 * ```typescript
 * @Post('sync/products')
 * @AuditLog({
 *   action: 'NHANH_SYNC_PRODUCTS',
 *   category: 'nhanh-integration',
 *   description: 'Sync products from Nhanh.vn',
 * })
 * async syncProducts(@Body() filters?: NhanhProductListFiltersDto) {
 *   // ...
 * }
 * ```
 *
 * @example With sensitive field redaction
 * ```typescript
 * @Patch(':id')
 * @AuditLog({
 *   action: 'UPDATE_USER',
 *   category: 'users',
 *   sensitiveFields: ['password', 'oldPassword'],
 * })
 * async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
 *   // ...
 * }
 * ```
 */
export const AuditLog = (options: AuditLogOptions) =>
  SetMetadata(AUDIT_LOG_KEY, options);
