import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for a single menu order update item
 */
export class MenuOrderItemDto {
  @ApiProperty({ type: String, description: 'Menu ID' })
  @IsString()
  id: string;

  @ApiProperty({ type: Number, description: 'New display order' })
  @IsNumber()
  @Min(0)
  order: number;
}

/**
 * DTO for bulk reordering menus
 */
export class ReorderMenusDto {
  @ApiProperty({ type: [MenuOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuOrderItemDto)
  menus: MenuOrderItemDto[];
}
