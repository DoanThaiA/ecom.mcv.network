import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { I18nService } from 'nestjs-i18n';
import { OtpService } from '../../../src/auth/services/otp.service';
import { OtpSchemaClass } from '../../../src/sms/model/otp.schema';
import { SmsService } from '../../../src/sms/sms.service';
import { ZaloZnsService } from '../../../src/zalo/zns/zalo-zns.service';
import { OtpDeliveryMethod } from '../../../src/auth/dto/auth-phone-register.dto';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

jest.mock('bcryptjs');
jest.mock('crypto');

describe('OtpService', () => {
  let service: OtpService;
  let otpModel: any;
  let smsService: jest.Mocked<SmsService>;
  let zaloZnsService: jest.Mocked<ZaloZnsService>;
  let i18n: jest.Mocked<I18nService>;

  const mockOtpRecord = {
    _id: 'otp-123',
    phone: '0901234567',
    otp: '123456',
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
    removeAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    createdAt: new Date(),
    isRegistration: false,
  };

  beforeEach(async () => {
    const mockOtpModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      countDocuments: jest.fn(),
    };

    const mockSmsService = {
      sendOtp: jest.fn(),
    };

    const mockZaloZnsService = {
      sendOtp: jest.fn(),
    };

    const mockI18nService = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: getModelToken(OtpSchemaClass.name),
          useValue: mockOtpModel,
        },
        { provide: SmsService, useValue: mockSmsService },
        { provide: ZaloZnsService, useValue: mockZaloZnsService },
        { provide: I18nService, useValue: mockI18nService },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
    otpModel = module.get(getModelToken(OtpSchemaClass.name));
    smsService = module.get(SmsService);
    zaloZnsService = module.get(ZaloZnsService);
    i18n = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateOtp', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = service.generateOtp();

      expect(otp).toHaveLength(6);
      expect(Number(otp)).toBeGreaterThanOrEqual(100000);
      expect(Number(otp)).toBeLessThanOrEqual(999999);
    });

    it('should generate different OTPs on multiple calls', () => {
      const otp1 = service.generateOtp();
      const otp2 = service.generateOtp();
      const otp3 = service.generateOtp();

      // At least one should be different (very high probability)
      expect(otp1 === otp2 && otp2 === otp3).toBe(false);
    });

    it('should generate OTP with only numeric characters', () => {
      const otp = service.generateOtp();

      expect(/^\d+$/.test(otp)).toBe(true);
    });
  });

  describe('generateResetToken', () => {
    it('should generate a reset token', () => {
      const mockRandomBytes = jest.fn().mockReturnValue({
        toString: jest.fn().mockReturnValue('abc123def456'),
      });
      (crypto.randomBytes as jest.Mock) = mockRandomBytes;

      const token = service.generateResetToken();

      expect(token).toBe('abc123def456');
      expect(mockRandomBytes).toHaveBeenCalledWith(32);
    });

    it('should generate different tokens on multiple calls', () => {
      let callCount = 0;
      const mockRandomBytes = jest.fn().mockReturnValue({
        toString: jest.fn().mockImplementation(() => {
          callCount++;
          return `token${callCount}`;
        }),
      });
      (crypto.randomBytes as jest.Mock) = mockRandomBytes;

      const token1 = service.generateResetToken();
      const token2 = service.generateResetToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('checkRateLimit', () => {
    it('should pass when no recent OTP exists', async () => {
      otpModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      });

      await expect(service.checkRateLimit('0901234567')).resolves.not.toThrow();
      expect(otpModel.findOne).toHaveBeenCalledWith({ phone: '0901234567' });
    });

    it('should pass when last OTP was sent more than 60 seconds ago', async () => {
      const oldOtp = {
        ...mockOtpRecord,
        createdAt: new Date(Date.now() - 61 * 1000), // 61 seconds ago
      };
      otpModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(oldOtp),
      });

      await expect(service.checkRateLimit('0901234567')).resolves.not.toThrow();
    });

    it('should throw exception when OTP was sent within 60 seconds', async () => {
      const recentOtp = {
        ...mockOtpRecord,
        createdAt: new Date(Date.now() - 30 * 1000), // 30 seconds ago
      };
      otpModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(recentOtp),
      });
      i18n.t.mockReturnValue('Please wait 30 seconds');

      await expect(service.checkRateLimit('0901234567')).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.otpRateLimited', {
        args: expect.objectContaining({ seconds: expect.any(Number) }),
      });
    });

    it('should calculate correct wait time', async () => {
      const recentOtp = {
        ...mockOtpRecord,
        createdAt: new Date(Date.now() - 45 * 1000), // 45 seconds ago
      };
      otpModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(recentOtp),
      });

      await expect(service.checkRateLimit('0901234567')).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith(
        'auth.otpRateLimited',
        expect.objectContaining({
          args: { seconds: 15 }, // 60 - 45 = 15 seconds
        }),
      );
    });
  });

  describe('checkDailyLimit', () => {
    it('should pass when OTP count is below limit', async () => {
      otpModel.countDocuments.mockResolvedValue(3);

      await expect(
        service.checkDailyLimit('0901234567'),
      ).resolves.not.toThrow();
      expect(otpModel.countDocuments).toHaveBeenCalledWith({
        phone: '0901234567',
      });
    });

    it('should throw exception when OTP count is exactly at limit', async () => {
      otpModel.countDocuments.mockResolvedValue(5);
      i18n.t.mockReturnValue('Daily OTP limit exceeded');

      await expect(service.checkDailyLimit('0901234567')).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.otpDailyLimitExceeded');
    });

    it('should throw exception when OTP count exceeds limit', async () => {
      otpModel.countDocuments.mockResolvedValue(6);
      i18n.t.mockReturnValue('Daily OTP limit exceeded');

      await expect(service.checkDailyLimit('0901234567')).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.otpDailyLimitExceeded');
    });
  });

  describe('createOtpRecord', () => {
    it('should create OTP record for password reset', async () => {
      otpModel.updateMany.mockResolvedValue({ modifiedCount: 0 });
      otpModel.create.mockResolvedValue(mockOtpRecord);

      await service.createOtpRecord({
        phone: '0901234567',
        otp: '123456',
        isRegistration: false,
      });

      expect(otpModel.updateMany).toHaveBeenCalledWith(
        { phone: '0901234567', expiresAt: { $gt: expect.any(Date) } },
        { expiresAt: new Date(0) },
      );
      expect(otpModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '0901234567',
          otp: '123456',
          expiresAt: expect.any(Date),
          removeAt: expect.any(Date),
          isRegistration: false,
        }),
      );
    });

    it('should invalidate unexpired OTPs before creating new one', async () => {
      otpModel.updateMany.mockResolvedValue({ modifiedCount: 1 });
      otpModel.create.mockResolvedValue(mockOtpRecord);

      await service.createOtpRecord({
        phone: '0901234567',
        otp: '123456',
        isRegistration: false,
      });

      expect(otpModel.updateMany).toHaveBeenCalled();
      expect(otpModel.create).toHaveBeenCalled();
    });

    it('should create OTP record with firstName and lastName', async () => {
      otpModel.updateMany.mockResolvedValue({ modifiedCount: 0 });
      otpModel.create.mockResolvedValue(mockOtpRecord);

      await service.createOtpRecord({
        phone: '0901234567',
        otp: '123456',
        firstName: 'Test',
        lastName: 'User',
        isRegistration: true,
      });

      expect(otpModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Test',
          lastName: 'User',
        }),
      );
    });
  });

  describe('createRegistrationOtpRecord', () => {
    it('should create registration OTP record with hashed password', async () => {
      otpModel.updateMany.mockResolvedValue({ modifiedCount: 0 });
      otpModel.create.mockResolvedValue(mockOtpRecord);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      await service.createRegistrationOtpRecord({
        phone: '0901234567',
        otp: '123456',
        firstName: 'Test',
        lastName: 'User',
        password: 'Password123!',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
      expect(otpModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '0901234567',
          otp: '123456',
          firstName: 'Test',
          lastName: 'User',
          password: 'hashed-password',
          isRegistration: true,
        }),
      );
    });

    it('should invalidate unexpired OTPs before creating registration record', async () => {
      otpModel.updateMany.mockResolvedValue({ modifiedCount: 1 });
      otpModel.create.mockResolvedValue(mockOtpRecord);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      await service.createRegistrationOtpRecord({
        phone: '0901234567',
        otp: '123456',
        firstName: 'Test',
        password: 'Password123!',
      });

      expect(otpModel.updateMany).toHaveBeenCalled();
      expect(otpModel.create).toHaveBeenCalled();
    });

    it('should set correct expiration times', async () => {
      otpModel.updateMany.mockResolvedValue({ modifiedCount: 0 });
      otpModel.create.mockResolvedValue(mockOtpRecord);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const beforeCreate = Date.now();
      await service.createRegistrationOtpRecord({
        phone: '0901234567',
        otp: '123456',
        firstName: 'Test',
        password: 'Password123!',
      });
      const afterCreate = Date.now();

      const createCall = otpModel.create.mock.calls[0][0];
      const expiresAt = createCall.expiresAt.getTime();
      const removeAt = createCall.removeAt.getTime();

      // expiresAt should be ~5 minutes from now
      expect(expiresAt).toBeGreaterThan(beforeCreate + 4.9 * 60 * 1000);
      expect(expiresAt).toBeLessThan(afterCreate + 5.1 * 60 * 1000);

      // removeAt should be ~24 hours from now
      expect(removeAt).toBeGreaterThan(beforeCreate + 23.9 * 60 * 60 * 1000);
      expect(removeAt).toBeLessThan(afterCreate + 24.1 * 60 * 60 * 1000);
    });
  });

  describe('validateOtp', () => {
    it('should return OTP record when valid', async () => {
      const validOtp = {
        ...mockOtpRecord,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      };
      otpModel.findOne.mockResolvedValue(validOtp);

      const result = await service.validateOtp('0901234567', '123456');

      expect(result).toEqual(validOtp);
      expect(otpModel.findOne).toHaveBeenCalledWith({
        phone: '0901234567',
        otp: '123456',
      });
    });

    it('should throw exception when OTP not found', async () => {
      otpModel.findOne.mockResolvedValue(null);
      i18n.t.mockReturnValue('OTP not found');

      await expect(
        service.validateOtp('0901234567', '123456'),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.otpNotFound');
    });

    it('should throw exception when OTP is expired', async () => {
      const expiredOtp = {
        ...mockOtpRecord,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      };
      otpModel.findOne.mockResolvedValue(expiredOtp);
      otpModel.deleteMany.mockResolvedValue({ deletedCount: 1 });
      i18n.t.mockReturnValue('OTP expired');

      await expect(
        service.validateOtp('0901234567', '123456'),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.otpExpired');
      expect(otpModel.deleteMany).toHaveBeenCalledWith({ phone: '0901234567' });
    });

    it('should delete OTPs when expired OTP is found', async () => {
      const expiredOtp = {
        ...mockOtpRecord,
        expiresAt: new Date(Date.now() - 1000),
      };
      otpModel.findOne.mockResolvedValue(expiredOtp);
      otpModel.deleteMany.mockResolvedValue({ deletedCount: 1 });

      await expect(
        service.validateOtp('0901234567', '123456'),
      ).rejects.toThrow();
      expect(otpModel.deleteMany).toHaveBeenCalledWith({ phone: '0901234567' });
    });
  });

  describe('findRecentOtp', () => {
    it('should find the most recent OTP for a phone', async () => {
      otpModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockOtpRecord),
      });

      const result = await service.findRecentOtp('0901234567');

      expect(result).toEqual(mockOtpRecord);
      expect(otpModel.findOne).toHaveBeenCalledWith({ phone: '0901234567' });
    });

    it('should return null when no OTP found', async () => {
      otpModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findRecentOtp('0901234567');

      expect(result).toBeNull();
    });
  });

  describe('sendOtp', () => {
    it('should send OTP via ZNS by default', async () => {
      zaloZnsService.sendOtp.mockResolvedValue({} as any);

      await service.sendOtp('0901234567', '123456');

      expect(zaloZnsService.sendOtp).toHaveBeenCalledWith(
        '0901234567',
        '123456',
      );
      expect(smsService.sendOtp).not.toHaveBeenCalled();
    });

    it('should send OTP via ZNS when method is ZNS', async () => {
      zaloZnsService.sendOtp.mockResolvedValue({} as any);

      await service.sendOtp('0901234567', '123456', OtpDeliveryMethod.ZNS);

      expect(zaloZnsService.sendOtp).toHaveBeenCalledWith(
        '0901234567',
        '123456',
      );
      expect(smsService.sendOtp).not.toHaveBeenCalled();
    });

    it('should send OTP via SMS when method is SMS', async () => {
      smsService.sendOtp.mockResolvedValue(undefined);

      await service.sendOtp('0901234567', '123456', OtpDeliveryMethod.SMS);

      expect(smsService.sendOtp).toHaveBeenCalledWith('0901234567', '123456');
      expect(zaloZnsService.sendOtp).not.toHaveBeenCalled();
    });
  });

  describe('deleteOtpsByPhone', () => {
    it('should delete all OTPs for a phone number', async () => {
      otpModel.deleteMany.mockResolvedValue({ deletedCount: 3 });

      await service.deleteOtpsByPhone('0901234567');

      expect(otpModel.deleteMany).toHaveBeenCalledWith({ phone: '0901234567' });
    });

    it('should not throw when no OTPs exist', async () => {
      otpModel.deleteMany.mockResolvedValue({ deletedCount: 0 });

      await expect(
        service.deleteOtpsByPhone('0901234567'),
      ).resolves.not.toThrow();
    });
  });

  describe('createPhoneLinkOtpRecord', () => {
    it('should create phone link OTP record with userId', async () => {
      otpModel.updateMany.mockResolvedValue({ modifiedCount: 0 });
      otpModel.create.mockResolvedValue(mockOtpRecord);

      await service.createPhoneLinkOtpRecord({
        phone: '0901234567',
        otp: '123456',
        userId: 'user-123',
      });

      expect(otpModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '0901234567',
          otp: '123456',
          userId: 'user-123',
          isRegistration: false,
          isPhoneLink: true,
        }),
      );
    });

    it('should invalidate unexpired OTPs before creating phone link record', async () => {
      otpModel.updateMany.mockResolvedValue({ modifiedCount: 1 });
      otpModel.create.mockResolvedValue(mockOtpRecord);

      await service.createPhoneLinkOtpRecord({
        phone: '0901234567',
        otp: '123456',
        userId: 'user-123',
      });

      expect(otpModel.updateMany).toHaveBeenCalledWith(
        { phone: '0901234567', expiresAt: { $gt: expect.any(Date) } },
        { expiresAt: new Date(0) },
      );
      expect(otpModel.updateMany).toHaveBeenCalled();
      expect(otpModel.create).toHaveBeenCalled();
    });
  });

  describe('validatePhoneLinkOtp', () => {
    it('should return OTP record when valid phone link OTP', async () => {
      const validPhoneLinkOtp = {
        ...mockOtpRecord,
        userId: 'user-123',
        isPhoneLink: true,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      };
      otpModel.findOne.mockResolvedValue(validPhoneLinkOtp);

      const result = await service.validatePhoneLinkOtp(
        '0901234567',
        '123456',
        'user-123',
      );

      expect(result).toEqual(validPhoneLinkOtp);
      expect(otpModel.findOne).toHaveBeenCalledWith({
        phone: '0901234567',
        otp: '123456',
        isPhoneLink: true,
      });
    });

    it('should throw exception when phone link OTP not found', async () => {
      otpModel.findOne.mockResolvedValue(null);
      i18n.t.mockReturnValue('OTP not found');

      await expect(
        service.validatePhoneLinkOtp('0901234567', '123456', 'user-123'),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.otpNotFound');
    });

    it('should throw exception when phone link OTP is expired', async () => {
      const expiredOtp = {
        ...mockOtpRecord,
        userId: 'user-123',
        isPhoneLink: true,
        expiresAt: new Date(Date.now() - 1000),
      };
      otpModel.findOne.mockResolvedValue(expiredOtp);
      otpModel.deleteMany.mockResolvedValue({ deletedCount: 1 });
      i18n.t.mockReturnValue('OTP expired');

      await expect(
        service.validatePhoneLinkOtp('0901234567', '123456', 'user-123'),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.otpExpired');
    });

    it('should throw exception when userId does not match', async () => {
      const otpWithDifferentUser = {
        ...mockOtpRecord,
        userId: 'user-456',
        isPhoneLink: true,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      };
      otpModel.findOne.mockResolvedValue(otpWithDifferentUser);
      i18n.t.mockReturnValue('OTP not found');

      await expect(
        service.validatePhoneLinkOtp('0901234567', '123456', 'user-123'),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.otpNotFound');
    });
  });

  describe('cleanupExpiredOtps', () => {
    it('should delete expired OTPs', async () => {
      otpModel.deleteMany.mockResolvedValue({ deletedCount: 5 });

      await service.cleanupExpiredOtps();

      expect(otpModel.deleteMany).toHaveBeenCalledWith({
        expiresAt: { $lt: expect.any(Date) },
      });
    });

    it('should not throw when no expired OTPs exist', async () => {
      otpModel.deleteMany.mockResolvedValue({ deletedCount: 0 });

      await expect(service.cleanupExpiredOtps()).resolves.not.toThrow();
    });
  });

  describe('storeResetToken', () => {
    it('should store reset token for a phone number', async () => {
      otpModel.updateOne.mockResolvedValue({ matchedCount: 1 });

      await service.storeResetToken('0901234567', 'reset-token-123');

      expect(otpModel.updateOne).toHaveBeenCalledWith(
        { phone: '0901234567' },
        {
          resetToken: 'reset-token-123',
          resetTokenExpiresAt: expect.any(Date),
        },
      );
    });

    it('should throw exception when no OTP record found', async () => {
      otpModel.updateOne.mockResolvedValue({ matchedCount: 0 });
      i18n.t.mockReturnValue('OTP not found');

      await expect(
        service.storeResetToken('0901234567', 'reset-token-123'),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.otpNotFound');
    });

    it('should set reset token expiration to 10 minutes', async () => {
      otpModel.updateOne.mockResolvedValue({ matchedCount: 1 });

      const beforeStore = Date.now();
      await service.storeResetToken('0901234567', 'reset-token-123');
      const afterStore = Date.now();

      const updateCall = otpModel.updateOne.mock.calls[0][1];
      const resetTokenExpiresAt = updateCall.resetTokenExpiresAt.getTime();

      // Should be ~10 minutes from now
      expect(resetTokenExpiresAt).toBeGreaterThan(
        beforeStore + 9.9 * 60 * 1000,
      );
      expect(resetTokenExpiresAt).toBeLessThan(afterStore + 10.1 * 60 * 1000);
    });
  });

  describe('validateResetToken', () => {
    it('should return OTP record when reset token is valid', async () => {
      const validResetToken = {
        ...mockOtpRecord,
        resetToken: 'reset-token-123',
        resetTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };
      otpModel.findOne.mockResolvedValue(validResetToken);

      const result = await service.validateResetToken(
        '0901234567',
        'reset-token-123',
      );

      expect(result).toEqual(validResetToken);
      expect(otpModel.findOne).toHaveBeenCalledWith({
        phone: '0901234567',
        resetToken: 'reset-token-123',
      });
    });

    it('should throw exception when reset token not found', async () => {
      otpModel.findOne.mockResolvedValue(null);
      i18n.t.mockReturnValue('Invalid reset token');

      await expect(
        service.validateResetToken('0901234567', 'reset-token-123'),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.invalidResetToken');
    });

    it('should throw exception when reset token is expired', async () => {
      const expiredResetToken = {
        ...mockOtpRecord,
        resetToken: 'reset-token-123',
        resetTokenExpiresAt: new Date(Date.now() - 1000),
      };
      otpModel.findOne.mockResolvedValue(expiredResetToken);
      otpModel.deleteMany.mockResolvedValue({ deletedCount: 1 });
      i18n.t.mockReturnValue('Reset token expired');

      await expect(
        service.validateResetToken('0901234567', 'reset-token-123'),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.resetTokenExpired');
      expect(otpModel.deleteMany).toHaveBeenCalledWith({ phone: '0901234567' });
    });

    it('should throw exception when resetTokenExpiresAt is missing', async () => {
      const noExpirationToken = {
        ...mockOtpRecord,
        resetToken: 'reset-token-123',
        resetTokenExpiresAt: null,
      };
      otpModel.findOne.mockResolvedValue(noExpirationToken);
      otpModel.deleteMany.mockResolvedValue({ deletedCount: 1 });
      i18n.t.mockReturnValue('Reset token expired');

      await expect(
        service.validateResetToken('0901234567', 'reset-token-123'),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.resetTokenExpired');
    });
  });
});
