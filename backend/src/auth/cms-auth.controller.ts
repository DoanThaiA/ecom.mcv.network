import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { CmsAuthService } from './cms-auth.service';
import { AuthCmsLoginDto } from './dto/auth-cms-login.dto';
import { CmsLoginResponseDto } from './dto/cms-login-response.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { CmsUser } from '../cms-users/domain/cms-user';
import { AuthCmsUpdateDto } from './dto/auth-cms-update.dto';
import { NullableType } from '../utils/types/nullable.type';

@ApiTags('CMS Auth')
@Controller({
  path: 'auth/cms',
  version: '1',
})
export class CmsAuthController {
  constructor(public cmsAuthService: CmsAuthService) {}

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { ttl: 60000, limit: 5 }, long: { ttl: 600000, limit: 20 } })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: CmsLoginResponseDto,
  })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  public login(
    @Body() loginDto: AuthCmsLoginDto,
  ): Promise<CmsLoginResponseDto> {
    return this.cmsAuthService.validateCmsLogin(loginDto);
  }

  @ApiBearerAuth()
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: RefreshResponseDto,
  })
  public refresh(
    @Request() request,
  ): Promise<Omit<CmsLoginResponseDto, 'user'>> {
    return this.cmsAuthService.refreshToken({
      sessionId: request.user.sessionId,
      hash: request.user.hash,
    });
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Body() data: { sessionId: string }): Promise<void> {
    await this.cmsAuthService.logout({
      sessionId: data.sessionId,
    });
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get('me')
  @UseGuards(AuthGuard('jwt-cms'))
  @ApiOkResponse({
    type: CmsUser,
  })
  @HttpCode(HttpStatus.OK)
  public me(@Request() request): Promise<CmsUser | null> {
    return this.cmsAuthService.me(request.user);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @UseGuards(AuthGuard('jwt-cms'))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: CmsUser,
  })
  public update(
    @Request() request,
    @Body() cmsUserDto: AuthCmsUpdateDto,
  ): Promise<NullableType<CmsUser>> {
    return this.cmsAuthService.update(request.user, cmsUserDto);
  }
}
