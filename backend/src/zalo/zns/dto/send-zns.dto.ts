import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsNotEmpty, IsOptional } from 'class-validator';

export class SendZnsDto {
  @ApiProperty({
    example: '84987654321',
    description: 'Phone number to send ZNS (must include country code)',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: '6081926329735662467',
    description: 'ZNS template ID',
  })
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({
    example: {
      customer_name: 'Nguyen Van A',
      order_code: 'ORD123456',
      product_name: 'Product A',
      quantity: '2',
      total_amount: '500000',
    },
    description: 'Template data parameters',
  })
  @IsObject()
  @IsNotEmpty()
  templateData: Record<string, string> | { [key: string]: string };

  @ApiProperty({
    example: 'order_123',
    description: 'Tracking ID for the message',
    required: false,
  })
  @IsString()
  @IsOptional()
  trackingId?: string;
}
