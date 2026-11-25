import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class NhanhCallbackDto {
  @ApiProperty({
    description: 'Access code returned from Nhanh.vn OAuth',
    example: 'abc123xyz456',
  })
  @IsNotEmpty()
  @IsString()
  accessCode: string;

  @ApiProperty({
    description: 'Verify code echoed back by Nhanh.vn in the redirect',
    example: 'f3a9c1d27b8e4d0a95c6e1b2a7d84f03',
    required: false,
  })
  @IsOptional()
  @IsString()
  verifyCode?: string;
}
