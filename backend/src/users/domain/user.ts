import { Exclude, Expose } from 'class-transformer';
import { File } from '../../files/domain/file';
import { StatusEnum } from '../../statuses/statuses.enum';
import { ApiProperty } from '@nestjs/swagger';
import { SocialAccount } from './social-account';

const idType = String;

export class User {
  @ApiProperty({
    type: idType,
  })
  id: number | string;

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  @Expose({ groups: ['me', 'admin'] })
  email?: string | null;

  @ApiProperty({
    type: String,
    example: '+84123456789',
  })
  @Expose({ groups: ['me', 'admin'] })
  phone?: string | null;

  @Exclude({ toPlainOnly: true })
  password?: string;

  @ApiProperty({
    type: String,
    example: '69242832db1cb4a085dbcdcf',
  })
  @Expose({ groups: ['me', 'admin'] })
  cdpCustomerId?: string | null;

  @ApiProperty({
    type: String,
    example: 'KH00001',
  })
  @Expose({ groups: ['me', 'admin'] })
  cdpCustomerCode?: string | null;

  @ApiProperty({
    type: String,
    example: 'email',
  })
  @Expose({ groups: ['me', 'admin'] })
  provider: string;

  @ApiProperty({
    type: String,
    example: '1234567890',
  })
  @Expose({ groups: ['me', 'admin'] })
  socialId?: string | null;

  @ApiProperty({
    type: String,
    example: 'John',
  })
  firstName: string | null;

  @ApiProperty({
    type: String,
    example: 'Doe',
  })
  lastName?: string | null;

  @ApiProperty({
    type: () => File,
  })
  photo?: File | null;

  @ApiProperty({
    type: String,
    example: 'https://lh3.googleusercontent.com/a/example',
  })
  socialAvatarUrl?: string | null;

  @ApiProperty({
    enum: StatusEnum,
    enumName: 'StatusEnum',
    nullable: true,
  })
  status?: StatusEnum | null;

  @ApiProperty({
    type: () => [SocialAccount],
    description: 'List of connected social accounts',
  })
  @Expose({ groups: ['me', 'admin'] })
  socialAccounts?: SocialAccount[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;
}
