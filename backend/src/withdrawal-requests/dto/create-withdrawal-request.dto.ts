import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateWithdrawalRequestDto {
  @ApiProperty({
    type: Number,
    description: 'Amount to withdraw (VND)',
    example: 1000000,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    type: String,
    description: 'Name of the bank account holder',
    example: 'Nguyen Van A',
  })
  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @ApiProperty({
    type: String,
    description: 'Bank account number',
    example: '0123456789',
  })
  @IsString()
  @IsNotEmpty()
  bankAccountNumber: string;

  @ApiProperty({
    type: String,
    description: 'Bank name',
    example: 'Vietcombank',
  })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Optional note',
    example: 'Rut tien thang 2',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
