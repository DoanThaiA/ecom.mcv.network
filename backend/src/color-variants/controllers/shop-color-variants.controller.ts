import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ColorVariantsService } from '../color-variants.service';
import { BatchLookupColorsDto } from '../dto/batch-lookup-colors.dto';
import { ColorVariant } from '../domain/color-variant';

/**
 * Controller for color variant public endpoints (shop)
 * No authentication required
 */
@ApiTags('Shop - Color Variants')
@Controller({ path: 'shop/color-variants', version: '1' })
export class ShopColorVariantsController {
  constructor(private readonly colorVariantsService: ColorVariantsService) {}

  /**
   * Get all color variants for the shop
   * Returns cached response (1 hour)
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({
    summary: 'Get all color variants',
    description:
      'Returns all color variants for the shop. Response is cached for 1 hour.',
  })
  @ApiOkResponse({
    description: 'List of all color variants',
    type: [ColorVariant],
  })
  async findAll(): Promise<ColorVariant[]> {
    return this.colorVariantsService.findAllColors();
  }

  /**
   * Batch lookup color variants by names
   * Useful for resolving product color names to visual data
   */
  @Post('lookup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Batch lookup color variants by names',
    description:
      'Look up multiple color variants by their names. Returns matching color variants.',
  })
  @ApiOkResponse({
    description: 'Matching color variants',
    type: [ColorVariant],
  })
  async batchLookup(
    @Body() dto: BatchLookupColorsDto,
  ): Promise<ColorVariant[]> {
    return this.colorVariantsService.batchLookupByNames(dto.names);
  }
}
