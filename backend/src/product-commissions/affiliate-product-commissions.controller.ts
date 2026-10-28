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
@ApiTags('CMS - Affiliate Product Commissions')
@Controller({
  path: 'affiliates/:affiliateId/product-commissions',
  version: '1',
})
export class AffiliateProductCommissionsController {
  constructor(
    private readonly productCommissionsService: ProductCommissionsService,
  ) {}

  @Get('product-ids')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'affiliateId', type: String })
  async getProductIds(
    @Param('affiliateId') affiliateId: string,
  ): Promise<{ productIds: string[] }> {
    const productIds =
      await this.productCommissionsService.getProductIdsByAffiliate(
        affiliateId,
      );
    return { productIds };
  }

  @ApiOkResponse({ type: InfinityPaginationResponse(ProductCommission) })
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'affiliateId', type: String })
  async findAll(
    @Param('affiliateId') affiliateId: string,
    @Query() query: QueryProductCommissionDto,
  ): Promise<InfinityPaginationResponseDto<ProductCommission>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 20;
    if (limit > 100) {
      limit = 100;
    }

    const result = await this.productCommissionsService.findManyWithPagination({
      affiliateId,
      filterOptions: query?.filters,
      sortOptions: query?.sort,
      paginationOptions: { page, limit },
    });

    return infinityPaginationFromPaginate(result);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({ name: 'affiliateId', type: String })
  bulkAdd(
    @Param('affiliateId') affiliateId: string,
    @Body() dto: AddProductCommissionsDto,
  ) {
    return this.productCommissionsService.bulkAdd(affiliateId, dto);
  }

  @ApiOkResponse({ type: ProductCommission })
  @Patch(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'affiliateId', type: String })
  @ApiParam({ name: 'productId', type: String })
  updateRate(
    @Param('affiliateId') affiliateId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductCommissionDto,
  ) {
    return this.productCommissionsService.updateRate(
      affiliateId,
      productId,
      dto,
    );
  }

  @Post('bulk-update-rate')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'affiliateId', type: String })
  bulkUpdateRate(
    @Param('affiliateId') affiliateId: string,
    @Body() dto: BulkUpdateCommissionRateDto,
  ) {
    return this.productCommissionsService.bulkUpdateRate(affiliateId, dto);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'affiliateId', type: String })
  @ApiParam({ name: 'productId', type: String })
  remove(
    @Param('affiliateId') affiliateId: string,
    @Param('productId') productId: string,
  ) {
    return this.productCommissionsService.removeOne(affiliateId, productId);
  }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'affiliateId', type: String })
  bulkRemove(
    @Param('affiliateId') affiliateId: string,
    @Body() dto: BulkDeleteProductCommissionsDto,
  ) {
    return this.productCommissionsService.bulkRemove(affiliateId, dto);
  }
}
