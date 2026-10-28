import { HttpStatus, Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { I18nService } from 'nestjs-i18n';
import { UsersService } from '../../users/users.service';
import { SessionService } from '../../session/session.service';
import { TokenService } from './token.service';
import { OtpService } from './otp.service';
import { AuthPhoneRegisterDto } from '../dto/auth-phone-register.dto';
import { AuthPhoneLoginDto } from '../dto/auth-phone-login.dto';
import { AuthPhoneVerifyOtpDto } from '../dto/auth-phone-verify-otp.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { OtpDeliveryMethod } from '../dto/auth-phone-register.dto';
import { StatusEnum } from '../../statuses/statuses.enum';
import { AuthProvidersEnum } from '../auth-providers.enum';
import { NullableType } from '../../utils/types/nullable.type';
import { User } from '../../users/domain/user';
import { throwException } from '../../utils/errors/throw-exception';

@Injectable()
export class PhoneAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly otpService: OtpService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Registers user with phone + sends OTP
   */
  async register(dto: AuthPhoneRegisterDto): Promise<void> {
    // Check if phone already exists
    const existingUser = await this.usersService.findByPhone(dto.phone);
    if (existingUser) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.phoneAlreadyExists'),
      });
    }

    // Check daily limit (max 5 OTPs per 24h)
    await this.otpService.checkDailyLimit(dto.phone);

    // Check rate limiting (60s between requests)
    await this.otpService.checkRateLimit(dto.phone);

    // Generate and create OTP record
    const otp = this.otpService.generateOtp();

    await this.otpService.createRegistrationOtpRecord({
      phone: dto.phone,
      otp,
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: dto.password,
    });

    // Send OTP via SMS or ZNS
    const otpMethod = dto.otpMethod || OtpDeliveryMethod.ZNS;
    await this.otpService.sendOtp(dto.phone, otp, otpMethod);
  }

  /**
   * Login with phone/password (no OTP)
   */
  async login(dto: AuthPhoneLoginDto): Promise<LoginResponseDto> {
    // Check if user exists
    const user = await this.usersService.findByPhone(dto.phone);
    if (!user) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.phoneNotFound'),
      });
    }

    // Allow phone login if user has password (either phone-registered or linked phone)
    if (!user.password) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.needLoginViaProvider', {
          args: { provider: user.provider },
        }),
      });
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.password);

    if (!isValidPassword) {
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

    // Create session and return tokens
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
   * Verifies OTP for registration
   */
  async verifyOtp(dto: AuthPhoneVerifyOtpDto): Promise<LoginResponseDto> {
    // Validate OTP
    const otpRecord = await this.otpService.validateOtp(dto.phone, dto.otp);

    let user: NullableType<User> = null;

    if (otpRecord.isRegistration) {
      // Create new user
      user = await this.usersService.create(
        {
          phone: dto.phone,
          firstName: otpRecord.firstName,
          lastName: otpRecord.lastName,
          password: otpRecord.password!,
          provider: AuthProvidersEnum.phone,
          status: StatusEnum.active,
          email: null,
        },
        { hashPassword: false },
      );
    } else {
      // Find existing user
      user = await this.usersService.findByPhone(dto.phone);
    }

    if (!user) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.userNotFound'),
      });
    }

    if (user.status !== StatusEnum.active) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.accountInactive'),
      });
    }

    // Delete used OTP
    await this.otpService.deleteOtpsByPhone(dto.phone);

    // Create session and return tokens
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
   * Initiates forgot password flow via phone
   */
  async requestPasswordResetOtp(
    phone: string,
    otpMethod?: OtpDeliveryMethod,
  ): Promise<void> {
    // Check if user exists
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.phoneNotFound'),
      });
    }

    if (user.provider !== AuthProvidersEnum.phone) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.needLoginViaProvider', {
          args: { provider: user.provider },
        }),
      });
    }

    // Check daily limit (max 5 OTPs per 24h)
    await this.otpService.checkDailyLimit(phone);

    // Check rate limiting (60s between requests)
    await this.otpService.checkRateLimit(phone);

    // Generate and create OTP record
    const otp = this.otpService.generateOtp();

    await this.otpService.createOtpRecord({
      phone,
      otp,
      isRegistration: false,
    });

    // Send OTP via SMS or ZNS
    const deliveryMethod = otpMethod || OtpDeliveryMethod.ZNS;
    await this.otpService.sendOtp(phone, otp, deliveryMethod);
  }

  /**
   * Verify OTP and return reset token
   */
  async verifyPasswordResetOtp(
    phone: string,
    otp: string,
  ): Promise<{ resetToken: string }> {
    // Validate OTP
    await this.otpService.validateOtp(phone, otp);

    // Verify user still exists
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.userNotFound'),
      });
    }

    // Generate and store reset token
    const resetToken = this.otpService.generateResetToken();
    await this.otpService.storeResetToken(phone, resetToken);

    return { resetToken };
  }

  /**
   * Complete password reset flow with reset token
   */
  async completePasswordReset(
    phone: string,
    resetToken: string,
    password: string,
  ): Promise<void> {
    // Validate reset token
    await this.otpService.validateResetToken(phone, resetToken);

    // Find the user
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.userNotFound'),
      });
    }

    // Update user password
    user.password = password;

    // Delete all sessions for this user (log out everywhere)
    await this.sessionService.deleteByUserId({
      userId: user.id,
    });

    // Update user with new password
    await this.usersService.update(user.id, user);

    // Delete used OTP record
    await this.otpService.deleteOtpsByPhone(phone);
  }
}
