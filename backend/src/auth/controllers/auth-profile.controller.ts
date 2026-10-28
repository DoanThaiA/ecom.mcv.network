import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from '../services/profile.service';
import { AccountService } from '../services/account.service';
import { TokenService } from '../services/token.service';
import { SocialLinkService } from '../services/social-link.service';
import { AuthUpdateDto } from '../dto/auth-update.dto';
import { RefreshResponseDto } from '../dto/refresh-response.dto';
import { UnlinkSocialAccountDto } from '../dto/social-link.dto';
import { NullableType } from '../../utils/types/nullable.type';
import { User } from '../../users/domain/user';

@ApiTags('Auth - Profile')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly accountService: AccountService,
    private readonly tokenService: TokenService,
    private readonly socialLinkService: SocialLinkService,
  ) {}

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: User,
  })
  @HttpCode(HttpStatus.OK)
  public me(@Request() request): Promise<NullableType<User>> {
    return this.profileService.me(request.user);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: RefreshResponseDto,
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  public refresh(@Request() request): Promise<RefreshResponseDto> {
    return this.tokenService.refreshToken({
      sessionId: request.user.sessionId,
      hash: request.user.hash,
    });
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Request() request): Promise<void> {
    await this.accountService.logout({
      sessionId: request.user.sessionId,
    });
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: User,
  })
  public update(
    @Request() request,
    @Body() userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    return this.profileService.update(request.user, userDto);
  }

  @ApiBearerAuth()
  @Delete('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Request() request): Promise<void> {
    return this.accountService.softDelete(request.user);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Delete('me/social')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: User,
    description: 'Unlinks a social account from the authenticated user',
  })
  public unlinkSocialAccount(
    @Request() request,
    @Body() dto: UnlinkSocialAccountDto,
  ): Promise<User> {
    return this.socialLinkService.unlinkSocialAccount(
      request.user.id,
      dto.provider,
    );
  }
}
