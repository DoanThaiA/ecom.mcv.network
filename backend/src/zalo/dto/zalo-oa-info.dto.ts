import { ApiProperty } from '@nestjs/swagger';

export class ZaloOaInfoDto {
  @ApiProperty({
    description: 'Official Account ID',
    example: '1234567890',
  })
  oa_id: string;

  @ApiProperty({
    description: 'Official Account name',
    example: 'My Store',
  })
  name: string;

  @ApiProperty({
    description: 'Official Account description',
    example: 'Official store for amazing products',
  })
  description: string;

  @ApiProperty({
    description: 'Category name',
    example: 'E-commerce',
  })
  cate_name: string;

  @ApiProperty({
    description: 'Number of followers',
    example: 1500,
  })
  num_follower: number;

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  avatar: string;

  @ApiProperty({
    description: 'Cover image URL',
    example: 'https://example.com/cover.jpg',
  })
  cover: string;
}
