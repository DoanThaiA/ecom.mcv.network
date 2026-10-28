import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { EmailAuthService } from '../services/email-auth.service';
import { AuthEmailLoginDto } from '../dto/auth-email-login.dto';
import { AuthForgotPasswordDto } from '../dto/auth-forgot-password.dto';
import { AuthConfirmEmailDto } from '../dto/auth-confirm-email.dto';
import { AuthResetPasswordDto } from '../dto/auth-reset-password.dto';
import { AuthRegisterLoginDto } from '../dto/auth-register-login.dto';
import { LoginResponseDto } from '../dto/login-response.dto';

@ApiTags('Auth - Email')
@Controller({
  path: 'auth/email',
  version: '1',
})
@UseGuards(ThrottlerGuard)
export class AuthEmailController {
  constructor(private readonly emailAuthService: EmailAuthService) {}

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
  public login(@Body() loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    return this.emailAuthService.validateLogin(loginDto);
  }

  @Post('register')
  @Throttle({ short: { ttl: 60000, limit: 3 }, long: { ttl: 600000, limit: 10 } })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() createUserDto: AuthRegisterLoginDto): Promise<void> {
    return this.emailAuthService.register(createUserDto);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.emailAuthService.confirmEmail(confirmEmailDto.hash);
  }

  @Post('confirm/new')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmNewEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.emailAuthService.confirmNewEmail(confirmEmailDto.hash);
  }

  @Post('forgot/password')
  @Throttle({ short: { ttl: 60000, limit: 3 }, long: { ttl: 600000, limit: 5 } })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<void> {
    return this.emailAuthService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset/password')
  @Throttle({ short: { ttl: 60000, limit: 3 }, long: { ttl: 600000, limit: 5 } })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    return this.emailAuthService.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }
}
