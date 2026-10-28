import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReturnRequestType } from '../domain/return-request-type.enum';
import { ReturnReason, ExchangeReason } from '../domain/return-reason.enum';

class BankInfoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountHolder: string;
}

export class CreateReturnRequestDto {
  @ApiProperty({ description: 'Order number to return' })
  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @ApiProperty({ enum: ReturnRequestType })
  @IsEnum(ReturnRequestType)
  requestType: ReturnRequestType;

  @ApiPropertyOptional({ enum: ReturnReason, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ReturnReason, { each: true })
  returnReasons?: ReturnReason[];

  @ApiPropertyOptional({ enum: ExchangeReason, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ExchangeReason, { each: true })
  exchangeReasons?: ExchangeReason[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  otherReason?: string;

  @ApiPropertyOptional({ type: [String], description: 'Uploaded file IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageIds?: string[];

  @ApiPropertyOptional({ type: BankInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BankInfoDto)
  bankInfo?: BankInfoDto;
}
