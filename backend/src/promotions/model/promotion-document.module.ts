import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromotionSchemaClass, PromotionSchema } from './promotion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PromotionSchemaClass.name, schema: PromotionSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class PromotionDocumentModule {}
