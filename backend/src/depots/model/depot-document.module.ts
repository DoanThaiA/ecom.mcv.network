import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DepotSchemaClass, DepotSchema } from './depot.schema';
import { DepotRepository } from '../domain/depot.repository';
import { DepotDocumentRepository } from './depot.repository';

/**
 * Module for depot persistence layer using MongoDB
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DepotSchemaClass.name, schema: DepotSchema },
    ]),
  ],
  providers: [
    {
      provide: DepotRepository,
      useClass: DepotDocumentRepository,
    },
  ],
  exports: [DepotRepository, MongooseModule],
})
export class DepotDocumentModule {}
