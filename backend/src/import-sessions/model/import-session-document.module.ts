import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ImportSessionSchemaClass,
  ImportSessionSchema,
} from './import-session.schema';
import {
  ImportSessionRowSchemaClass,
  ImportSessionRowSchema,
} from './import-session-row.schema';
import { ImportSessionRepository } from '../domain/import-session.repository';
import { ImportSessionDocumentRepository } from './import-session.repository';
import { ImportSessionRowRepository } from '../domain/import-session-row.repository';
import { ImportSessionRowDocumentRepository } from './import-session-row.repository';

/**
 * Mongoose document module for ImportSession and ImportSessionRow entities
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ImportSessionSchemaClass.name,
        schema: ImportSessionSchema,
      },
      {
        name: ImportSessionRowSchemaClass.name,
        schema: ImportSessionRowSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: ImportSessionRepository,
      useClass: ImportSessionDocumentRepository,
    },
    {
      provide: ImportSessionRowRepository,
      useClass: ImportSessionRowDocumentRepository,
    },
  ],
  exports: [
    ImportSessionRepository,
    ImportSessionRowRepository,
    MongooseModule,
  ],
})
export class ImportSessionDocumentModule {}
