import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { UsersService } from '../../users/users.service';
import { OtpService } from './otp.service';
import { OrderRepository } from '../../shop/order/domain/order.repository';
import { AuthPhoneLinkRequestDto } from '../dto/auth-phone-link-request.dto';
import { AuthPhoneLinkVerifyDto } from '../dto/auth-phone-link-verify.dto';
import { OtpDeliveryMethod } from '../dto/auth-phone-register.dto';
import { User } from '../../users/domain/user';
import { throwException } from '../../utils/errors/throw-exception';

@Injectable()
export class PhoneLinkService {
  private readonly logger = new Logger(PhoneLinkService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly i18n: I18nService,
    private readonly orderRepository: OrderRepository,
  ) {}

  /**
   * Request OTP to link phone number to existing account
   */
  async requestLinkOtp(
    userId: string | number,
    dto: AuthPhoneLinkRequestDto,
  ): Promise<void> {
    // Get current user
    const currentUser = await this.usersService.findById(userId);
    if (!currentUser) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.userNotFound'),
      });
    }

    // Check if user already has this phone
    if (currentUser.phone === dto.phone) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.phoneAlreadyLinked'),
      });
    }

    // Check if phone is used by another account
    const existingUser = await this.usersService.findByPhone(dto.phone);
    if (existingUser && existingUser.id !== userId) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.phoneAlreadyExists'),
      });
    }

    // Check rate limit
    await this.otpService.checkRateLimit(dto.phone);

    // Generate and store OTP
    const otp = this.otpService.generateOtp();
    await this.otpService.createPhoneLinkOtpRecord({
      phone: dto.phone,
      otp,
      userId: userId.toString(),
    });

    // Send OTP
    const otpMethod = dto.otpMethod || OtpDeliveryMethod.ZNS;
    await this.otpService.sendOtp(dto.phone, otp, otpMethod);
  }

  /**
   * Verify OTP and link phone to account
   */
  async verifyLinkOtp(
    userId: string | number,
    dto: AuthPhoneLinkVerifyDto,
  ): Promise<User> {
    // Get current user
    const currentUser = await this.usersService.findById(userId);
    if (!currentUser) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.userNotFound'),
      });
    }

    // Validate OTP
    await this.otpService.validatePhoneLinkOtp(
      dto.phone,
      dto.otp,
      userId.toString(),
    );

    // Double-check phone not taken (race condition protection)
    const existingUser = await this.usersService.findByPhone(dto.phone);
    if (existingUser && existingUser.id !== userId) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.phoneAlreadyExists'),
      });
    }

    // Handle password requirement for social login users
    if (!currentUser.password && !dto.password) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.passwordRequiredForPhoneLink'),
      });
    }

    // Link phone to user (and set password if provided)
    const updateData: { phone: string; password?: string } = {
      phone: dto.phone,
    };
    if (dto.password) {
      updateData.password = dto.password;
    }

    await this.usersService.update(userId, updateData);

    // Delete used OTP
    await this.otpService.deleteOtpsByPhone(dto.phone);

    // Return updated user
    const updatedUser = await this.usersService.findById(userId);
    if (!updatedUser) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.userNotFound'),
      });
    }

    // Merge guest orders to user account
    await this.mergeGuestOrders(
      dto.phone,
      userId.toString(),
      updatedUser.cdpCustomerId ?? undefined,
    );

    return updatedUser;
  }

  /**
   * Merge guest orders to user account after phone linking
   */
  private async mergeGuestOrders(
    phone: string,
    userId: string,
    cdpCustomerId?: string,
  ): Promise<void> {
    try {
      const guestOrders =
        await this.orderRepository.findGuestOrdersByPhone(phone);

      if (guestOrders.length === 0) {
        return;
      }

      const orderIds = guestOrders.map((o) => o.id);
      const count = await this.orderRepository.assignOrdersToUser(
        orderIds,
        userId,
        cdpCustomerId,
      );

      // TODO: When CDP merge API is available:
      // 1. Get guest's cdpCustomerId from merged orders
      // 2. Call CDP merge API to consolidate transaction history

      this.logger.log(`Merged ${count} guest orders to user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to merge guest orders for phone ${phone}:`,
        error,
      );
      // Don't throw - order merge failure shouldn't block phone linking
    }
  }
}
