import { ApiProperty } from '@nestjs/swagger';
import { AuthProvidersEnum } from '../../auth/auth-providers.enum';

export class SocialAccount {
  @ApiProperty({
    enum: AuthProvidersEnum,
    enumName: 'AuthProvidersEnum',
    example: 'facebook',
  })
  provider: AuthProvidersEnum;

  @ApiProperty({
    type: String,
    example: '1234567890',
  })
  socialId: string;

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
    nullable: true,
  })
  email?: string | null;

  @ApiProperty({
    type: String,
    example: 'John',
    nullable: true,
  })
  firstName?: string | null;

  @ApiProperty({
    type: String,
    example: 'Doe',
    nullable: true,
  })
  lastName?: string | null;

  @ApiProperty({
    type: String,
    example: 'https://lh3.googleusercontent.com/a/example',
    nullable: true,
  })
  avatarUrl?: string | null;

  @ApiProperty()
  connectedAt: Date;
}
