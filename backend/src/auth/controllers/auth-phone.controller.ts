import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { PhoneAuthService } from '../services/phone-auth.service';
import { PhoneLinkService } from '../services/phone-link.service';
import { AuthPhoneRegisterDto } from '../dto/auth-phone-register.dto';
import { AuthPhoneLoginDto } from '../dto/auth-phone-login.dto';
import { AuthPhoneVerifyOtpDto } from '../dto/auth-phone-verify-otp.dto';
import { AuthPhoneForgotPasswordRequestDto } from '../dto/auth-phone-forgot-password-request.dto';
import { AuthPhoneForgotPasswordVerifyDto } from '../dto/auth-phone-forgot-password-verify.dto';
import { AuthPhoneForgotPasswordCompleteDto } from '../dto/auth-phone-forgot-password-complete.dto';
import { AuthPhoneLinkRequestDto } from '../dto/auth-phone-link-request.dto';
import { AuthPhoneLinkVerifyDto } from '../dto/auth-phone-link-verify.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { User } from '../../users/domain/user';

@ApiTags('Auth - Phone')
@Controller({
  path: 'auth/phone',
  version: '1',
})
@UseGuards(ThrottlerGuard)
export class AuthPhoneController {
  constructor(
    private readonly phoneAuthService: PhoneAuthService,
    private readonly phoneLinkService: PhoneLinkService,
  ) {}

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('login')
  @Throttle({ short: { ttl: 60000, limit: 5 }, long: { ttl: 600000, limit: 20 } })
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: AuthPhoneLoginDto): Promise<LoginResponseDto> {
    return this.phoneAuthService.login(dto);
  }

  @Post('register')
  @Throttle({ short: { ttl: 60000, limit: 3 }, long: { ttl: 600000, limit: 10 } })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() dto: AuthPhoneRegisterDto): Promise<void> {
    return this.phoneAuthService.register(dto);
  }

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('verify-otp')
  @Throttle({ short: { ttl: 60000, limit: 5 }, long: { ttl: 600000, limit: 20 } })
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() dto: AuthPhoneVerifyOtpDto,
  ): Promise<LoginResponseDto> {
    return this.phoneAuthService.verifyOtp(dto);
  }

  @Post('forgot/password/request-otp')
  @Throttle({ short: { ttl: 60000, limit: 3 }, long: { ttl: 600000, limit: 5 } })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPasswordRequestOtp(
    @Body() dto: AuthPhoneForgotPasswordRequestDto,
  ): Promise<void> {
    return this.phoneAuthService.requestPasswordResetOtp(
      dto.phone,
      dto.otpMethod,
    );
  }

  @Post('forgot/password/verify-otp')
  @Throttle({ short: { ttl: 60000, limit: 5 }, long: { ttl: 600000, limit: 20 } })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @HttpCode(HttpStatus.OK)
  async forgotPasswordVerifyOtp(
    @Body() dto: AuthPhoneForgotPasswordVerifyDto,
  ): Promise<{ resetToken: string }> {
    return this.phoneAuthService.verifyPasswordResetOtp(dto.phone, dto.otp);
  }

  @Post('forgot/password/complete')
  @Throttle({ short: { ttl: 60000, limit: 3 }, long: { ttl: 600000, limit: 5 } })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPasswordComplete(
    @Body() dto: AuthPhoneForgotPasswordCompleteDto,
  ): Promise<void> {
    return this.phoneAuthService.completePasswordReset(
      dto.phone,
      dto.resetToken,
      dto.password,
    );
  }

  @ApiBearerAuth()
  @Post('link/request-otp')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async requestLinkOtp(
    @Request() request,
    @Body() dto: AuthPhoneLinkRequestDto,
  ): Promise<void> {
    return this.phoneLinkService.requestLinkOtp(request.user.id, dto);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('link/verify-otp')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: User,
  })
  @HttpCode(HttpStatus.OK)
  async verifyLinkOtp(
    @Request() request,
    @Body() dto: AuthPhoneLinkVerifyDto,
  ): Promise<User> {
    return this.phoneLinkService.verifyLinkOtp(request.user.id, dto);
  }
}
