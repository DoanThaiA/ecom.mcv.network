import { ApiProperty } from '@nestjs/swagger';

export class ZnsResponseDto {
  @ApiProperty({
    example: 0,
    description: 'Error code (0 = success)',
  })
  error: number;

  @ApiProperty({
    example: 'Success',
    description: 'Error message',
  })
  message: string;

  @ApiProperty({
    example: {
      msg_id: '123456789',
      sent_time: '2024-01-01 12:00:00',
    },
    description: 'Response data',
    required: false,
  })
  data?: {
    msg_id?: string;
    sent_time?: string;
  };
}
