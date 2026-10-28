import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WithdrawalRequestSchemaClass,
  WithdrawalRequestSchema,
} from './withdrawal-request.schema';
import { WithdrawalRequestRepository } from '../domain/withdrawal-request.repository';
import { WithdrawalRequestDocumentRepository } from './withdrawal-request.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: WithdrawalRequestSchemaClass.name,
        schema: WithdrawalRequestSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: WithdrawalRequestRepository,
      useClass: WithdrawalRequestDocumentRepository,
    },
  ],
  exports: [WithdrawalRequestRepository, MongooseModule],
})
export class WithdrawalRequestDocumentModule {}
