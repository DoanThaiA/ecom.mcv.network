import { HttpStatus, Injectable } from '@nestjs/common';
import ms from 'ms';
import crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { I18nService } from 'nestjs-i18n';
import { AuthCmsLoginDto } from './dto/auth-cms-login.dto';
import { CmsLoginResponseDto } from './dto/cms-login-response.dto';
import { ConfigService } from '@nestjs/config';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';
import { JwtCmsPayloadType } from './strategies/types/jwt-cms-payload.type';
import { CmsUsersService } from '../cms-users/cms-users.service';
import { AllConfigType } from '../config/config.type';
import { Session } from '../session/domain/session';
import { SessionService } from '../session/session.service';
import { StatusEnum } from '../statuses/statuses.enum';
import { CmsUser } from '../cms-users/domain/cms-user';
import { throwException } from '../utils/errors/throw-exception';
import { AuthCmsUpdateDto } from './dto/auth-cms-update.dto';
import { NullableType } from '../utils/types/nullable.type';

@Injectable()
export class CmsAuthService {
  constructor(
    private jwtService: JwtService,
    private cmsUsersService: CmsUsersService,
    private sessionService: SessionService,
    private configService: ConfigService<AllConfigType>,
    private i18n: I18nService,
  ) {}

  async validateCmsLogin(
    loginDto: AuthCmsLoginDto,
  ): Promise<CmsLoginResponseDto> {
    const cmsUser = await this.cmsUsersService.findByEmail(loginDto.email);

    if (!cmsUser) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.emailNotFound'),
      });
    }

    if (!cmsUser.password) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.incorrectPassword'),
      });
    }

    if (cmsUser.status !== StatusEnum.active) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.accountInactive'),
      });
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      cmsUser.password,
    );

    if (!isValidPassword) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.incorrectPassword'),
      });
    }

    const session = await this.sessionService.createForCmsUser(cmsUser);
    const { token, refreshToken, tokenExpires } = await this.getCmsTokensData({
      id: cmsUser.id,
      permissions: cmsUser.permissions,
      accountType: cmsUser.accountType,
      affiliateId: cmsUser.affiliateId,
      sessionId: session.id,
      hash: session.hash,
    });

    return {
      refreshToken,
      token,
      tokenExpires,
      user: cmsUser,
    };
  }

  async getCmsTokensData(data: {
    id: CmsUser['id'];
    permissions: CmsUser['permissions'];
    accountType: CmsUser['accountType'];
    affiliateId: CmsUser['affiliateId'];
    sessionId: Session['id'];
    hash: Session['hash'];
  }): Promise<{
    token: string;
    refreshToken: string;
    tokenExpires: number;
  }> {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          permissions: data.permissions ?? [],
          accountType: data.accountType ?? null,
          affiliateId: data.affiliateId ?? null,
          sessionId: data.sessionId,
        } as JwtCmsPayloadType,
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        } as JwtRefreshPayloadType,
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sessionId' | 'hash'>,
  ): Promise<Omit<CmsLoginResponseDto, 'user'>> {
    const session = await this.sessionService.findById(data.sessionId);

    if (!session) {
      throwException({
        status: HttpStatus.UNAUTHORIZED,
        message: this.i18n.t('auth.sessionNotFound'),
      });
    }

    if (session.hash !== data.hash) {
      throwException({
        status: HttpStatus.UNAUTHORIZED,
        message: this.i18n.t('auth.invalidSession'),
      });
    }

    const hash = crypto
      .createHash('sha256')
      .update(Math.random().toString())
      .digest('hex');

    await this.sessionService.update(session.id, {
      hash,
    });

    const cmsUser = await this.cmsUsersService.findById(session.user.id);

    if (!cmsUser) {
      throwException({
        status: HttpStatus.UNAUTHORIZED,
        message: this.i18n.t('auth.userNotFound'),
      });
    }

    const { token, refreshToken, tokenExpires } = await this.getCmsTokensData({
      id: cmsUser.id,
      permissions: cmsUser.permissions,
      accountType: cmsUser.accountType,
      affiliateId: cmsUser.affiliateId,
      sessionId: session.id,
      hash,
    });

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>): Promise<void> {
    await this.sessionService.delete({
      id: data.sessionId,
    });
  }

  async me(cmsUserJwtPayload: JwtCmsPayloadType): Promise<CmsUser | null> {
    return this.cmsUsersService.findById(cmsUserJwtPayload.id);
  }

  async update(
    cmsUserJwtPayload: JwtCmsPayloadType,
    cmsUserDto: AuthCmsUpdateDto,
  ): Promise<NullableType<CmsUser>> {
    const currentUser = await this.cmsUsersService.findById(
      cmsUserJwtPayload.id,
    );

    if (!currentUser) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.userNotFound'),
      });
    }

    if (cmsUserDto.password) {
      if (!cmsUserDto.oldPassword) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('auth.missingOldPassword'),
        });
      }

      if (!currentUser.password) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('auth.incorrectOldPassword'),
        });
      }

      const isValidOldPassword = await bcrypt.compare(
        cmsUserDto.oldPassword,
        currentUser.password,
      );

      if (!isValidOldPassword) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('auth.incorrectOldPassword'),
        });
      } else {
        await this.sessionService.deleteByUserIdWithExclude({
          userId: currentUser.id,
          excludeSessionId: cmsUserJwtPayload.sessionId,
        });
      }
    }

    if (cmsUserDto.email && cmsUserDto.email !== currentUser.email) {
      const userByEmail = await this.cmsUsersService.findByEmail(
        cmsUserDto.email,
      );

      if (userByEmail && userByEmail.id !== currentUser.id) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('auth.emailExists'),
        });
      }
    }

    await this.cmsUsersService.update(cmsUserJwtPayload.id, cmsUserDto);

    return this.cmsUsersService.findById(cmsUserJwtPayload.id);
  }
}
