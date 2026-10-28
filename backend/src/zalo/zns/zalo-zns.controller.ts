import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ZaloZnsService } from './zalo-zns.service';
import { SendZnsDto } from './dto/send-zns.dto';
import { ZnsResponseDto } from './dto/zns-response.dto';
import { ModulePermissionsGuard } from '../../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../../cms-users/permissions/module-permission.enum';

@ApiTags('Zalo ZNS')
@ApiBearerAuth()
@RequireModulePermission(ModulePermission.settings)
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@Controller({
  path: 'zalo/zns',
  version: '1',
})
export class ZaloZnsController {
  constructor(private readonly zaloZnsService: ZaloZnsService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send ZNS message (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nSend a Zalo Notification Service (ZNS) message to a phone number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ZNS message sent successfully',
    type: ZnsResponseDto,
  })
  async sendZns(@Body() sendZnsDto: SendZnsDto): Promise<ZnsResponseDto> {
    return this.zaloZnsService.sendZns(sendZnsDto);
  }
}
