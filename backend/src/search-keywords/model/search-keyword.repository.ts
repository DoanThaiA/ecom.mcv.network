import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchKeywordRepository } from '../domain/search-keyword.repository';
import { SearchKeywordSchemaClass } from './search-keyword.schema';

/**
 * Mongoose implementation of SearchKeywordRepository.
 * Uses upsert + $inc to maintain one document per (keyword, date) bucket.
 */
@Injectable()
export class SearchKeywordDocumentRepository
  implements SearchKeywordRepository
{
  constructor(
    @InjectModel(SearchKeywordSchemaClass.name)
    private readonly searchKeywordModel: Model<SearchKeywordSchemaClass>,
  ) {}

  /**
   * Increment the search count for a keyword on today's UTC date (upsert).
   * @param keyword - Normalized keyword string
   */
  async increment(keyword: string): Promise<void> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await this.searchKeywordModel.findOneAndUpdate(
      { keyword, date: today },
      { $inc: { count: 1 } },
      { upsert: true },
    );
  }

  /**
   * Get top searched keywords within a time range using aggregation
   * @param days - Number of days to look back
   * @param limit - Maximum number of keywords to return
   * @returns List of keywords sorted by total count desc
   */
  async getTopKeywords(days: number, limit: number): Promise<string[]> {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setDate(since.getDate() - days);

    const result = await this.searchKeywordModel.aggregate([
      { $match: { date: { $gte: since } } },
      { $group: { _id: '$keyword', total: { $sum: '$count' } } },
      { $sort: { total: -1 } },
      { $limit: limit },
    ]);

    return result.map((r) => r._id as string);
  }
}
