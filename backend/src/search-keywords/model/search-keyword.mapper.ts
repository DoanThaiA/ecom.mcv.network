import { SearchKeyword } from '../domain/search-keyword';
import { SearchKeywordSchemaClass } from './search-keyword.schema';

/**
 * Mapper for converting between SearchKeyword domain entity and Mongoose document
 */
export class SearchKeywordMapper {
  /**
   * Convert Mongoose document to domain entity
   * @param raw - Mongoose document
   * @returns SearchKeyword domain entity
   */
  static toDomain(raw: SearchKeywordSchemaClass): SearchKeyword {
    const domainEntity = new SearchKeyword();

    domainEntity.id = raw._id.toString();
    domainEntity.keyword = raw.keyword;
    domainEntity.date = raw.date;
    domainEntity.count = raw.count;

    return domainEntity;
  }
}
