import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiAcceptedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { I18nService } from 'nestjs-i18n';
import { NhanhAuthService } from './services/nhanh-auth.service';
import { NhanhConnectionDto } from './dto/nhanh-connection.dto';
import { NhanhProductListFiltersDto } from './dto/nhanh-product.dto';
import { NhanhProductCategoryFiltersDto } from './dto/nhanh-product-category.dto';
import { NhanhProductInventoryFiltersDto } from './dto/nhanh-product-inventory.dto';
import { NhanhProductBrandFiltersDto } from './dto/nhanh-product-brand.dto';
import { NhanhCallbackDto } from './dto/nhanh-callback.dto';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';
import { AuditLog } from '../audit-log/decorators/audit-log.decorator';
import { JobsService } from '../jobs/jobs.service';
import { JobType } from '../jobs/domain/job-type.enum';
import { StartJobResponseDto } from '../jobs/dto/job-response.dto';

@ApiTags('Nhanh.vn')
@ApiBearerAuth()
@RequireModulePermission(ModulePermission.settings)
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@Controller({
  path: 'integration/nhanh',
  version: '1',
})
export class NhanhController {
  constructor(
    private readonly nhanhAuthService: NhanhAuthService,
    private readonly jobsService: JobsService,
    private readonly i18n: I18nService,
  ) {}

