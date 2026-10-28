import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComboSchemaClass, ComboSchema } from './combo.schema';
import { ComboRepository } from '../domain/combo.repository';
import { ComboDocumentRepository } from './combo.repository';

/**
 * Mongoose document module for Combo entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ComboSchemaClass.name, schema: ComboSchema },
    ]),
  ],
  providers: [
    {
      provide: ComboRepository,
      useClass: ComboDocumentRepository,
    },
  ],
  exports: [ComboRepository, MongooseModule],
})
export class ComboDocumentModule {}
