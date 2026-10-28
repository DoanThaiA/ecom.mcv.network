import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddProductCommissionItemDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;
}

export class AddProductCommissionsDto {
  @ApiProperty({ type: [AddProductCommissionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddProductCommissionItemDto)
  products: AddProductCommissionItemDto[];
}
