import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CommissionSettingsRepository } from './domain/commission-settings.repository';
import { CommissionSettings } from './domain/commission-settings';
import { UpdateCommissionSettingsDto } from './dto/update-commission-settings.dto';
import { JobsService } from '../jobs/jobs.service';
import { JobType } from '../jobs/domain/job-type.enum';
import { throwException } from '../utils/errors/throw-exception';

@Injectable()
export class CommissionSettingsService {
  constructor(
    private readonly commissionSettingsRepository: CommissionSettingsRepository,
    private readonly i18n: I18nService,
    @Optional() private readonly jobsService?: JobsService,
  ) {}

  /**
   * Get global commission settings (singleton)
   */
  async get(): Promise<CommissionSettings & { isRecalculating?: boolean }> {
    const settings = await this.commissionSettingsRepository.getOrCreate();
    let isRecalculating = false;

    if (this.jobsService) {
      try {
        // Check if there's an active recalculation job for global scope
        const activeJob =
          await this.jobsService.findActiveRecalculationJob('global');
        isRecalculating = !!activeJob;
      } catch {
        // If job service is not available, default to false
      }
    }

    return { ...settings, isRecalculating };
  }

  /**
   * Update global commission settings
   * Triggers rate recalculation job if defaultCommissionRate changes
   */
  async update(
    dto: UpdateCommissionSettingsDto,
  ): Promise<CommissionSettings & { jobId?: string }> {
    const current = await this.commissionSettingsRepository.getOrCreate();
    const rateChanged =
      dto.defaultCommissionRate !== undefined &&
      dto.defaultCommissionRate !== current.defaultCommissionRate;

    // If rate is changing, check for active recalculation job
    if (rateChanged && this.jobsService) {
      const activeJob =
        await this.jobsService.findActiveRecalculationJob('global');
      if (activeJob) {
        throwException({
          status: HttpStatus.CONFLICT,
          message: this.i18n.t('job.alreadyRunning'),
        });
      }
    }

    const updated = await this.commissionSettingsRepository.upsert(dto);

    // Trigger recalculation job if rate changed
    let jobId: string | undefined;
    if (rateChanged && this.jobsService) {
      const jobResult = await this.jobsService.startJob(
        JobType.COMMISSION_RATE_RECALCULATION,
        {
          scope: 'global',
          newRate: dto.defaultCommissionRate,
        },
      );
      jobId = jobResult.jobId;
    }

    return { ...updated, jobId };
  }
}
