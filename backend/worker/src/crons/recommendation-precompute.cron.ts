import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RecommendationsService } from '@app/recommendations/recommendations.service';

/**
 * Cron job for pre-computing product recommendations
 * Runs every 10 minutes to build personalized + trending recommendations
 */
@Injectable()
export class RecommendationPrecomputeCron {
  private readonly logger = new Logger(RecommendationPrecomputeCron.name);
  private isRunning = false;

  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  /**
   * Pre-compute recommendations every 10 minutes
   * Builds personalized recommendations for active users and global trending
   */
  // TODO: Increase for production
  @Cron('*/10 * * * *')
  async handleCron(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn(
        'Recommendation pre-computation already running, skipping',
      );
      return;
    }

    this.isRunning = true;
    this.logger.log('Starting scheduled recommendation pre-computation');

    try {
      await this.recommendationsService.precomputeRecommendations();
      this.logger.log('Scheduled recommendation pre-computation completed');
    } catch (error) {
      this.logger.error(
        `Scheduled recommendation pre-computation failed: ${error.message}`,
        error.stack,
      );
    } finally {
      this.isRunning = false;
    }
  }
}
