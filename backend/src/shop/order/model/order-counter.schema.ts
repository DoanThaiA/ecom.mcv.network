import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderCounterDocument = HydratedDocument<OrderCounterSchemaClass>;

/**
 * Counter document for atomic order number sequence generation.
 * _id format: "ORD-YYYYMMDD" (one document per day)
 * seq: auto-incremented sequence number for the day
 */
@Schema({ collection: 'order_counters', versionKey: false })
export class OrderCounterSchemaClass {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true, default: 0 })
  seq: number;
}

export const OrderCounterSchema = SchemaFactory.createForClass(
  OrderCounterSchemaClass,
);
