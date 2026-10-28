import { CommissionTrigger } from './commission-trigger.enum';

export class CommissionSettings {
  id: string;
  defaultCommissionRate: number;
  autoUpdateProducts: boolean;
  commissionTrigger: CommissionTrigger;
  lastProductSyncCursor?: Date | null;
  updatedAt: Date;
}
