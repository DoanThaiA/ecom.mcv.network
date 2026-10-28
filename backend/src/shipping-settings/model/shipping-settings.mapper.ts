import { ShippingSettings } from '../domain/shipping-settings';
import { ShippingSettingsSchemaClass } from './shipping-settings.schema';

export class ShippingSettingsMapper {
  static toDomain(raw: ShippingSettingsSchemaClass): ShippingSettings {
    const domain = new ShippingSettings();
    domain.id = raw._id.toString();
    domain.calculationMethod = raw.calculationMethod;
    domain.fixedShippingFee = raw.fixedShippingFee;
    domain.updatedAt = raw.updatedAt;
    return domain;
  }
}
