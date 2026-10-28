import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import { I18nService } from 'nestjs-i18n';
import { AuthEmailLoginDto } from '../dto/auth-email-login.dto';
import { AuthRegisterLoginDto } from '../dto/auth-register-login.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { AllConfigType } from '../../config/config.type';
import { UsersService } from '../../users/users.service';
import { MailService } from '../../mail/mail.service';
import { SessionService } from '../../session/session.service';
import { TokenService } from './token.service';
import { StatusEnum } from '../../statuses/statuses.enum';
import { AuthProvidersEnum } from '../auth-providers.enum';
import { User } from '../../users/domain/user';
import { throwException } from '../../utils/errors/throw-exception';

@Injectable()
export class EmailAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Validates email/password login credentials
   */
  async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.emailNotFound'),
      });
    }

    if (user.provider !== AuthProvidersEnum.email) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.needLoginViaProvider', {
          args: { provider: user.provider },
        }),
      });
    }

    if (!user.password) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.incorrectPassword'),
      });
    }

    if (user.status !== StatusEnum.active) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.accountInactive'),
      });
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.incorrectPassword'),
      });
    }

    const session = await this.sessionService.createForUser(user);
    const { token, refreshToken, tokenExpires } =
      await this.tokenService.getTokensData({
        id: user.id,
        sessionId: session.id,
        hash: session.hash,
      });

    return {
      refreshToken,
      token,
      tokenExpires,
      user,
    };
  }

  /**
   * Registers new user with email confirmation
   */
  async register(dto: AuthRegisterLoginDto): Promise<void> {
    const user = await this.usersService.create({
      ...dto,
      email: dto.email,
      status: StatusEnum.inactive,
    });

    const hash = await this.jwtService.signAsync(
      {
        confirmEmailUserId: user.id,
      },
      {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
          infer: true,
        }),
      },
    );

    await this.mailService.userSignUp({
      to: dto.email,
      data: {
        hash,
      },
    });
  }

  /**
   * Confirms email during registration
   */
  async confirmEmail(hash: string): Promise<void> {
    let userId: User['id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: User['id'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
      });

      userId = jwtData.confirmEmailUserId;
    } catch {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.invalidHash'),
      });
    }

    const user = await this.usersService.findById(userId);

    if (!user || user?.status !== StatusEnum.inactive) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('auth.userNotFound'),
      });
    }

    user.status = StatusEnum.active;

    await this.usersService.update(user.id, user);
  }

  /**
   * Confirms new email when user updates email
   */
  async confirmNewEmail(hash: string): Promise<void> {
    let userId: User['id'];
    let newEmail: User['email'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: User['id'];
        newEmail: User['email'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
      });

      userId = jwtData.confirmEmailUserId;
      newEmail = jwtData.newEmail;
    } catch {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.invalidHash'),
      });
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('auth.userNotFound'),
      });
    }

    user.email = newEmail;
    user.status = StatusEnum.active;

    await this.usersService.update(user.id, user);
  }

  /**
   * Initiates forgot password flow via email
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.emailNotExists'),
      });
    }

    const tokenExpiresIn = this.configService.getOrThrow('auth.forgotExpires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const hash = await this.jwtService.signAsync(
      {
        forgotUserId: user.id,
      },
      {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
        expiresIn: tokenExpiresIn,
      },
    );

    await this.mailService.forgotPassword({
      to: email,
      data: {
        hash,
        tokenExpires,
      },
    });
  }

  /**
   * Resets password using email token
   */
  async resetPassword(hash: string, password: string): Promise<void> {
    let userId: User['id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        forgotUserId: User['id'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
      });

      userId = jwtData.forgotUserId;
    } catch {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.invalidHash'),
      });
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.hashNotFound'),
      });
    }

    user.password = password;

    await this.sessionService.deleteByUserId({
      userId: user.id,
    });

    await this.usersService.update(user.id, user);
  }
}

// Need to import ms
import ms from 'ms';
