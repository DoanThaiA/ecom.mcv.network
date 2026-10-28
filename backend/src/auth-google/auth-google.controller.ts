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
import { AuthGoogleService } from './auth-google.service';
import { SocialLinkService } from '../auth/services/social-link.service';
import { AuthGoogleLoginDto } from './dto/auth-google-login.dto';
import { LoginResponseDto } from '../auth/dto/login-response.dto';
import { AuthProvidersEnum } from '../auth/auth-providers.enum';
import { User } from '../users/domain/user';

@ApiTags('Auth - Social')
@Controller({
  path: 'auth/google',
  version: '1',
})
export class AuthGoogleController {
  constructor(
    private readonly authService: AuthService,
    private readonly authGoogleService: AuthGoogleService,
    private readonly socialLinkService: SocialLinkService,
  ) {}

  @Get('redirect')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Returns the Google OAuth authorization URL',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example:
            'https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&response_type=code&scope=openid%20email%20profile',
        },
      },
    },
  })
  getAuthUrl(@Query('returnUrl') returnUrl?: string): { url: string } {
    return this.authGoogleService.getAuthorizationUrl(returnUrl);
  }

  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: AuthGoogleLoginDto): Promise<LoginResponseDto> {
    const socialData = await this.authGoogleService.getProfileByOAuthCode(
      loginDto.code,
    );

    return this.authService.validateSocialLogin('google', socialData);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: User,
    description: 'Links Google account to the authenticated user',
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('link')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async link(
    @Request() request,
    @Body() loginDto: AuthGoogleLoginDto,
  ): Promise<User> {
    const socialData = await this.authGoogleService.getProfileByOAuthCode(
      loginDto.code,
    );

    return this.socialLinkService.linkSocialAccount(
      request.user.id,
      AuthProvidersEnum.google,
      socialData,
    );
  }
}
