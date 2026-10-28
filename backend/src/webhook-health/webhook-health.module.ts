import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WebhookHealthSchema,
  WebhookHealthSchemaClass,
} from './webhook-health.schema';
import { WebhookHealthRepository } from './webhook-health.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: WebhookHealthSchemaClass.name,
        schema: WebhookHealthSchema,
      },
    ]),
  ],
  providers: [WebhookHealthRepository],
  exports: [WebhookHealthRepository],
})
export class WebhookHealthModule {}
