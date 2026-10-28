import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ColorVariantSchemaClass,
  ColorVariantSchema,
} from './color-variant.schema';
import { ColorVariantDocumentRepository } from './color-variant.repository';
import { ColorVariantRepository } from '../domain/color-variant.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ColorVariantSchemaClass.name, schema: ColorVariantSchema },
    ]),
  ],
  providers: [
    {
      provide: ColorVariantRepository,
      useClass: ColorVariantDocumentRepository,
    },
  ],
  exports: [ColorVariantRepository, MongooseModule],
})
export class ColorVariantDocumentModule {}
