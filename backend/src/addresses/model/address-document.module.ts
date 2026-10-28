import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressSchemaClass, AddressSchema } from './address.schema';
import { AddressDocumentRepository } from './address-document.repository';
import { AddressRepository } from '../domain/address.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AddressSchemaClass.name, schema: AddressSchema },
    ]),
  ],
  providers: [
    {
      provide: AddressRepository,
      useClass: AddressDocumentRepository,
    },
  ],
  exports: [AddressRepository, MongooseModule],
})
export class AddressDocumentModule {}
