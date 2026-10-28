import { ApiProperty } from '@nestjs/swagger';
import { CmsUser } from '../../cms-users/domain/cms-user';

export class CmsLoginResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  tokenExpires: number;

  @ApiProperty({
    type: () => CmsUser,
  })
  user: CmsUser;
}
