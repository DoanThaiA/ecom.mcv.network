import { CommissionSettings } from '../domain/commission-settings';
import { CommissionTrigger } from '../domain/commission-trigger.enum';
import { CommissionSettingsSchemaClass } from './commission-settings.schema';

export class CommissionSettingsMapper {
  static toDomain(raw: CommissionSettingsSchemaClass): CommissionSettings {
    const domain = new CommissionSettings();
    domain.id = raw._id.toString();
    domain.defaultCommissionRate = raw.defaultCommissionRate;
    domain.autoUpdateProducts = raw.autoUpdateProducts;
    domain.commissionTrigger =
      raw.commissionTrigger ?? CommissionTrigger.ORDER_CREATION;
    domain.lastProductSyncCursor = raw.lastProductSyncCursor ?? null;
    domain.updatedAt = raw.updatedAt;
    return domain;
  }
}
