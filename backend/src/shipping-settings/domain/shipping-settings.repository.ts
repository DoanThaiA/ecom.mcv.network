import { ShippingSettings } from './shipping-settings';

export abstract class ShippingSettingsRepository {
  /**
   * Get the singleton settings document, creating with defaults if not exists
   */
  abstract getOrCreate(): Promise<ShippingSettings>;

  /**
   * Update the singleton settings document (upsert)
   */
  abstract upsert(
    data: Partial<
      Pick<ShippingSettings, 'calculationMethod' | 'fixedShippingFee'>
    >,
  ): Promise<ShippingSettings>;
}
