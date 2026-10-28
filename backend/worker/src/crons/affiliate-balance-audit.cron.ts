import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AffiliateOrderCommissionRepository } from '@app/affiliate-order-commissions/domain/affiliate-order-commission.repository';
import { AffiliateRepository } from '@app/affiliates/domain/affiliate.repository';
import { WithdrawalRequestRepository } from '@app/withdrawal-requests/domain/withdrawal-request.repository';

/**
 * Cron job for auditing affiliate commissions and recomputing balances.
 * Runs every minute with two phases:
 *
 * Phase A — Audit commissions:
 *   1. De-audit: clear auditedAt for commissions whose order status
 *      is no longer successful (e.g. cancelled/refunded).
 *   2. Audit: stamp auditedAt on un-audited commissions with successful status.
 *
 * Phase B — Recompute balances:
 *   For all active affiliates, recompute totalEarned (from audited commissions),
 *   totalWithdrawn (from approved/paid withdrawals), and availableBalance.
 *   Writes the result to the affiliate document.
 */
@Injectable()
export class AffiliateBalanceAuditCron {
  private readonly logger = new Logger(AffiliateBalanceAuditCron.name);
  private readonly BATCH_SIZE = 500;
  private isRunning = false;

  constructor(
    private readonly commissionRepository: AffiliateOrderCommissionRepository,
    private readonly affiliateRepository: AffiliateRepository,
    private readonly withdrawalRequestRepository: WithdrawalRequestRepository,
  ) {}

  /**
   * Main cron entry — every minute
   */
  @Cron('* * * * *')
  async run(): Promise<void> {
    if (this.isRunning) {
      this.logger.debug('Previous audit still running, skipping');
      return;
    }

    this.isRunning = true;
    try {
      await this.phaseA_auditCommissions();
      await this.phaseB_recomputeBalances();
    } catch (error) {
      this.logger.error('Affiliate balance audit failed', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Phase A: De-audit non-successful commissions, then audit eligible ones.
   */
  private async phaseA_auditCommissions(): Promise<void> {
    // Step 1: De-audit commissions whose order status changed to non-successful
    const deaudited = await this.commissionRepository.deauditNonSuccessful();
    if (deaudited > 0) {
      this.logger.log(`Phase A: de-audited ${deaudited} commission records`);
    }

    // Step 2: Audit un-audited commissions with successful status
    let totalAudited = 0;

    while (true) {
      const batch = await this.commissionRepository.findUnaudited(
        this.BATCH_SIZE,
      );
      if (batch.length === 0) break;

      const ids = batch.map((c) => c.id);
      await this.commissionRepository.markAudited(ids);
      totalAudited += ids.length;

      if (batch.length < this.BATCH_SIZE) break;
    }

    if (totalAudited > 0) {
      this.logger.log(`Phase A: audited ${totalAudited} commission records`);
    }
  }

  /**
   * Phase B: Recompute and store balance for all active affiliates.
   */
  private async phaseB_recomputeBalances(): Promise<void> {
    const allAffiliateIds = await this.affiliateRepository.findAllActiveIds();
    let updated = 0;

    for (const affiliateId of allAffiliateIds) {
      const [totalEarned, totalWithdrawn, pendingAmount] = await Promise.all([
        this.commissionRepository.sumAuditedCommission(affiliateId),
        this.withdrawalRequestRepository.sumWithdrawnByAffiliate(affiliateId),
        this.withdrawalRequestRepository.sumPendingByAffiliate(affiliateId),
      ]);

      const availableBalance = Math.max(0, totalEarned - totalWithdrawn);

      await this.affiliateRepository.updateBalance(affiliateId, {
        totalEarned,
        totalWithdrawn,
        pendingAmount,
        availableBalance,
      });
      updated++;
    }

    if (updated > 0) {
      this.logger.debug(
        `Phase B: recomputed balance for ${updated} affiliates`,
      );
    }
  }
}
