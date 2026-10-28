import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CombosService } from './combos.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { QueryComboDto } from './dto/query-combo.dto';
import { ComboResponseDto } from './dto/combo-response.dto';
import { infinityPaginationFromPaginate } from '../utils/infinity-pagination';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../utils/dto/infinity-pagination-response.dto';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';

/**
 * Controller for combo endpoints (CMS only)
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@RequireModulePermission(ModulePermission.product_management)
@ApiTags('Combos')
@Controller({ path: 'combos', version: '1' })
export class CombosController {
  constructor(private readonly combosService: CombosService) {}

  /**
   * Create a new combo
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new combo' })
  @ApiCreatedResponse({
    description: 'Combo created successfully',
    type: ComboResponseDto,
  })
  async create(@Body() dto: CreateComboDto): Promise<ComboResponseDto> {
    return this.combosService.create(dto);
  }

  /**
   * Get list of combos with filtering and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of combos',
    description: 'Returns paginated combos with filtering and sorting options',
  })
  @ApiOkResponse({
    description: 'List of combos returned successfully',
    type: InfinityPaginationResponse(ComboResponseDto),
  })
  async findAll(
    @Query() query: QueryComboDto,
  ): Promise<InfinityPaginationResponseDto<ComboResponseDto>> {
    const result = await this.combosService.findAll(query);
    return infinityPaginationFromPaginate(result);
  }

  /**
   * Get combo by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get combo by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Combo ID' })
  @ApiOkResponse({
    description: 'Combo found',
    type: ComboResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Combo not found' })
  async findOne(@Param('id') id: string): Promise<ComboResponseDto> {
    return this.combosService.findOne(id);
  }

  /**
   * Update an existing combo
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a combo' })
  @ApiParam({ name: 'id', type: String, description: 'Combo ID' })
  @ApiOkResponse({
    description: 'Combo updated successfully',
    type: ComboResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Combo not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateComboDto,
  ): Promise<ComboResponseDto> {
    return this.combosService.update(id, dto);
  }

  /**
   * Delete a combo (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a combo' })
  @ApiParam({ name: 'id', type: String, description: 'Combo ID' })
  @ApiOkResponse({ description: 'Combo deleted successfully' })
  @ApiNotFoundResponse({ description: 'Combo not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.combosService.remove(id);
  }
}