  @Get('redirect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Nhanh.vn OAuth authorization URL (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nGenerates and returns the Nhanh.vn OAuth authorization URL',
  })
  @ApiQuery({
    name: 'returnLink',
    required: false,
    description:
      'HTTPS URL where users return after authorization. Defaults to /api/v1/nhanh/callback',
  })
  @ApiOkResponse({
    description: 'Returns the Nhanh.vn OAuth authorization URL',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example:
            'https://nhanh.vn/oauth?version=2.0&appId=76504&returnLink=...',
        },
      },
    },
  })
  getAuthUrl(): { url: string } {
    return this.nhanhAuthService.getAuthorizationUrl();
  }

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  @AuditLog({
    action: 'NHANH_OAUTH_CALLBACK',
    category: 'nhanh-integration',
    description: 'Handle Nhanh.vn OAuth callback',
    captureInput: false, // Don't capture sensitive OAuth data
  })
  @ApiOperation({
    summary: 'Handle Nhanh.vn OAuth callback (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nHandles Nhanh.vn OAuth callback and exchanges code for token',
  })
  @ApiBody({
    type: NhanhCallbackDto,
    description: 'Access code received from Nhanh.vn OAuth',
  })
  @ApiOkResponse({
    description:
      'Returns business info and expiration (access token is stored server-side only)',
    type: NhanhConnectionDto,
  })
  async handleCallback(
    @Body() callbackDto: NhanhCallbackDto,
  ): Promise<NhanhConnectionDto> {
    return this.nhanhAuthService.exchangeAccessToken(callbackDto.accessCode);
  }

  @Get('connection')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify Nhanh.vn connection (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nClears cached token, retrieves from database, and verifies connection by checking access token with Nhanh API',
  })
  @ApiOkResponse({
    description:
      'Connection verified successfully. Returns token information excluding the accessToken itself.',
    type: NhanhConnectionDto,
  })
  async checkConnection(): Promise<NhanhConnectionDto> {
    return this.nhanhAuthService.checkConnection();
  }

  /**
   * Full product sync from Nhanh.vn (async job chain)
   * Step 1: Product List -> Step 2: Product Details -> Step 3+4: Embed Variants
   */
  @Post('sync/products')
  @HttpCode(HttpStatus.ACCEPTED)
  @AuditLog({
    action: 'NHANH_SYNC_PRODUCTS',
    category: 'nhanh-integration',
    description: 'Full product sync from Nhanh.vn (chained jobs)',
  })
  @ApiOperation({
    summary: 'Full product sync from Nhanh.vn (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nStarts a chained async job workflow:\n' +
      '1. **Product List Sync**: Fetches products from Nhanh API in paginated batches\n' +
      '2. **Product Detail Sync**: Syncs full product details (description, content)\n' +
      '3. **Product Embed**: Embeds variants into parent products + populates parent metadata\n\n' +
      'Each step automatically chains to the next upon completion.',
  })
  @ApiBody({
    required: false,
    type: NhanhProductListFiltersDto,
    description:
      'Optional filters for product sync (e.g., categoryId, updatedAtFrom)',
  })
  @ApiAcceptedResponse({
    description: 'Product sync job chain started successfully',
    type: StartJobResponseDto,
  })
  @ApiConflictResponse({
    description: 'A product sync job is already running',
  })
  async syncProducts(
    @Body() filters?: NhanhProductListFiltersDto,
  ): Promise<StartJobResponseDto> {
    // Start Step 1, which will chain to Step 2 and then Step 3+4
    return this.jobsService.startJob(JobType.NHANH_PRODUCT_LIST_SYNC, filters);
  }

  /**
   * Sync product details only (async job) - Step 2+3+4
   * Use this if product list is already synced
   */
  @Post('sync/product-details')
  @HttpCode(HttpStatus.ACCEPTED)
  @AuditLog({
    action: 'NHANH_SYNC_PRODUCT_DETAILS',
    category: 'nhanh-integration',
    description: 'Sync product details from Nhanh.vn',
  })
  @ApiOperation({
    summary: 'Sync product details from Nhanh.vn (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nStarts from Step 2 (skipping product list sync):\n' +
      '1. **Product Detail Sync**: Syncs full product details (description, content)\n' +
      '2. **Product Embed**: Embeds variants into parent products + populates parent metadata\n\n' +
      'Use this if product list is already synced and you only need to update details.',
  })
  @ApiBody({
    required: false,
    type: NhanhProductListFiltersDto,
    description:
      'Optional filters for product detail sync (e.g., categoryId, updatedAtFrom)',
  })
  @ApiAcceptedResponse({
    description: 'Product detail sync job started successfully',
    type: StartJobResponseDto,
  })
  @ApiConflictResponse({
    description: 'A product detail sync job is already running',
  })
  async syncProductDetails(
    @Body() filters?: NhanhProductListFiltersDto,
  ): Promise<StartJobResponseDto> {
    // Start Step 2, which will chain to Step 3+4
    return this.jobsService.startJob(
      JobType.NHANH_PRODUCT_DETAIL_SYNC,
      filters,
    );
  }

  /**
   * Embed variants only (async job) - Step 3+4
   * Use this if products are already synced and you only need to re-embed
   */
  @Post('sync/product-embed')
  @HttpCode(HttpStatus.ACCEPTED)
  @AuditLog({
    action: 'NHANH_SYNC_PRODUCT_EMBED',
    category: 'nhanh-integration',
    description: 'Embed variants into parent products',
  })
  @ApiOperation({
    summary: 'Embed variants into parent products (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nRuns Step 3+4 only (DB operations, no API calls):\n' +
      '1. Embeds variants into parent products\n' +
      '2. Populates parent metadata for variants\n\n' +
      'Use this if products are already synced and you only need to re-embed variants.',
  })
  @ApiAcceptedResponse({
    description: 'Product embed job started successfully',
    type: StartJobResponseDto,
  })
  @ApiConflictResponse({
    description: 'A product embed job is already running',
  })
  async syncProductEmbed(): Promise<StartJobResponseDto> {
    return this.jobsService.startJob(JobType.NHANH_PRODUCT_EMBED_SYNC);
  }

  /**
   * Sync product categories from Nhanh.vn (async job)
   */
  @Post('sync/product-categories')
  @HttpCode(HttpStatus.ACCEPTED)
  @AuditLog({
    action: 'NHANH_SYNC_CATEGORIES',
    category: 'nhanh-integration',
    description: 'Sync product categories from Nhanh.vn',
  })
  @ApiOperation({
    summary: 'Sync product categories from Nhanh.vn to database (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nStarts an async job to sync product categories from Nhanh.vn to database. Returns job ID for tracking progress.',
  })
  @ApiBody({
    required: false,
    type: NhanhProductCategoryFiltersDto,
    description: 'Optional filters for category sync (e.g., status)',
  })
  @ApiAcceptedResponse({
    description: 'Category sync job started successfully',
    type: StartJobResponseDto,
  })
  @ApiConflictResponse({
    description: 'A category sync job is already running',
  })
  async syncProductCategories(
    @Body() filters?: NhanhProductCategoryFiltersDto,
  ): Promise<StartJobResponseDto> {
    return this.jobsService.startJob(JobType.NHANH_CATEGORY_SYNC, filters);
  }

  /**
   * Sync product inventories from Nhanh.vn (async job)
   */
  @Post('sync/product-inventories')
  @HttpCode(HttpStatus.ACCEPTED)
  @AuditLog({
    action: 'NHANH_SYNC_INVENTORIES',
    category: 'nhanh-integration',
    description: 'Sync product inventories from Nhanh.vn',
  })
  @ApiOperation({
    summary: 'Sync product inventories from Nhanh.vn to database (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nStarts an async job to sync product inventories from Nhanh.vn to database. Returns job ID for tracking progress.',
  })
  @ApiBody({
    required: false,
    type: NhanhProductInventoryFiltersDto,
    description:
      'Optional filters for inventory sync (e.g., depotIds, updatedAtFrom)',
  })
  @ApiAcceptedResponse({
    description: 'Inventory sync job started successfully',
    type: StartJobResponseDto,
  })
  @ApiConflictResponse({
    description: 'An inventory sync job is already running',
  })
  async syncProductInventories(
    @Body() filters?: NhanhProductInventoryFiltersDto,
  ): Promise<StartJobResponseDto> {
    return this.jobsService.startJob(JobType.NHANH_INVENTORY_SYNC, filters);
  }

  /**
   * Sync product brands from Nhanh.vn (async job)
   */
  @Post('sync/product-brands')
  @HttpCode(HttpStatus.ACCEPTED)
  @AuditLog({
    action: 'NHANH_SYNC_BRANDS',
    category: 'nhanh-integration',
    description: 'Sync product brands from Nhanh.vn',
  })
  @ApiOperation({
    summary: 'Sync product brands from Nhanh.vn to database (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nStarts an async job to sync product brands from Nhanh.vn to database. Returns job ID for tracking progress.',
  })
  @ApiBody({
    required: false,
    type: NhanhProductBrandFiltersDto,
    description: 'Optional filters for brand sync (e.g., status, name)',
  })
  @ApiAcceptedResponse({
    description: 'Brand sync job started successfully',
    type: StartJobResponseDto,
  })
  @ApiConflictResponse({
    description: 'A brand sync job is already running',
  })
  async syncProductBrands(
    @Body() filters?: NhanhProductBrandFiltersDto,
  ): Promise<StartJobResponseDto> {
    return this.jobsService.startJob(JobType.NHANH_BRAND_SYNC, filters);
  }

  /**
   * Sync depots from Nhanh.vn (async job)
   */
  @Post('sync/depots')
  @HttpCode(HttpStatus.ACCEPTED)
  @AuditLog({
    action: 'NHANH_SYNC_DEPOTS',
    category: 'nhanh-integration',
    description: 'Sync depots from Nhanh.vn',
  })
  @ApiOperation({
    summary: 'Sync depots from Nhanh.vn to database (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nStarts an async job to sync depots (warehouses) from Nhanh.vn to database. Returns job ID for tracking progress.',
  })
  @ApiAcceptedResponse({
    description: 'Depot sync job started successfully',
    type: StartJobResponseDto,
  })
  @ApiConflictResponse({
    description: 'A depot sync job is already running',
  })
  async syncDepots(): Promise<StartJobResponseDto> {
    return this.jobsService.startJob(JobType.NHANH_DEPOT_SYNC);
  }

  /**
   * Sync all data from Nhanh.vn (starts multiple async jobs)
   */
  @Post('sync/all')
  @HttpCode(HttpStatus.ACCEPTED)
  @AuditLog({
    action: 'NHANH_SYNC_ALL',
    category: 'nhanh-integration',
    description: 'Full sync all data from Nhanh.vn',
  })
  @ApiOperation({
    summary: 'Sync all data from Nhanh.vn (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nStarts async jobs to sync all data: depots, product-categories, product-brands, products, and product-inventories. Returns job IDs for tracking progress.',
  })
  @ApiAcceptedResponse({
    description: 'Full sync jobs started successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Full sync jobs started' },
        jobs: {
          type: 'object',
          properties: {
            depots: { type: 'string', example: '6750abc123def455' },
            categories: { type: 'string', example: '6750abc123def456' },
            brands: { type: 'string', example: '6750abc123def457' },
            products: { type: 'string', example: '6750abc123def458' },
            inventories: { type: 'string', example: '6750abc123def459' },
          },
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'One or more sync jobs are already running',
  })
  async syncAll(): Promise<{
    message: string;
    jobs: {
      depots: string;
      categories: string;
      brands: string;
      products: string; // Starts the chained product sync (list -> details -> embed)
      inventories: string;
    };
  }> {
    const depotsJob = await this.jobsService.startJob(JobType.NHANH_DEPOT_SYNC);
    const categoriesJob = await this.jobsService.startJob(
      JobType.NHANH_CATEGORY_SYNC,
    );
    const brandsJob = await this.jobsService.startJob(JobType.NHANH_BRAND_SYNC);
    // Start product list sync, which chains to detail sync, then embed sync
    const productsJob = await this.jobsService.startJob(
      JobType.NHANH_PRODUCT_LIST_SYNC,
    );
    const inventoriesJob = await this.jobsService.startJob(
      JobType.NHANH_INVENTORY_SYNC,
    );

    return {
      message: this.i18n.t('nhanh.fullSyncStarted'),
      jobs: {
        depots: depotsJob.jobId,
        categories: categoriesJob.jobId,
        brands: brandsJob.jobId,
        products: productsJob.jobId, // Chains: list -> details -> embed
        inventories: inventoriesJob.jobId,
      },
    };
  }
}
