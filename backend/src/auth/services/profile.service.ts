import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import { I18nService } from 'nestjs-i18n';
import { UsersService } from '../../users/users.service';
import { MailService } from '../../mail/mail.service';
import { SessionService } from '../../session/session.service';
import { AuthUpdateDto } from '../dto/auth-update.dto';
import { JwtPayloadType } from '../strategies/types/jwt-payload.type';
import { AllConfigType } from '../../config/config.type';
import { NullableType } from '../../utils/types/nullable.type';
import { User } from '../../users/domain/user';
import { throwException } from '../../utils/errors/throw-exception';

@Injectable()
export class ProfileService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Gets current user profile
   */
  async me(userJwtPayload: JwtPayloadType): Promise<NullableType<User>> {
    return this.usersService.findById(userJwtPayload.id);
  }

  /**
   * Updates user profile with email change support
   */
  async update(
    userJwtPayload: JwtPayloadType,
    userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    const currentUser = await this.usersService.findById(userJwtPayload.id);

    if (!currentUser) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.userNotFound'),
      });
    }

    if (userDto.password) {
      if (!userDto.oldPassword) {
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
        userDto.oldPassword,
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
          excludeSessionId: userJwtPayload.sessionId,
        });
      }
    }

    if (userDto.email && userDto.email !== currentUser.email) {
      const userByEmail = await this.usersService.findByEmail(userDto.email);

      if (userByEmail && userByEmail.id !== currentUser.id) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('auth.emailExists'),
        });
      }

      const hash = await this.jwtService.signAsync(
        {
          confirmEmailUserId: currentUser.id,
          newEmail: userDto.email,
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

      await this.mailService.confirmNewEmail({
        to: userDto.email,
        data: {
          hash,
        },
      });
    }

    delete userDto.email;
    delete userDto.oldPassword;

    await this.usersService.update(userJwtPayload.id, userDto);

    return this.usersService.findById(userJwtPayload.id);
  }
}
