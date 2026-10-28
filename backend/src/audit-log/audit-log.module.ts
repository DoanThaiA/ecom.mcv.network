import { Global, Module } from '@nestjs/common';
import { AuditLogDocumentModule } from './model/audit-log-document.module';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';

/**
 * Global module for audit logging functionality
 *
 * Provides:
 * - AuditLogService for creating and querying audit logs
 * - AuditLogInterceptor for automatic logging via @AuditLog decorator
 * - AuditLogController for viewing audit logs (CMS admin only)
 */
@Global()
@Module({
  imports: [AuditLogDocumentModule],
  controllers: [AuditLogController],
  providers: [AuditLogService, AuditLogInterceptor],
  exports: [AuditLogService, AuditLogInterceptor, AuditLogDocumentModule],
})
export class AuditLogModule {}
