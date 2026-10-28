import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ReturnRequestSchemaClass,
  ReturnRequestSchema,
} from './return-request.schema';
import { ReturnRequestRepository } from '../domain/return-request.repository';
import { ReturnRequestRepositoryImpl } from './return-request.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReturnRequestSchemaClass.name, schema: ReturnRequestSchema },
    ]),
  ],
  providers: [
    {
      provide: ReturnRequestRepository,
      useClass: ReturnRequestRepositoryImpl,
    },
  ],
  exports: [ReturnRequestRepository],
})
export class ReturnRequestDocumentModule {}
