import { Module } from '@nestjs/common';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { NhanhModule } from '../../nhanh/nhanh.module';
import { ProductDocumentModule } from '../../products/model/product-document.module';
import { DepotDocumentModule } from '../../depots/model/depot-document.module';
import { ShippingSettingsDocumentModule } from '../../shipping-settings/model/shipping-settings-document.module';

/**
 * Shop Shipping Module
 * Provides public endpoints for shipping-related operations:
 * - Location data (cities, districts, wards) for address selection
 * - Shipping fee calculation (single depot approach)
 */
@Module({
  imports: [
    NhanhModule,
    ProductDocumentModule,
    DepotDocumentModule,
    ShippingSettingsDocumentModule,
  ],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
