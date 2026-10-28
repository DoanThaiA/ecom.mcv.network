import { Injectable } from '@nestjs/common';
import { ShippingSettingsRepository } from './domain/shipping-settings.repository';
import { ShippingSettings } from './domain/shipping-settings';
import { UpdateShippingSettingsDto } from './dto/update-shipping-settings.dto';

@Injectable()
export class ShippingSettingsService {
  constructor(
    private readonly shippingSettingsRepository: ShippingSettingsRepository,
  ) {}

  /**
   * Get global shipping settings (singleton)
   */
  async get(): Promise<ShippingSettings> {
    return this.shippingSettingsRepository.getOrCreate();
  }

  /**
   * Update global shipping settings
   */
  async update(dto: UpdateShippingSettingsDto): Promise<ShippingSettings> {
    return this.shippingSettingsRepository.upsert(dto);
  }
}
