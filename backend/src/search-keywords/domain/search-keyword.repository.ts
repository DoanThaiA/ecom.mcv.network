/**
 * Abstract repository interface for SearchKeyword entity
 */
export abstract class SearchKeywordRepository {
  /**
   * Increment the search count for a keyword on today's date (upsert).
   * @param keyword - Normalized keyword string
   */
  abstract increment(keyword: string): Promise<void>;

  /**
   * Get top searched keywords within a time range
   * @param days - Number of days to look back
   * @param limit - Maximum number of keywords to return
   * @returns List of keywords sorted by search count desc
   */
  abstract getTopKeywords(days: number, limit: number): Promise<string[]>;
}
