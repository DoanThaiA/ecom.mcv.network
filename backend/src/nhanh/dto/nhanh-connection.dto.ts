import { ApiProperty } from '@nestjs/swagger';

export class NhanhConnectionDto {
  @ApiProperty({
    description: 'API version',
    example: 'v2',
  })
  version: string;

  @ApiProperty({
    description: 'Token expiration timestamp',
    example: 1735689600,
  })
  expiredAt: number;

  @ApiProperty({
    description: 'Business ID',
    example: 12345,
  })
  businessId: number;

  @ApiProperty({
    description: 'Depot/warehouse IDs',
    example: [1, 2, 3],
    oneOf: [{ type: 'array', items: { type: 'number' } }, { type: 'string' }],
  })
  depotIds: number[] | string;

  @ApiProperty({
    description: 'Page IDs',
    example: [1, 2],
    oneOf: [{ type: 'array', items: { type: 'number' } }, { type: 'string' }],
  })
  pageIds: number[] | string;

  @ApiProperty({
    description: 'Granted permissions',
    example: ['Product.Index', 'Product.Detail'],
    oneOf: [{ type: 'array', items: { type: 'string' } }, { type: 'string' }],
  })
  permissions: string[] | string;
}
