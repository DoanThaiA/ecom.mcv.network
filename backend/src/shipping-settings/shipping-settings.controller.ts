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
import { ShippingSettingsService } from './shipping-settings.service';
import { UpdateShippingSettingsDto } from './dto/update-shipping-settings.dto';
import { ShippingSettings } from './domain/shipping-settings';

@ApiBearerAuth()
@RequireModulePermission(ModulePermission.shipping_management)
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@ApiTags('CMS - Shipping Settings')
@Controller({
  path: 'shipping-settings',
  version: '1',
})
export class ShippingSettingsController {
  constructor(
    private readonly shippingSettingsService: ShippingSettingsService,
  ) {}

  /**
   * Get current shipping settings
   */
  @ApiOkResponse({ type: ShippingSettings })
  @Get()
  @HttpCode(HttpStatus.OK)
  get(): Promise<ShippingSettings> {
    return this.shippingSettingsService.get();
  }

  /**
   * Update shipping settings
   */
  @ApiOkResponse({ type: ShippingSettings })
  @Patch()
  @HttpCode(HttpStatus.OK)
  update(@Body() dto: UpdateShippingSettingsDto): Promise<ShippingSettings> {
    return this.shippingSettingsService.update(dto);
  }
}
