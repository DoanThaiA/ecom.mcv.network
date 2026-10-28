import { Injectable, Logger } from '@nestjs/common';
import { SearchKeywordRepository } from './domain/search-keyword.repository';

const TOP_KEYWORDS_DAYS = 30;
const TOP_KEYWORDS_LIMIT = 10;
const MIN_KEYWORD_LENGTH = 2;

/**
 * Service for tracking and querying search keywords
 */
@Injectable()
export class SearchKeywordsService {
  private readonly logger = new Logger(SearchKeywordsService.name);

  constructor(
    private readonly searchKeywordRepository: SearchKeywordRepository,
  ) {}

  /**
   * Track a search keyword (fire-and-forget)
   * Normalizes the keyword (lowercase, accent-stripped) before storing
   * @param search - Raw search string from the user
   */
  async trackKeyword(search: string): Promise<void> {
    try {
      const keyword = this.normalizeKeyword(search);
      if (keyword.length < MIN_KEYWORD_LENGTH) {
        return;
      }

      await this.searchKeywordRepository.increment(keyword);
    } catch (error) {
      // Fire-and-forget: log but don't throw
      this.logger.warn(`Failed to track search keyword: ${error.message}`);
    }
  }

  /**
   * Get top searched keywords from the last 30 days
   * @returns List of keyword strings sorted by popularity
   */
  async getTopKeywords(): Promise<string[]> {
    return this.searchKeywordRepository.getTopKeywords(
      TOP_KEYWORDS_DAYS,
      TOP_KEYWORDS_LIMIT,
    );
  }

  /**
   * Normalize keyword: trim, lowercase, strip Vietnamese diacritics
   * @param search - Raw search string
   * @returns Normalized keyword
   */
  private normalizeKeyword(search: string): string {
    return search
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}
