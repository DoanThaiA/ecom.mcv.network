import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard response for webhook endpoint
 */
export class NhanhWebhookResponseDto {
  @ApiProperty({
    description: 'Whether webhook was processed successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Optional message about processing',
    example: 'Webhook processed successfully',
    required: false,
  })
  message?: string;
}
