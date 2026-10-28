import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { WithdrawalRequestRepository } from './domain/withdrawal-request.repository';
import {
  WithdrawalRequest,
  WithdrawalRequestStatus,
} from './domain/withdrawal-request';
import { AffiliateRepository } from '../affiliates/domain/affiliate.repository';
import { CmsUserRepository } from '../cms-users/domain/cms-user.repository';
import { CreateWithdrawalRequestDto } from './dto/create-withdrawal-request.dto';
import { QueryWithdrawalRequestsDto } from './dto/query-withdrawal-requests.dto';

@Injectable()
export class WithdrawalRequestsService {
  private readonly logger = new Logger(WithdrawalRequestsService.name);

  constructor(
    private readonly withdrawalRequestRepository: WithdrawalRequestRepository,
    private readonly affiliateRepository: AffiliateRepository,
    private readonly cmsUserRepository: CmsUserRepository,
  ) {}

  /**
   * Create a new withdrawal request for an affiliate.
   * Called by affiliate portal (affiliate creates their own request).
   */
  async create(
    affiliateId: string,
    dto: CreateWithdrawalRequestDto,
  ): Promise<WithdrawalRequest> {
    const affiliate = await this.affiliateRepository.findById(affiliateId);
    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }

    const request = await this.withdrawalRequestRepository.create({
      affiliateId,
      agentName: affiliate.name,
      recipientName: dto.recipientName,
      bankAccountNumber: dto.bankAccountNumber,
      bankName: dto.bankName,
      amount: dto.amount,
      note: dto.note ?? null,
      status: WithdrawalRequestStatus.pending,
      requestDate: new Date(),
      processedBy: null,
      processedDate: null,
      rejectionReason: null,
    });

    this.logger.log(
      `Withdrawal request created: ${request.id} by affiliate ${affiliateId}`,
    );
    return request;
  }

  /**
   * Get paginated list of withdrawal requests (admin view - all affiliates).
   */
  async findAll(query: QueryWithdrawalRequestsDto) {
    return this.withdrawalRequestRepository.findMany({
      paginationOptions: { page: query.page ?? 1, limit: query.limit ?? 10 },
      filter: {
        status: query.status,
        search: query.search,
      },
    });
  }

  /**
   * Get paginated list of withdrawal requests for a specific affiliate (affiliate portal).
   */
  async findByAffiliate(
    affiliateId: string,
    query: QueryWithdrawalRequestsDto,
  ) {
    return this.withdrawalRequestRepository.findMany({
      paginationOptions: { page: query.page ?? 1, limit: query.limit ?? 10 },
      filter: {
        affiliateId,
        status: query.status,
      },
    });
  }

  /**
   * Get a single withdrawal request by ID.
   * Optionally verify ownership for affiliate access.
   */
  async findOne(id: string, affiliateId?: string): Promise<WithdrawalRequest> {
    const request = await this.withdrawalRequestRepository.findById(id);
    if (!request) {
      throw new NotFoundException(`Withdrawal request ${id} not found`);
    }
    if (affiliateId && request.affiliateId !== affiliateId) {
      throw new ForbiddenException('Access denied');
    }
    return request;
  }

  /**
   * Approve a pending withdrawal request (admin only).
   */
  async approve(id: string, adminEmail: string): Promise<WithdrawalRequest> {
    const request = await this.findOne(id);
    if (request.status !== WithdrawalRequestStatus.pending) {
      throw new ForbiddenException('Only pending requests can be approved');
    }

    const updated = await this.withdrawalRequestRepository.updateStatus(
      id,
      WithdrawalRequestStatus.approved,
      { processedBy: adminEmail, processedDate: new Date() },
    );

    return updated!;
  }

  /**
   * Reject a pending withdrawal request (admin only).
   */
  async reject(
    id: string,
    adminEmail: string,
    reason: string,
  ): Promise<WithdrawalRequest> {
    const request = await this.findOne(id);
    if (request.status !== WithdrawalRequestStatus.pending) {
      throw new ForbiddenException('Only pending requests can be rejected');
    }

    const updated = await this.withdrawalRequestRepository.updateStatus(
      id,
      WithdrawalRequestStatus.rejected,
      {
        processedBy: adminEmail,
        processedDate: new Date(),
        rejectionReason: reason,
      },
    );

    return updated!;
  }

  /**
   * Mark an approved withdrawal request as paid (admin only).
   */
  async pay(id: string, adminEmail: string): Promise<WithdrawalRequest> {
    const request = await this.findOne(id);
    if (request.status !== WithdrawalRequestStatus.approved) {
      throw new ForbiddenException(
        'Only approved requests can be marked as paid',
      );
    }

    const updated = await this.withdrawalRequestRepository.updateStatus(
      id,
      WithdrawalRequestStatus.paid,
      { processedBy: adminEmail, processedDate: new Date() },
    );

    return updated!;
  }

  /**
   * Bulk approve multiple pending withdrawal requests (admin only).
   */
  async bulkApprove(ids: string[], adminEmail: string): Promise<void> {
    await Promise.all(
      ids.map((id) => this.approve(id, adminEmail).catch(() => {})),
    );
  }

  /**
   * Bulk reject multiple pending withdrawal requests (admin only).
   */
  async bulkReject(
    ids: string[],
    adminEmail: string,
    reason: string,
  ): Promise<void> {
    await Promise.all(
      ids.map((id) => this.reject(id, adminEmail, reason).catch(() => {})),
    );
  }

  /**
   * Bulk mark approved withdrawal requests as paid (admin only).
   */
  async bulkPay(ids: string[], adminEmail: string): Promise<void> {
    await Promise.all(
      ids.map((id) => this.pay(id, adminEmail).catch(() => {})),
    );
  }

  /**
   * Get pre-computed available balance for an affiliate.
   * All fields are updated by the AffiliateBalanceAuditCron every minute.
   */
  async getBalance(affiliateId: string): Promise<{
    totalEarned: number;
    totalWithdrawn: number;
    pendingAmount: number;
    availableBalance: number;
    balanceUpdatedAt: Date | null;
  }> {
    const affiliate = await this.affiliateRepository.findById(affiliateId);
    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }
    return {
      totalEarned: affiliate.totalEarned ?? 0,
      totalWithdrawn: affiliate.totalWithdrawn ?? 0,
      pendingAmount: affiliate.pendingAmount ?? 0,
      availableBalance: affiliate.availableBalance ?? 0,
      balanceUpdatedAt: affiliate.balanceUpdatedAt ?? null,
    };
  }

  /**
   * Resolve a processor user ID to a display name.
   * Returns the user's firstName + lastName, or the original value if not found.
   */
  async resolveProcessorName(
    processedBy: string | null | undefined,
  ): Promise<string | null> {
    if (!processedBy) return null;
    try {
      const user = await this.cmsUserRepository.findById(processedBy);
      if (user) {
        const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
        return name || processedBy;
      }
    } catch {
      // ID format mismatch or DB error — fall back to raw value
    }
    return processedBy;
  }
}
