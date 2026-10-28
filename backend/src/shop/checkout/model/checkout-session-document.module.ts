import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CheckoutSessionSchemaClass,
  CheckoutSessionSchema,
} from './checkout-session.schema';
import { CheckoutSessionRepository } from '../domain/checkout-session.repository';
import { CheckoutSessionDocumentRepository } from './checkout-session.repository';

/**
 * Mongoose document module for CheckoutSession entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CheckoutSessionSchemaClass.name, schema: CheckoutSessionSchema },
    ]),
  ],
  providers: [
    {
      provide: CheckoutSessionRepository,
      useClass: CheckoutSessionDocumentRepository,
    },
  ],
  exports: [CheckoutSessionRepository, MongooseModule],
})
export class CheckoutSessionDocumentModule {}
