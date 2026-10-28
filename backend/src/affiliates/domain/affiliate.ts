import { AffiliateType } from './affiliate-type.enum';
import { AffiliateStatus } from './affiliate-status.enum';

export class Affiliate {
  id: string;

  name: string;
  affiliateCode: string;
  type: AffiliateType;
  email: string;
  phone: string;

  bankAccountHolder?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  citizenId?: string | null;
  notes?: string | null;

  status: AffiliateStatus;
  defaultCommissionRate?: number | null;
  autoUpdateProducts: boolean;

  totalEarned?: number;
  totalWithdrawn?: number;
  pendingAmount?: number;
  availableBalance?: number;
  balanceUpdatedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
