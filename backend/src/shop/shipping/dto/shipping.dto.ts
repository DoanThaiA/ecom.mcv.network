import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsNotEmpty,
  Min,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';

/**
 * Location response DTO for cities, districts, and wards
 */
export class LocationDto {
  @ApiProperty({ description: 'Location ID', example: 79 })
  id: number;

  @ApiProperty({ description: 'Location name', example: 'Ho Chi Minh' })
  name: string;

  @ApiProperty({
    description: 'Alternative name (if any)',
    example: 'Saigon',
    required: false,
  })
  otherName?: string;
}

/**
 * Response wrapper for location list
 */
export class LocationListResponseDto {
  @ApiProperty({ type: [LocationDto], description: 'List of locations' })
  data: LocationDto[];
}

/**
 * Shipping address for calculation
 */
export class CalculateShippingAddressDto {
  @ApiProperty({
    type: Number,
    description: 'Nhanh city ID',
    example: 79,
  })
  @IsNumber()
  @IsNotEmpty()
  cityId: number;

  @ApiProperty({
    type: Number,
    description: 'Nhanh district ID',
    example: 769,
  })
  @IsNumber()
  @IsNotEmpty()
  districtId: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Nhanh ward ID',
    example: 26740,
  })
  @IsNumber()
  @IsOptional()
  wardId?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Street address for more accurate calculation',
    example: '123 Nguyen Hue',
  })
  @IsString()
  @IsOptional()
  address?: string;
}

/**
 * Item for shipping calculation
 */
export class CalculateShippingItemDto {
  @ApiProperty({
    type: String,
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    type: Number,
    description: 'Quantity',
    minimum: 1,
    example: 2,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

/**
 * Request DTO for calculating shipping fees
 */
export class CalculateShippingDto {
  @ApiProperty({
    type: () => CalculateShippingAddressDto,
    description: 'Shipping destination address',
  })
  @ValidateNested()
  @Type(() => CalculateShippingAddressDto)
  shippingAddress: CalculateShippingAddressDto;

  @ApiProperty({
    type: [CalculateShippingItemDto],
    description: 'Items to calculate shipping for',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CalculateShippingItemDto)
  items: CalculateShippingItemDto[];
}

/**
 * Carrier option in shipping response
 */
export class ShippingCarrierOptionDto {
  @ApiProperty({ description: 'Carrier ID', example: 1 })
  carrierId: number;

  @ApiProperty({ description: 'Carrier name', example: 'GHN' })
  carrierName: string;

  @ApiProperty({
    description: 'Carrier logo URL',
    example: 'https://nhanh.vn/carriers/ghn.png',
  })
  carrierLogo: string;

  @ApiProperty({ description: 'Service ID from Nhanh', example: 1 })
  serviceId: number;

  @ApiProperty({ description: 'Service name', example: 'Standard' })
  serviceName: string;

  @ApiProperty({ description: 'Service code', example: 'STANDARD' })
  serviceCode: string;

  @ApiProperty({ description: 'Base shipping fee', example: 25000 })
  shipFee: number;

  @ApiProperty({ description: 'COD handling fee', example: 0 })
  codFee: number;

  @ApiProperty({ description: 'Total fee charged to customer', example: 25000 })
  customerShipFee: number;

  @ApiProperty({
    description:
      'Carrier type: 1=NHANH_CONNECTION (NVN), 2=SHOP_ACCOUNT (NVS), 3=SELF_SHIP (TVC)',
    example: 2,
  })
  carrierType: 1 | 2 | 3;

  @ApiPropertyOptional({
    description: 'Carrier account ID (for SHOP_ACCOUNT type)',
    example: 123,
  })
  accountId?: number;

  @ApiPropertyOptional({
    description: 'Shop ID at carrier (for SHOP_ACCOUNT type)',
    example: 'SHOP123',
  })
  shopId?: string;
}

/**
 * Item info in depot group response
 */
export class ShippingGroupItemDto {
  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Product name' })
  productName: string;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @ApiProperty({ description: 'Weight in grams' })
  weight: number;
}

/**
 * Response DTO for shipping calculation
 * Single depot approach - all items ship from one depot
 *
 * Carrier Selection Logic (SHOP_ACCOUNT / NVS):
 * - Use SPX Express (carrierId: 29)
 * - If SPX has no rate for the route, fall back to SELF_SHIP / "Tự Vận
 *   Chuyển" (TVC). Viettel Post is no longer used.
 */
export class CalculateShippingResponseDto {
  @ApiProperty({
    description: 'Depot information',
    example: { id: 1, name: 'Warehouse HCM' },
  })
  depot: {
    id: number;
    name: string;
  };

  @ApiProperty({
    type: [ShippingGroupItemDto],
    description: 'Items to be shipped',
  })
  items: ShippingGroupItemDto[];

  @ApiProperty({ description: 'Total weight in grams', example: 400 })
  totalWeight: number;

  @ApiProperty({
    description: 'Total order value',
    example: 500000,
  })
  totalValue: number;

  @ApiProperty({
    type: ShippingCarrierOptionDto,
    description:
      'Selected carrier (SPX Express preferred, fallback to first available)',
  })
  selectedCarrier: ShippingCarrierOptionDto;

  @ApiProperty({
    description: 'Total shipping fee',
    example: 25000,
  })
  totalShippingFee: number;
}
