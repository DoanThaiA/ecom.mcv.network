import { Module } from '@nestjs/common';
import { AddressDocumentModule } from './model/address-document.module';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';

@Module({
  imports: [AddressDocumentModule],
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [AddressesService, AddressDocumentModule],
})
export class AddressesModule {}
