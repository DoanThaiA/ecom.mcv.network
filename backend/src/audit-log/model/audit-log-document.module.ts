import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogSchemaClass, AuditLogSchema } from './audit-log.schema';
import { AuditLogRepository } from '../domain/audit-log.repository';
import { AuditLogDocumentRepository } from './audit-log.repository';

/**
 * Mongoose document module for AuditLog entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLogSchemaClass.name, schema: AuditLogSchema },
    ]),
  ],
  providers: [
    {
      provide: AuditLogRepository,
      useClass: AuditLogDocumentRepository,
    },
  ],
  exports: [AuditLogRepository, MongooseModule],
})
export class AuditLogDocumentModule {}
