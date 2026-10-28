import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class NhanhCallbackDto {
  @ApiProperty({
    description: 'Access code returned from Nhanh.vn OAuth',
    example: 'abc123xyz456',
  })
  @IsNotEmpty()
  @IsString()
  accessCode: string;
}
