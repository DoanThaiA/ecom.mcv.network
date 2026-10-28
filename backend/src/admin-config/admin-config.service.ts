import { Injectable, Logger } from '@nestjs/common';
import { AdminConfigRepository } from './admin-config.repository';

/**
 * Admin configuration fields definition
 * Add new fields here to make them available on the /admin/config page
 */
export const ADMIN_CONFIG_FIELDS = [
  {
    key: 'registration_voucher_release_event_id',
    label: 'Registration Voucher Release Event ID',
    description:
      'CDP voucher release event ID for new user registration vouchers',
  },
  {
    key: 'cdp_brand_id',
    label: 'CDP Brand ID',
    description: 'CDP brand ID used for API calls',
  },
] as const;

export type AdminConfigKey = (typeof ADMIN_CONFIG_FIELDS)[number]['key'];

@Injectable()
export class AdminConfigService {
  private readonly logger = new Logger(AdminConfigService.name);

  constructor(private readonly adminConfigRepo: AdminConfigRepository) {}

  /**
   * Get a config value by key
   * @param key - Config key
   * @returns The config value or null if not set
   */
  async get(key: string): Promise<string | null> {
    return this.adminConfigRepo.get<string>(key);
  }

  /**
   * Set a config value
   * @param key - Config key
   * @param value - Config value
   */
  async set(key: string, value: string): Promise<void> {
    await this.adminConfigRepo.set(key, value);
    this.logger.log(`Config updated: ${key}`);
  }

  /**
   * Get all config values
   * @returns Record of all config key-value pairs
   */
  async getAll(): Promise<Record<string, string>> {
    const configs: Record<string, string> = {};
    for (const field of ADMIN_CONFIG_FIELDS) {
      const value = await this.get(field.key);
      configs[field.key] = value || '';
    }
    return configs;
  }
}
