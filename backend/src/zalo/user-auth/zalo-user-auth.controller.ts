import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../../auth/auth.service';
import { ZaloUserAuthService } from './zalo-user-auth.service';
import { SocialLinkService } from '../../auth/services/social-link.service';
import { ZaloUserLoginDto } from '../dto/zalo-user-login.dto';
import { LoginResponseDto } from '../../auth/dto/login-response.dto';
import { AuthProvidersEnum } from '../../auth/auth-providers.enum';
import { User } from '../../users/domain/user';

@ApiTags('Auth - Social')
@Controller({
  path: 'auth/zalo',
  version: '1',
})
export class ZaloUserAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authZaloService: ZaloUserAuthService,
    private readonly socialLinkService: SocialLinkService,
  ) {}

  @Get('redirect')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Returns the Zalo OAuth authorization URL',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example:
            'https://oauth.zaloapp.com/v4/permission?app_id=123&redirect_uri=...&code_challenge=...&state=...',
        },
      },
    },
  })
  async getAuthUrl(
    @Query('returnUrl') returnUrl?: string,
  ): Promise<{ url: string }> {
    return this.authZaloService.getAuthorizationUrl(returnUrl);
  }

  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: ZaloUserLoginDto): Promise<LoginResponseDto> {
    const socialData =
      await this.authZaloService.getProfileByOAuthCode(loginDto);

    return this.authService.validateSocialLogin('zalo', socialData);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: User,
    description: 'Links Zalo account to the authenticated user',
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('link')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async link(
    @Request() request,
    @Body() loginDto: ZaloUserLoginDto,
  ): Promise<User> {
    const socialData =
      await this.authZaloService.getProfileByOAuthCode(loginDto);

    return this.socialLinkService.linkSocialAccount(
      request.user.id,
      AuthProvidersEnum.zalo,
      socialData,
    );
  }
}
