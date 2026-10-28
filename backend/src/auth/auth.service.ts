import { Injectable } from '@nestjs/common';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { SocialInterface } from '../social/interfaces/social.interface';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { NullableType } from '../utils/types/nullable.type';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { User } from '../users/domain/user';
import {
  AuthPhoneRegisterDto,
  OtpDeliveryMethod,
} from './dto/auth-phone-register.dto';
import { AuthPhoneLoginDto } from './dto/auth-phone-login.dto';
import { AuthPhoneVerifyOtpDto } from './dto/auth-phone-verify-otp.dto';
import { EmailAuthService } from './services/email-auth.service';
import { PhoneAuthService } from './services/phone-auth.service';
import { SocialAuthService } from './services/social-auth.service';
import { ProfileService } from './services/profile.service';
import { AccountService } from './services/account.service';
import { TokenService } from './services/token.service';

/**
 * Facade service that delegates to specialized auth services.
 * Kept for backward compatibility with existing code (e.g., social login controllers).
 *
 * For new code, prefer injecting specific services directly:
 * - EmailAuthService for email authentication
 * - PhoneAuthService for phone authentication
 * - SocialAuthService for social login
 * - ProfileService for profile operations
 * - AccountService for account operations
 * - TokenService for token operations
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly emailAuthService: EmailAuthService,
    private readonly phoneAuthService: PhoneAuthService,
    private readonly socialAuthService: SocialAuthService,
    private readonly profileService: ProfileService,
    private readonly accountService: AccountService,
    private readonly tokenService: TokenService,
  ) {}

  // Email Authentication Methods
  async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    return this.emailAuthService.validateLogin(loginDto);
  }

  async register(dto: AuthRegisterLoginDto): Promise<void> {
    return this.emailAuthService.register(dto);
  }

  async confirmEmail(hash: string): Promise<void> {
    return this.emailAuthService.confirmEmail(hash);
  }

  async confirmNewEmail(hash: string): Promise<void> {
    return this.emailAuthService.confirmNewEmail(hash);
  }

  async emailForgotPassword(email: string): Promise<void> {
    return this.emailAuthService.forgotPassword(email);
  }

  async emailResetPassword(hash: string, password: string): Promise<void> {
    return this.emailAuthService.resetPassword(hash, password);
  }

  // Phone Authentication Methods
  async phoneRegister(dto: AuthPhoneRegisterDto): Promise<void> {
    return this.phoneAuthService.register(dto);
  }

  async phoneLogin(dto: AuthPhoneLoginDto): Promise<LoginResponseDto> {
    return this.phoneAuthService.login(dto);
  }

  async verifyPhoneOtp(dto: AuthPhoneVerifyOtpDto): Promise<LoginResponseDto> {
    return this.phoneAuthService.verifyOtp(dto);
  }

  async phoneRequestPasswordResetOtp(
    phone: string,
    otpMethod?: OtpDeliveryMethod,
  ): Promise<void> {
    return this.phoneAuthService.requestPasswordResetOtp(phone, otpMethod);
  }

  async phoneVerifyPasswordResetOtp(
    phone: string,
    otp: string,
  ): Promise<{ resetToken: string }> {
    return this.phoneAuthService.verifyPasswordResetOtp(phone, otp);
  }

  async phoneCompletePasswordReset(
    phone: string,
    resetToken: string,
    password: string,
  ): Promise<void> {
    return this.phoneAuthService.completePasswordReset(
      phone,
      resetToken,
      password,
    );
  }

  // Social Authentication Methods
  async validateSocialLogin(
    authProvider: string,
    socialData: SocialInterface,
  ): Promise<LoginResponseDto> {
    return this.socialAuthService.validateSocialLogin(authProvider, socialData);
  }

  // Profile Methods
  async me(userJwtPayload: JwtPayloadType): Promise<NullableType<User>> {
    return this.profileService.me(userJwtPayload);
  }

  async update(
    userJwtPayload: JwtPayloadType,
    userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    return this.profileService.update(userJwtPayload, userDto);
  }

  // Account Methods
  async softDelete(user: User): Promise<void> {
    return this.accountService.softDelete(user);
  }

  async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>) {
    return this.accountService.logout(data);
  }

  // Token Methods
  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sessionId' | 'hash'>,
  ): Promise<Omit<LoginResponseDto, 'user'>> {
    return this.tokenService.refreshToken(data);
  }
}
