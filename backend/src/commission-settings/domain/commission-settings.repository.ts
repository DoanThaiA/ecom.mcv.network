import { CommissionSettings } from './commission-settings';

export abstract class CommissionSettingsRepository {
  /**
   * Get the singleton settings document, creating with defaults if not exists
   */
  abstract getOrCreate(): Promise<CommissionSettings>;

  /**
   * Update the singleton settings document (upsert)
   */
  abstract upsert(
    data: Partial<
      Pick<
        CommissionSettings,
        'defaultCommissionRate' | 'autoUpdateProducts' | 'commissionTrigger'
      >
    >,
  ): Promise<CommissionSettings>;

  /**
   * Update the product sync cursor (persisted across deployments)
   */
  abstract updateSyncCursor(cursor: Date): Promise<void>;
}
