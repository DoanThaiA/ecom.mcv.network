import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsEmail,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  Min,
  IsMongoId,
  MaxLength,
  IsBoolean,
  IsPhoneNumber,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Transform, Type } from 'class-transformer';
import { phoneNumberTransformer } from '../../../utils/transformers/phone-number.transformer';
import { PaymentMethod } from '../../order/domain/order.enums';
import { TransformProtoEnum } from '../../../utils/decorators/transform-proto-enum.decorator';
import { PAYMENT_METHOD_PROTO_MAP } from '../../../utils/transformers/proto-enum.transformer';

/**
 * Customer info DTO for checkout session
 */
export class CheckoutSessionCustomerDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Customer full name',
    example: 'Nguyen Van A',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Customer phone number',
    example: '0901234567',
  })
  @Transform(phoneNumberTransformer)
  @IsPhoneNumber('VN', {
    message: i18nValidationMessage('validation.isPhoneNumber'),
  })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Customer email',
    example: 'customer@example.com',
  })
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  @IsOptional()
  email?: string;
}

/**
 * Address DTO for checkout session
 */
export class CheckoutSessionAddressDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Full address',
    example: '123 Nguyen Hue',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Ward/Commune',
    example: 'Ben Nghe',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  ward?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'District',
    example: 'District 1',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  district?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'City/Province',
    example: 'Ho Chi Minh City',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Nhanh city ID for shipping calculation',
    example: 79,
  })
  @IsNumber()
  @IsOptional()
  cityId?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Nhanh district ID for shipping calculation',
    example: 769,
  })
  @IsNumber()
  @IsOptional()
  districtId?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Nhanh ward ID for shipping calculation',
    example: 26740,
  })
  @IsNumber()
  @IsOptional()
  wardId?: number;
}

/**
 * Item DTO for checkout session
 */
export class CheckoutSessionItemDto {
  @ApiProperty({
    type: String,
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Variant ID (if applicable)',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsOptional()
  variantId?: string;

  @ApiProperty({
    type: Number,
    description: 'Quantity',
    minimum: 1,
    example: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

/**
 * DTO for combo item variant selection
 */
export class ComboItemVariantDto {
  @ApiProperty({
    type: String,
    description: 'Product ID (parent product from combo)',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Selected variant ID (if product has variants)',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsOptional()
  variantId?: string;
}

/**
 * DTO for adding a combo to checkout session
 */
export class CheckoutSessionComboDto {
  @ApiProperty({
    type: String,
    description: 'Combo ID',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsNotEmpty()
  comboId: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'Combo instance ID from cart (pass this to enable cart clearing after order)',
  })
  @IsString()
  @IsOptional()
  comboInstanceId?: string;

  @ApiProperty({
    type: [ComboItemVariantDto],
    description: 'Selected variants for each product in combo',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => ComboItemVariantDto)
  items: ComboItemVariantDto[];
}

/**
 * DTO for upserting a checkout session (create or update)
 *
 * If `id` is provided, updates existing session.
 * If `id` is omitted, creates a new session.
 */
export class UpsertCheckoutSessionDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Existing session ID to update (omit to create new)',
    example: '507f1f77bcf86cd799439099',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: [CheckoutSessionItemDto],
    description: 'Standalone items for checkout',
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CheckoutSessionItemDto)
  items?: CheckoutSessionItemDto[];

  @ApiPropertyOptional({
    type: [CheckoutSessionComboDto],
    description: 'Combos for checkout',
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CheckoutSessionComboDto)
  combos?: CheckoutSessionComboDto[];

  @ApiPropertyOptional({
    type: () => CheckoutSessionCustomerDto,
    description: 'Customer information (required for placing order)',
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => CheckoutSessionCustomerDto)
  customer?: CheckoutSessionCustomerDto;

  @ApiPropertyOptional({
    type: () => CheckoutSessionAddressDto,
    description: 'Shipping address (required for placing order)',
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => CheckoutSessionAddressDto)
  shippingAddress?: CheckoutSessionAddressDto;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    enumName: 'PaymentMethod',
    description: 'Payment method (required for placing order)',
    example: PaymentMethod.COD,
  })
  @IsOptional()
  @TransformProtoEnum(PaymentMethod, PAYMENT_METHOD_PROTO_MAP)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    type: String,
    description: 'Order notes',
    example: 'Please call before delivery',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'Affiliate code (e.g. AFF-ABC123). Takes priority over aff_code cookie.',
    example: 'AFF-ABC123',
  })
  @IsString()
  @IsOptional()
  affiliateCode?: string;
}
