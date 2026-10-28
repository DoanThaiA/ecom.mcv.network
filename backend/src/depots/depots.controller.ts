import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DepotsService } from './depots.service';
import { Depot } from './domain/depot';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';

/**
 * Controller for depot management endpoints (CMS only)
 */
@ApiBearerAuth()
@RequireModulePermission(ModulePermission.settings)
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@ApiTags('Depots')
@Controller({
  path: 'depots',
  version: '1',
})
export class DepotsController {
  constructor(private readonly depotsService: DepotsService) {}

  /**
   * Get all depots for the current business
   */
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of depots (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nReturns all depots (warehouses) for the current business.',
  })
  @ApiOkResponse({
    description: 'List of depots returned successfully',
    type: [Depot],
  })
  async findAll(): Promise<Depot[]> {
    return this.depotsService.findAll();
  }

  /**
   * Get depot by ID
   */
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get depot by ID (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nReturns a depot by its ID.',
  })
  @ApiOkResponse({
    description: 'Depot found',
    type: Depot,
  })
  @ApiNotFoundResponse({
    description: 'Depot not found',
  })
  async findOne(@Param('id') id: string): Promise<Depot | null> {
    return this.depotsService.findById(id);
  }
}
