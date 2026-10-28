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
  SerializeOptions,
} from '@nestjs/common';
import { CreateCmsUserDto } from './dto/create-cms-user.dto';
import { UpdateCmsUserDto } from './dto/update-cms-user.dto';
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
import { QueryCmsUserDto } from './dto/query-cms-user.dto';
import { CmsUser } from './domain/cms-user';
import { CmsUsersService } from './cms-users.service';
import { infinityPaginationFromPaginate } from '../utils/infinity-pagination';
import { CmsUserDto } from './dto/cms-user.dto';
import { RequireModulePermission } from './permissions/module-permissions.decorator';
import { ModulePermission } from './permissions/module-permission.enum';
import { ModulePermissionsGuard } from './permissions/module-permissions.guard';
import { AuditLog } from '../audit-log/decorators/audit-log.decorator';

@ApiBearerAuth()
@RequireModulePermission(ModulePermission.account_management)
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@ApiTags('CMS Users')
@Controller({
  path: 'cms-users',
  version: '1',
})
export class CmsUsersController {
  constructor(private readonly cmsUsersService: CmsUsersService) {}

  @ApiCreatedResponse({
    type: CmsUser,
  })
  @SerializeOptions({
    groups: ['cms-admin'],
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @AuditLog({
    action: 'CREATE_CMS_USER',
    category: 'cms-users',
    description: 'Create CMS user',
    sensitiveFields: ['password'],
  })
  create(@Body() createCmsUserDto: CreateCmsUserDto): Promise<CmsUser> {
    return this.cmsUsersService.create(createCmsUserDto);
  }

  @ApiOkResponse({
    type: InfinityPaginationResponse(CmsUser),
  })
  @SerializeOptions({
    groups: ['cms-admin'],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryCmsUserDto,
  ): Promise<InfinityPaginationResponseDto<CmsUser>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const result = await this.cmsUsersService.findManyWithPagination({
      filterOptions: query?.filters,
      sortOptions: query?.sort,
      paginationOptions: {
        page,
        limit,
      },
    });

    return infinityPaginationFromPaginate(result);
  }

  @ApiOkResponse({
    type: CmsUser,
  })
  @SerializeOptions({
    groups: ['cms-admin'],
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  findOne(@Param() param: CmsUserDto): Promise<NullableType<CmsUser>> {
    return this.cmsUsersService.findById(param.id);
  }

  @ApiOkResponse({
    type: CmsUser,
  })
  @SerializeOptions({
    groups: ['cms-admin'],
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @AuditLog({
    action: 'UPDATE_CMS_USER',
    category: 'cms-users',
    description: 'Update CMS user',
    sensitiveFields: ['password'],
  })
  update(
    @Param('id') id: CmsUser['id'],
    @Body() updateCmsUserDto: UpdateCmsUserDto,
  ): Promise<CmsUser | null> {
    return this.cmsUsersService.update(id, updateCmsUserDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuditLog({
    action: 'DELETE_CMS_USER',
    category: 'cms-users',
    description: 'Delete CMS user',
  })
  remove(@Param('id') id: CmsUser['id']): Promise<void> {
    return this.cmsUsersService.remove(id);
  }
}
