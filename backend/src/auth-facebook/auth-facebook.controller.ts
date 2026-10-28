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
import { AuthService } from '../auth/auth.service';
import { AuthFacebookService } from './auth-facebook.service';
import { SocialLinkService } from '../auth/services/social-link.service';
import { AuthFacebookLoginDto } from './dto/auth-facebook-login.dto';
import { LoginResponseDto } from '../auth/dto/login-response.dto';
import { AuthProvidersEnum } from '../auth/auth-providers.enum';
import { User } from '../users/domain/user';

@ApiTags('Auth - Social')
@Controller({
  path: 'auth/facebook',
  version: '1',
})
export class AuthFacebookController {
  constructor(
    private readonly authService: AuthService,
    private readonly authFacebookService: AuthFacebookService,
    private readonly socialLinkService: SocialLinkService,
  ) {}

  @Get('redirect')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Returns the Facebook OAuth authorization URL',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example:
            'https://www.facebook.com/v23.0/dialog/oauth?client_id=...&redirect_uri=...&response_type=code&scope=email%2Cpublic_profile',
        },
      },
    },
  })
  getAuthUrl(@Query('returnUrl') returnUrl?: string): { url: string } {
    return this.authFacebookService.getAuthorizationUrl(returnUrl);
  }

  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: AuthFacebookLoginDto,
  ): Promise<LoginResponseDto> {
    const socialData = await this.authFacebookService.getProfileByOAuthCode(
      loginDto.code,
    );

    return this.authService.validateSocialLogin('facebook', socialData);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: User,
    description: 'Links Facebook account to the authenticated user',
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('link')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async link(
    @Request() request,
    @Body() loginDto: AuthFacebookLoginDto,
  ): Promise<User> {
    const socialData = await this.authFacebookService.getProfileByOAuthCode(
      loginDto.code,
    );

    return this.socialLinkService.linkSocialAccount(
      request.user.id,
      AuthProvidersEnum.facebook,
      socialData,
    );
  }
}
