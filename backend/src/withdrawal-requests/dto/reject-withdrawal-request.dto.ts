import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectWithdrawalRequestDto {
  @ApiProperty({
    type: String,
    description: 'Reason for rejection',
    example: 'Thong tin tai khoan khong chinh xac',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
