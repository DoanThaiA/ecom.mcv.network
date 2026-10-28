import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';
import { CommissionSettingsService } from './commission-settings.service';
import { UpdateCommissionSettingsDto } from './dto/update-commission-settings.dto';
import { CommissionSettings } from './domain/commission-settings';

@ApiBearerAuth()
@RequireModulePermission(ModulePermission.affiliate_management)
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@ApiTags('CMS - Commission Settings')
@Controller({
  path: 'commission-settings',
  version: '1',
})
export class CommissionSettingsController {
  constructor(
    private readonly commissionSettingsService: CommissionSettingsService,
  ) {}

  @ApiOkResponse({ type: CommissionSettings })
  @Get()
  @HttpCode(HttpStatus.OK)
  get(): Promise<CommissionSettings & { isRecalculating?: boolean }> {
    return this.commissionSettingsService.get();
  }

  @ApiOkResponse({ type: CommissionSettings })
  @Patch()
  @HttpCode(HttpStatus.OK)
  update(
    @Body() dto: UpdateCommissionSettingsDto,
  ): Promise<CommissionSettings & { jobId?: string }> {
    return this.commissionSettingsService.update(dto);
  }
}
