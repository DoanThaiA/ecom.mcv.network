import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ZaloOaCallbackDto {
  @ApiProperty({
    description: 'Authorization code returned from Zalo OA OAuth',
    example: 'abc123xyz456',
  })
  @IsNotEmpty()
  @IsString()
  code: string;
}
