import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OtpSchemaClass } from '../../sms/model/otp.schema';
import { SmsService } from '../../sms/sms.service';
import { ZaloZnsService } from '../../zalo/zns/zalo-zns.service';
import { OtpDeliveryMethod } from '../dto/auth-phone-register.dto';
import { throwException } from '../../utils/errors/throw-exception';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes
  private readonly RATE_LIMIT_MS = 60 * 1000; // 60 seconds
  private readonly OTP_LENGTH = 6;
  private readonly RESET_TOKEN_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes
  private readonly DAILY_OTP_LIMIT = 5; // Max 5 OTPs per phone per day
  private readonly OTP_RECORD_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor(
    @InjectModel(OtpSchemaClass.name)
    private readonly otpModel: Model<OtpSchemaClass>,
    private readonly smsService: SmsService,
    private readonly zaloZnsService: ZaloZnsService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Generates a random 6-digit OTP
   */
  generateOtp(): string {
    const min = Math.pow(10, this.OTP_LENGTH - 1);
    const max = Math.pow(10, this.OTP_LENGTH) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }

  /**
   * Generates a secure random reset token
   */
  generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Checks rate limiting for OTP requests
   * Throws exception if user requests OTP too frequently
   */
  async checkRateLimit(phone: string): Promise<void> {
    const recentOtp = await this.otpModel
      .findOne({ phone })
      .sort({ createdAt: -1 });

    if (recentOtp) {
      const timeSinceLastOtp = Date.now() - recentOtp.createdAt.getTime();

      if (timeSinceLastOtp < this.RATE_LIMIT_MS) {
        const waitSeconds = Math.ceil(
          (this.RATE_LIMIT_MS - timeSinceLastOtp) / 1000,
        );
        throwException({
          status: HttpStatus.TOO_MANY_REQUESTS,
          message: this.i18n.t('auth.otpRateLimited', {
            args: { seconds: waitSeconds },
          }),
          errors: {
            seconds: waitSeconds.toString(),
          },
        });
      }
    }
  }

  /**
   * Checks daily OTP limit for a phone number
   * Throws exception if user has exceeded 5 OTPs per day
   */
  async checkDailyLimit(phone: string): Promise<void> {
    const otpCount = await this.otpModel.countDocuments({ phone });

    if (otpCount >= this.DAILY_OTP_LIMIT) {
      throwException({
        status: HttpStatus.TOO_MANY_REQUESTS,
        message: this.i18n.t('auth.otpDailyLimitExceeded'),
      });
    }
  }

  /**
   * Creates and stores an OTP record in the database
   * For password reset flow (no password stored)
   * Don't delete old records to maintain daily limit counting.
   * Instead, we invalidate unexpired OTPs and let TTL index handle cleanup.
   */
  async createOtpRecord(data: {
    phone: string;
    otp: string;
    firstName?: string;
    lastName?: string;
    isRegistration: boolean;
  }): Promise<void> {
    // Invalidate any unexpired OTPs for this phone (set expiresAt to past)
    // Don't delete to maintain the count for daily rate limiting
    await this.otpModel.updateMany(
      { phone: data.phone, expiresAt: { $gt: new Date() } },
      { expiresAt: new Date(0) },
    );

    const now = Date.now();
    const expiresAt = new Date(now + this.OTP_EXPIRATION_MS);
    const removeAt = new Date(now + this.OTP_RECORD_TTL_MS);

    await this.otpModel.create({
      phone: data.phone,
      otp: data.otp,
      expiresAt,
      removeAt,
      firstName: data.firstName,
      lastName: data.lastName,
      isRegistration: data.isRegistration,
    });
  }

  /**
   * Creates and stores an OTP record for registration
   * Note: Registration flow stores user data (including password) temporarily in OTP record
   * This is acceptable for registration since the user is creating a new account
   * For password reset, use createOtpRecord() which doesn't store passwords
   * Don't delete old records to maintain daily limit counting.
   */
  async createRegistrationOtpRecord(data: {
    phone: string;
    otp: string;
    firstName: string;
    lastName?: string;
    password: string;
  }): Promise<void> {
    // Invalidate any unexpired OTPs for this phone (set expiresAt to past)
    // Don't delete to maintain the count for daily rate limiting
    await this.otpModel.updateMany(
      { phone: data.phone, expiresAt: { $gt: new Date() } },
      { expiresAt: new Date(0) },
    );

    const now = Date.now();
    const expiresAt = new Date(now + this.OTP_EXPIRATION_MS);
    const removeAt = new Date(now + this.OTP_RECORD_TTL_MS); // 24h for daily limit counting

    // For registration, we need to temporarily store user data including password
    // This will be used to create the user account after OTP verification
    const hashedPassword = await bcrypt.hash(data.password, 10);

    await this.otpModel.create({
      phone: data.phone,
      otp: data.otp,
      expiresAt,
      removeAt,
      firstName: data.firstName,
      lastName: data.lastName,
      password: hashedPassword,
      isRegistration: true,
    });
  }

  /**
   * Validates an OTP record
   * Returns the OTP record if valid, throws exception otherwise
   */
  async validateOtp(
    phone: string,
    otp: string,
  ): Promise<OtpSchemaClass & { _id: any }> {
    const otpRecord = await this.otpModel.findOne({ phone, otp });

    if (!otpRecord) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.otpNotFound'),
      });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      await this.otpModel.deleteMany({ phone });
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.otpExpired'),
      });
    }

    return otpRecord;
  }

  /**
   * Finds the most recent OTP record for a phone number
   */
  async findRecentOtp(phone: string): Promise<OtpSchemaClass | null> {
    return this.otpModel.findOne({ phone }).sort({ createdAt: -1 });
  }

  /**
   * Sends OTP via the specified delivery method
   */
  async sendOtp(
    phone: string,
    otp: string,
    method: OtpDeliveryMethod = OtpDeliveryMethod.ZNS,
  ): Promise<void> {
    if (method === OtpDeliveryMethod.ZNS) {
      await this.zaloZnsService.sendOtp(phone, otp);
    } else {
      await this.smsService.sendOtp(phone, otp);
    }
  }

  /**
   * Deletes all OTP records for a phone number
   */
  async deleteOtpsByPhone(phone: string): Promise<void> {
    await this.otpModel.deleteMany({ phone });
  }

  /**
   * Creates OTP record for phone linking (stores userId for verification)
   * Don't delete old records to maintain daily limit counting.
   */
  async createPhoneLinkOtpRecord(data: {
    phone: string;
    otp: string;
    userId: string;
  }): Promise<void> {
    // Invalidate any unexpired OTPs for this phone (set expiresAt to past)
    // Don't delete to maintain the count for daily rate limiting
    await this.otpModel.updateMany(
      { phone: data.phone, expiresAt: { $gt: new Date() } },
      { expiresAt: new Date(0) },
    );

    const now = Date.now();
    const expiresAt = new Date(now + this.OTP_EXPIRATION_MS);
    const removeAt = new Date(now + this.OTP_RECORD_TTL_MS); // 24h for daily limit counting

    await this.otpModel.create({
      phone: data.phone,
      otp: data.otp,
      expiresAt,
      removeAt,
      userId: data.userId,
      isRegistration: false,
      isPhoneLink: true,
    });
  }

  /**
   * Validates OTP for phone linking - ensures same user who requested
   */
  async validatePhoneLinkOtp(
    phone: string,
    otp: string,
    userId: string,
  ): Promise<OtpSchemaClass & { _id: any }> {
    const otpRecord = await this.otpModel.findOne({
      phone,
      otp,
      isPhoneLink: true,
    });

    if (!otpRecord) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.otpNotFound'),
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await this.otpModel.deleteMany({ phone });
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.otpExpired'),
      });
    }

    // Verify the same user who requested the OTP is verifying it
    if (otpRecord.userId !== userId) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.otpNotFound'),
      });
    }

    return otpRecord;
  }

  /**
   * Cleans up expired OTP records (can be called by a scheduled job)
   */
  async cleanupExpiredOtps(): Promise<void> {
    await this.otpModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
  }

  /**
   * Stores a reset token in the OTP record after OTP verification
   */
  async storeResetToken(phone: string, resetToken: string): Promise<void> {
    const resetTokenExpiresAt = new Date(
      Date.now() + this.RESET_TOKEN_EXPIRATION_MS,
    );

    const result = await this.otpModel.updateOne(
      { phone },
      { resetToken, resetTokenExpiresAt },
    );

    if (result.matchedCount === 0) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.otpNotFound'),
      });
    }
  }

  /**
   * Validates a reset token
   * Returns the OTP record if valid, throws exception otherwise
   */
  async validateResetToken(
    phone: string,
    resetToken: string,
  ): Promise<OtpSchemaClass & { _id: any }> {
    const otpRecord = await this.otpModel.findOne({ phone, resetToken });

    if (!otpRecord) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.invalidResetToken'),
      });
    }

    // Check if reset token is expired
    if (
      !otpRecord.resetTokenExpiresAt ||
      otpRecord.resetTokenExpiresAt < new Date()
    ) {
      await this.otpModel.deleteMany({ phone });
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.resetTokenExpired'),
      });
    }

    return otpRecord;
  }
}
