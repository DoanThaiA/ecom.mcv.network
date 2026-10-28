import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartSchemaClass, CartSchema } from './cart.schema';
import { CartRepository } from '../domain/cart.repository';
import { CartDocumentRepository } from './cart.repository';

/**
 * Mongoose document module for Cart entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CartSchemaClass.name, schema: CartSchema },
    ]),
  ],
  providers: [
    {
      provide: CartRepository,
      useClass: CartDocumentRepository,
    },
  ],
  exports: [CartRepository, MongooseModule],
})
export class CartDocumentModule {}
