import { ApiProperty } from '@nestjs/swagger';
import { ZaloOaInfoDto } from './zalo-oa-info.dto';

export class ZaloOaConnectionDto {
  @ApiProperty({
    description: 'Unix timestamp when the access token expires',
    example: 1706749200,
  })
  expiresAt: number;

  @ApiProperty({
    description: 'Unix timestamp when the refresh token expires',
    example: 1714521600,
  })
  refreshTokenExpiresAt: number;

  @ApiProperty({
    description: 'Information about the connected Zalo Official Account',
    type: ZaloOaInfoDto,
  })
  oaInfo: ZaloOaInfoDto;
}
