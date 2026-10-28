import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { CommissionTrigger } from '../domain/commission-trigger.enum';

export type CommissionSettingsSchemaDocument =
  HydratedDocument<CommissionSettingsSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'commission_settings',
})
export class CommissionSettingsSchemaClass extends EntityDocumentHelper {
  @Prop({ type: Number, default: 0 })
  defaultCommissionRate: number;

  @Prop({ type: Boolean, default: true })
  autoUpdateProducts: boolean;

  @Prop({
    type: String,
    enum: CommissionTrigger,
    default: CommissionTrigger.ORDER_CREATION,
  })
  commissionTrigger: CommissionTrigger;

  @Prop({ type: Date, default: null })
  lastProductSyncCursor?: Date | null;

  @Prop({ default: now })
  updatedAt: Date;
}

export const CommissionSettingsSchema = SchemaFactory.createForClass(
  CommissionSettingsSchemaClass,
);
