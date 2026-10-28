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
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ZaloOaAuthService } from './zalo-oa-auth.service';
import { ZaloOaConnectionDto } from '../dto/zalo-oa-connection.dto';
import { ZaloOaCallbackDto } from '../dto/zalo-oa-callback.dto';
import { ModulePermissionsGuard } from '../../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../../cms-users/permissions/module-permission.enum';

@ApiTags('Zalo OA')
@ApiBearerAuth()
@RequireModulePermission(ModulePermission.settings)
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@Controller({
  path: 'integration/zalo',
  version: '1',
})
export class ZaloOaAuthController {
  constructor(private readonly zaloOaAuthService: ZaloOaAuthService) {}

  @Get('redirect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Zalo OA OAuth authorization URL (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nGenerates and returns the Zalo Official Account OAuth authorization URL for admin to authorize the application',
  })
  @ApiOkResponse({
    description: 'Returns the Zalo OA OAuth authorization URL',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example:
            'https://oauth.zaloapp.com/v4/oa/permission?app_id=123&redirect_uri=...',
        },
      },
    },
  })
  getAuthUrl(): { url: string } {
    return this.zaloOaAuthService.getAuthorizationUrl();
  }

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle Zalo OA OAuth callback (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nHandles the OAuth callback from Zalo OA and exchanges authorization code for access and refresh tokens. Returns only expiration info and OA details (access token is stored server-side only)',
  })
  @ApiBody({
    type: ZaloOaCallbackDto,
    description: 'Authorization code received from Zalo OA OAuth',
  })
  @ApiOkResponse({
    description:
      'Successfully exchanged code for tokens. Returns expiration info and OA details (access token not included for security)',
    type: ZaloOaConnectionDto,
  })
  async handleCallback(
    @Body() callbackDto: ZaloOaCallbackDto,
  ): Promise<ZaloOaConnectionDto> {
    return this.zaloOaAuthService.exchangeAccessToken(callbackDto.code);
  }

  @Get('connection')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify Zalo OA connection (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nClears cached token, retrieves from database, auto-refreshes if needed, and verifies connection by checking with Zalo OA API',
  })
  @ApiOkResponse({
    description:
      'Connection verified successfully. Returns connection status, token expiration times, and OA ID',
    type: ZaloOaConnectionDto,
  })
  async checkConnection(): Promise<ZaloOaConnectionDto> {
    return this.zaloOaAuthService.checkConnection();
  }
}
