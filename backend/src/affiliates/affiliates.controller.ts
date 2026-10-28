import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { NullableType } from '../utils/types/nullable.type';
import { infinityPaginationFromPaginate } from '../utils/infinity-pagination';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { Affiliate } from './domain/affiliate';
import { AffiliatesService } from './affiliates.service';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';
import { QueryAffiliateDto } from './dto/query-affiliate.dto';

@ApiBearerAuth()
@RequireModulePermission(ModulePermission.affiliate_management)
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@ApiTags('CMS - Affiliates')
@Controller({
  path: 'affiliates',
  version: '1',
})
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @ApiCreatedResponse({ type: Affiliate })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateAffiliateDto): Promise<Affiliate> {
    return this.affiliatesService.create(dto);
  }

  @ApiOkResponse({ type: InfinityPaginationResponse(Affiliate) })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryAffiliateDto,
  ): Promise<InfinityPaginationResponseDto<Affiliate>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const result = await this.affiliatesService.findManyWithPagination({
      filterOptions: query?.filters,
      sortOptions: query?.sort,
      paginationOptions: { page, limit },
    });

    return infinityPaginationFromPaginate(result);
  }

  @ApiOkResponse({ type: Affiliate })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String, required: true })
  findOne(@Param('id') id: string): Promise<NullableType<Affiliate>> {
    return this.affiliatesService.findById(id);
  }

  @ApiOkResponse({ type: Affiliate })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String, required: true })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAffiliateDto,
  ): Promise<Affiliate | null> {
    return this.affiliatesService.update(id, dto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String, required: true })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.affiliatesService.remove(id);
  }
}
