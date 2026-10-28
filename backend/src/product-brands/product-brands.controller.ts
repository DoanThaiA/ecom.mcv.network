import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProductBrandsService } from './product-brands.service';
import { QueryProductBrandDto } from './dto/product-query-brand.dto';
import { infinityPaginationFromPaginate } from '../utils/infinity-pagination';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../utils/dto/infinity-pagination-response.dto';
import { ProductBrand } from './domain/product-brand';

/**
 * Controller for product brand endpoints (CMS only)
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'))
@ApiTags('Product Brands')
@Controller({
  path: 'product-brands',
  version: '1',
})
export class ProductBrandsController {
  constructor(private readonly brandsService: ProductBrandsService) {}

  /**
   * Get all brands with pagination
   */
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get list of brands' })
  @ApiOkResponse({
    description: 'List of brands returned successfully',
    type: InfinityPaginationResponse(ProductBrand),
  })
  async findAll(
    @Query() query: QueryProductBrandDto,
  ): Promise<InfinityPaginationResponseDto<ProductBrand>> {
    const result = await this.brandsService.findManyWithPagination(query);

    return infinityPaginationFromPaginate(result);
  }

  /**
   * Get brand by ID
   */
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get brand by ID' })
  @ApiOkResponse({
    description: 'ProductBrand found',
    type: ProductBrand,
  })
  findOne(@Param('id') id: string) {
    return this.brandsService.findById(id);
  }
}
