import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class AuthGoogleLoginDto {
  @ApiProperty({
    example: '4/0AeanNXMBxkj...',
    description:
      'Authorization code from Google OAuth (Authorization Code Flow)',
    required: false,
  })
  @IsString()
  code: string;

  @ApiProperty({
    example: 'random_state_string',
    description: 'State parameter for CSRF protection',
    required: false,
  })
  @IsOptional()
  @IsString()
  state?: string;
}
