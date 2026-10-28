import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPaginationFromPaginate } from '../utils/infinity-pagination';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';
import { ProductCommission } from './domain/product-commission';
import { ProductCommissionsService } from './product-commissions.service';
import { AddProductCommissionsDto } from './dto/add-product-commissions.dto';
import { UpdateProductCommissionDto } from './dto/update-product-commission.dto';
import { BulkUpdateCommissionRateDto } from './dto/bulk-update-commission-rate.dto';
import { BulkDeleteProductCommissionsDto } from './dto/bulk-delete-product-commissions.dto';
import { QueryProductCommissionDto } from './dto/query-product-commission.dto';

@ApiBearerAuth()
@RequireModulePermission(ModulePermission.affiliate_management)
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@ApiTags('CMS - Global Product Commissions')
@Controller({
  path: 'commission-settings/products',
  version: '1',
})
export class GlobalProductCommissionsController {
  constructor(
    private readonly productCommissionsService: ProductCommissionsService,
  ) {}

  @ApiOkResponse({ type: InfinityPaginationResponse(ProductCommission) })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryProductCommissionDto,
  ): Promise<InfinityPaginationResponseDto<ProductCommission>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 20;
    if (limit > 100) {
      limit = 100;
    }

    const result = await this.productCommissionsService.findManyWithPagination({
      affiliateId: null,
      filterOptions: query?.filters,
      sortOptions: query?.sort,
      paginationOptions: { page, limit },
    });

    return infinityPaginationFromPaginate(result);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  bulkAdd(@Body() dto: AddProductCommissionsDto) {
    return this.productCommissionsService.bulkAdd(null, dto);
  }

  @ApiOkResponse({ type: ProductCommission })
  @Patch(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'productId', type: String })
  updateRate(
    @Param('productId') productId: string,
    @Body() dto: UpdateProductCommissionDto,
  ) {
    return this.productCommissionsService.updateRate(null, productId, dto);
  }

  @Post('bulk-update-rate')
  @HttpCode(HttpStatus.OK)
  bulkUpdateRate(@Body() dto: BulkUpdateCommissionRateDto) {
    return this.productCommissionsService.bulkUpdateRate(null, dto);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'productId', type: String })
  remove(@Param('productId') productId: string) {
    return this.productCommissionsService.removeOne(null, productId);
  }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  bulkRemove(@Body() dto: BulkDeleteProductCommissionsDto) {
    return this.productCommissionsService.bulkRemove(null, dto);
  }
}
