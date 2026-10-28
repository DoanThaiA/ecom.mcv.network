import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchemaClass, OrderSchema } from './order.schema';
import {
  OrderCounterSchemaClass,
  OrderCounterSchema,
} from './order-counter.schema';
import { OrderRepository } from '../domain/order.repository';
import { OrderDocumentRepository } from './order.repository';

/**
 * Mongoose document module for Order entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderSchemaClass.name, schema: OrderSchema },
      { name: OrderCounterSchemaClass.name, schema: OrderCounterSchema },
    ]),
  ],
  providers: [
    {
      provide: OrderRepository,
      useClass: OrderDocumentRepository,
    },
  ],
  exports: [OrderRepository, MongooseModule],
})
export class OrderDocumentModule {}
