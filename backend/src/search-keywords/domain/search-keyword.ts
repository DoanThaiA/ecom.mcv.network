import { ApiProperty } from '@nestjs/swagger';

/**
 * Search keyword domain entity
 * Tracks daily search counts per keyword for popularity ranking
 */
export class SearchKeyword {
  @ApiProperty({ type: String, description: 'Search keyword record ID' })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Normalized keyword (lowercase, accent-stripped)',
  })
  keyword: string;

  @ApiProperty({ type: Date, description: 'UTC date bucket (start of day)' })
  date: Date;

  @ApiProperty({ type: Number, description: 'Number of searches on this date' })
  count: number;
}
