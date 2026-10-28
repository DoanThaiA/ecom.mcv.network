import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import bcrypt from 'bcryptjs';
import { PhoneAuthService } from '../../../src/auth/services/phone-auth.service';
import { UsersService } from '../../../src/users/users.service';
import { SessionService } from '../../../src/session/session.service';
import { TokenService } from '../../../src/auth/services/token.service';
import { OtpService } from '../../../src/auth/services/otp.service';
import { AuthPhoneRegisterDto } from '../../../src/auth/dto/auth-phone-register.dto';
import { AuthPhoneLoginDto } from '../../../src/auth/dto/auth-phone-login.dto';
import { AuthPhoneVerifyOtpDto } from '../../../src/auth/dto/auth-phone-verify-otp.dto';
import { OtpDeliveryMethod } from '../../../src/auth/dto/auth-phone-register.dto';
import { StatusEnum } from '../../../src/statuses/statuses.enum';
import { AuthProvidersEnum } from '../../../src/auth/auth-providers.enum';
import { User } from '../../../src/users/domain/user';
import { Session } from '../../../src/session/domain/session';

jest.mock('bcryptjs');

describe('PhoneAuthService', () => {
  let service: PhoneAuthService;
  let usersService: jest.Mocked<UsersService>;
  let sessionService: jest.Mocked<SessionService>;
  let tokenService: jest.Mocked<TokenService>;
  let otpService: jest.Mocked<OtpService>;
  let i18n: jest.Mocked<I18nService>;

  const mockUser: User = {
    id: 'user-123',
    phone: '0901234567',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashed-password',
    provider: AuthProvidersEnum.phone,
    status: StatusEnum.active,
    email: null,
    socialId: null,
    socialAccounts: [],
    photo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  } as User;

  const mockSession: Session = {
    id: 'session-123',
    userId: 'user-123',
    hash: 'session-hash',
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  } as Session;

  const mockTokenData = {
    token: 'jwt-token',
    refreshToken: 'refresh-token',
    tokenExpires: 3600,
  };

  const mockOtpRecord = {
    _id: 'otp-123',
    phone: '0901234567',
    otp: '123456',
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    firstName: 'Test',
    lastName: 'User',
    password: 'hashed-password',
    isRegistration: true,
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByPhone: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockSessionService = {
      createForUser: jest.fn(),
      deleteByUserId: jest.fn(),
    };

    const mockTokenService = {
      getTokensData: jest.fn(),
    };

    const mockOtpService = {
      checkDailyLimit: jest.fn(),
      checkRateLimit: jest.fn(),
      generateOtp: jest.fn(),
      createRegistrationOtpRecord: jest.fn(),
      createOtpRecord: jest.fn(),
      sendOtp: jest.fn(),
      validateOtp: jest.fn(),
      deleteOtpsByPhone: jest.fn(),
      generateResetToken: jest.fn(),
      storeResetToken: jest.fn(),
      validateResetToken: jest.fn(),
    };

    const mockI18nService = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhoneAuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: OtpService, useValue: mockOtpService },
        { provide: I18nService, useValue: mockI18nService },
      ],
    }).compile();

    service = module.get<PhoneAuthService>(PhoneAuthService);
    usersService = module.get(UsersService);
    sessionService = module.get(SessionService);
    tokenService = module.get(TokenService);
    otpService = module.get(OtpService);
    i18n = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: AuthPhoneRegisterDto = {
      phone: '0901234567',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      otpMethod: OtpDeliveryMethod.ZNS,
    };

    it('should register a new user successfully', async () => {
      usersService.findByPhone.mockResolvedValue(null);
      otpService.checkDailyLimit.mockResolvedValue(undefined);
      otpService.checkRateLimit.mockResolvedValue(undefined);
      otpService.generateOtp.mockReturnValue('123456');
      otpService.createRegistrationOtpRecord.mockResolvedValue(undefined);
      otpService.sendOtp.mockResolvedValue(undefined);

      await service.register(registerDto);

      expect(usersService.findByPhone).toHaveBeenCalledWith('0901234567');
      expect(otpService.checkDailyLimit).toHaveBeenCalledWith('0901234567');
      expect(otpService.checkRateLimit).toHaveBeenCalledWith('0901234567');
      expect(otpService.generateOtp).toHaveBeenCalled();
      expect(otpService.createRegistrationOtpRecord).toHaveBeenCalledWith({
        phone: '0901234567',
        otp: '123456',
        firstName: 'Test',
        lastName: 'User',
        password: 'Password123!',
      });
      expect(otpService.sendOtp).toHaveBeenCalledWith(
        '0901234567',
        '123456',
        OtpDeliveryMethod.ZNS,
      );
    });

    it('should throw exception when phone already exists', async () => {
      usersService.findByPhone.mockResolvedValue(mockUser);
      i18n.t.mockReturnValue('Phone already exists');

      await expect(service.register(registerDto)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.phoneAlreadyExists');
      expect(otpService.checkDailyLimit).not.toHaveBeenCalled();
    });

    it('should use default OTP method (ZNS) when not specified', async () => {
      const dtoWithoutMethod = { ...registerDto };
      delete dtoWithoutMethod.otpMethod;

      usersService.findByPhone.mockResolvedValue(null);
      otpService.checkDailyLimit.mockResolvedValue(undefined);
      otpService.checkRateLimit.mockResolvedValue(undefined);
      otpService.generateOtp.mockReturnValue('123456');
      otpService.createRegistrationOtpRecord.mockResolvedValue(undefined);
      otpService.sendOtp.mockResolvedValue(undefined);

      await service.register(dtoWithoutMethod);

      expect(otpService.sendOtp).toHaveBeenCalledWith(
        '0901234567',
        '123456',
        OtpDeliveryMethod.ZNS,
      );
    });

    it('should respect rate limiting', async () => {
      usersService.findByPhone.mockResolvedValue(null);
      otpService.checkDailyLimit.mockResolvedValue(undefined);
      otpService.checkRateLimit.mockRejectedValue(new Error('Rate limited'));

      await expect(service.register(registerDto)).rejects.toThrow(
        'Rate limited',
      );
      expect(otpService.createRegistrationOtpRecord).not.toHaveBeenCalled();
    });

    it('should respect daily limit', async () => {
      usersService.findByPhone.mockResolvedValue(null);
      otpService.checkDailyLimit.mockRejectedValue(
        new Error('Daily limit exceeded'),
      );

      await expect(service.register(registerDto)).rejects.toThrow(
        'Daily limit exceeded',
      );
      expect(otpService.checkRateLimit).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: AuthPhoneLoginDto = {
      phone: '0901234567',
      password: 'Password123!',
    };

    it('should login successfully with valid credentials', async () => {
      usersService.findByPhone.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        ...mockTokenData,
        user: mockUser,
      });
      expect(usersService.findByPhone).toHaveBeenCalledWith('0901234567');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'Password123!',
        'hashed-password',
      );
      expect(sessionService.createForUser).toHaveBeenCalledWith(mockUser);
      expect(tokenService.getTokensData).toHaveBeenCalledWith({
        id: 'user-123',
        sessionId: 'session-123',
        hash: 'session-hash',
      });
    });

    it('should throw exception when phone not found', async () => {
      usersService.findByPhone.mockResolvedValue(null);
      i18n.t.mockReturnValue('Phone not found');

      await expect(service.login(loginDto)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.phoneNotFound');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw exception when user has no password', async () => {
      const userWithoutPassword = { ...mockUser, password: undefined };
      usersService.findByPhone.mockResolvedValue(userWithoutPassword);
      i18n.t.mockReturnValue('Need login via provider');

      await expect(service.login(loginDto)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.needLoginViaProvider', {
        args: { provider: AuthProvidersEnum.phone },
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw exception when password is incorrect', async () => {
      usersService.findByPhone.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      i18n.t.mockReturnValue('Incorrect password');

      await expect(service.login(loginDto)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.incorrectPassword');
      expect(sessionService.createForUser).not.toHaveBeenCalled();
    });

    it('should throw exception when user account is inactive', async () => {
      const inactiveUser = { ...mockUser, status: StatusEnum.inactive };
      usersService.findByPhone.mockResolvedValue(inactiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      i18n.t.mockReturnValue('Account inactive');

      await expect(service.login(loginDto)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.accountInactive');
      expect(sessionService.createForUser).not.toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    const verifyDto: AuthPhoneVerifyOtpDto = {
      phone: '0901234567',
      otp: '123456',
    };

    it('should verify OTP and create new user for registration', async () => {
      const registrationOtpRecord = { ...mockOtpRecord, isRegistration: true };
      otpService.validateOtp.mockResolvedValue(registrationOtpRecord as any);
      usersService.create.mockResolvedValue(mockUser);
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);
      otpService.deleteOtpsByPhone.mockResolvedValue(undefined);

      const result = await service.verifyOtp(verifyDto);

      expect(result).toEqual({
        ...mockTokenData,
        user: mockUser,
      });
      expect(otpService.validateOtp).toHaveBeenCalledWith(
        '0901234567',
        '123456',
      );
      expect(usersService.create).toHaveBeenCalledWith(
        {
          phone: '0901234567',
          firstName: 'Test',
          lastName: 'User',
          password: 'hashed-password',
          provider: AuthProvidersEnum.phone,
          status: StatusEnum.active,
          email: null,
        },
        { hashPassword: false },
      );
      expect(otpService.deleteOtpsByPhone).toHaveBeenCalledWith('0901234567');
    });

    it('should verify OTP and find existing user for non-registration', async () => {
      const nonRegistrationOtpRecord = {
        ...mockOtpRecord,
        isRegistration: false,
      };
      otpService.validateOtp.mockResolvedValue(nonRegistrationOtpRecord as any);
      usersService.findByPhone.mockResolvedValue(mockUser);
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);
      otpService.deleteOtpsByPhone.mockResolvedValue(undefined);

      const result = await service.verifyOtp(verifyDto);

      expect(result).toEqual({
        ...mockTokenData,
        user: mockUser,
      });
      expect(usersService.findByPhone).toHaveBeenCalledWith('0901234567');
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should throw exception when user not found after non-registration OTP', async () => {
      const nonRegistrationOtpRecord = {
        ...mockOtpRecord,
        isRegistration: false,
      };
      otpService.validateOtp.mockResolvedValue(nonRegistrationOtpRecord as any);
      usersService.findByPhone.mockResolvedValue(null);
      i18n.t.mockReturnValue('User not found');

      await expect(service.verifyOtp(verifyDto)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.userNotFound');
    });

    it('should throw exception when user account is inactive', async () => {
      const registrationOtpRecord = { ...mockOtpRecord, isRegistration: true };
      const inactiveUser = { ...mockUser, status: StatusEnum.inactive };
      otpService.validateOtp.mockResolvedValue(registrationOtpRecord as any);
      usersService.create.mockResolvedValue(inactiveUser);
      i18n.t.mockReturnValue('Account inactive');

      await expect(service.verifyOtp(verifyDto)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.accountInactive');
      expect(sessionService.createForUser).not.toHaveBeenCalled();
    });

    it('should delete used OTP after successful verification', async () => {
      const registrationOtpRecord = { ...mockOtpRecord, isRegistration: true };
      otpService.validateOtp.mockResolvedValue(registrationOtpRecord as any);
      usersService.create.mockResolvedValue(mockUser);
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);
      otpService.deleteOtpsByPhone.mockResolvedValue(undefined);

      await service.verifyOtp(verifyDto);

      expect(otpService.deleteOtpsByPhone).toHaveBeenCalledWith('0901234567');
    });
  });

  describe('requestPasswordResetOtp', () => {
    const phone = '0901234567';

    it('should send password reset OTP successfully', async () => {
      usersService.findByPhone.mockResolvedValue(mockUser);
      otpService.checkDailyLimit.mockResolvedValue(undefined);
      otpService.checkRateLimit.mockResolvedValue(undefined);
      otpService.generateOtp.mockReturnValue('123456');
      otpService.createOtpRecord.mockResolvedValue(undefined);
      otpService.sendOtp.mockResolvedValue(undefined);

      await service.requestPasswordResetOtp(phone);

      expect(usersService.findByPhone).toHaveBeenCalledWith(phone);
      expect(otpService.checkDailyLimit).toHaveBeenCalledWith(phone);
      expect(otpService.checkRateLimit).toHaveBeenCalledWith(phone);
      expect(otpService.createOtpRecord).toHaveBeenCalledWith({
        phone,
        otp: '123456',
        isRegistration: false,
      });
      expect(otpService.sendOtp).toHaveBeenCalledWith(
        phone,
        '123456',
        OtpDeliveryMethod.ZNS,
      );
    });

    it('should use specified OTP delivery method', async () => {
      usersService.findByPhone.mockResolvedValue(mockUser);
      otpService.checkDailyLimit.mockResolvedValue(undefined);
      otpService.checkRateLimit.mockResolvedValue(undefined);
      otpService.generateOtp.mockReturnValue('123456');
      otpService.createOtpRecord.mockResolvedValue(undefined);
      otpService.sendOtp.mockResolvedValue(undefined);

      await service.requestPasswordResetOtp(phone, OtpDeliveryMethod.SMS);

      expect(otpService.sendOtp).toHaveBeenCalledWith(
        phone,
        '123456',
        OtpDeliveryMethod.SMS,
      );
    });

    it('should throw exception when phone not found', async () => {
      usersService.findByPhone.mockResolvedValue(null);
      i18n.t.mockReturnValue('Phone not found');

      await expect(service.requestPasswordResetOtp(phone)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.phoneNotFound');
      expect(otpService.checkDailyLimit).not.toHaveBeenCalled();
    });

    it('should throw exception when user provider is not phone', async () => {
      const googleUser = { ...mockUser, provider: AuthProvidersEnum.google };
      usersService.findByPhone.mockResolvedValue(googleUser);
      i18n.t.mockReturnValue('Need login via provider');

      await expect(service.requestPasswordResetOtp(phone)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.needLoginViaProvider', {
        args: { provider: AuthProvidersEnum.google },
      });
      expect(otpService.checkDailyLimit).not.toHaveBeenCalled();
    });

    it('should respect rate limiting', async () => {
      usersService.findByPhone.mockResolvedValue(mockUser);
      otpService.checkDailyLimit.mockResolvedValue(undefined);
      otpService.checkRateLimit.mockRejectedValue(new Error('Rate limited'));

      await expect(service.requestPasswordResetOtp(phone)).rejects.toThrow(
        'Rate limited',
      );
      expect(otpService.createOtpRecord).not.toHaveBeenCalled();
    });

    it('should respect daily limit', async () => {
      usersService.findByPhone.mockResolvedValue(mockUser);
      otpService.checkDailyLimit.mockRejectedValue(
        new Error('Daily limit exceeded'),
      );

      await expect(service.requestPasswordResetOtp(phone)).rejects.toThrow(
        'Daily limit exceeded',
      );
      expect(otpService.checkRateLimit).not.toHaveBeenCalled();
    });
  });

  describe('verifyPasswordResetOtp', () => {
    const phone = '0901234567';
    const otp = '123456';

    it('should verify OTP and return reset token', async () => {
      otpService.validateOtp.mockResolvedValue(mockOtpRecord as any);
      usersService.findByPhone.mockResolvedValue(mockUser);
      otpService.generateResetToken.mockReturnValue('reset-token-123');
      otpService.storeResetToken.mockResolvedValue(undefined);

      const result = await service.verifyPasswordResetOtp(phone, otp);

      expect(result).toEqual({ resetToken: 'reset-token-123' });
      expect(otpService.validateOtp).toHaveBeenCalledWith(phone, otp);
      expect(usersService.findByPhone).toHaveBeenCalledWith(phone);
      expect(otpService.generateResetToken).toHaveBeenCalled();
      expect(otpService.storeResetToken).toHaveBeenCalledWith(
        phone,
        'reset-token-123',
      );
    });

    it('should throw exception when user not found', async () => {
      otpService.validateOtp.mockResolvedValue(mockOtpRecord as any);
      usersService.findByPhone.mockResolvedValue(null);
      i18n.t.mockReturnValue('User not found');

      await expect(
        service.verifyPasswordResetOtp(phone, otp),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.userNotFound');
      expect(otpService.generateResetToken).not.toHaveBeenCalled();
    });

    it('should throw exception when OTP is invalid', async () => {
      otpService.validateOtp.mockRejectedValue(new Error('Invalid OTP'));

      await expect(service.verifyPasswordResetOtp(phone, otp)).rejects.toThrow(
        'Invalid OTP',
      );
      expect(usersService.findByPhone).not.toHaveBeenCalled();
    });
  });

  describe('completePasswordReset', () => {
    const phone = '0901234567';
    const resetToken = 'reset-token-123';
    const newPassword = 'NewPassword123!';

    it('should complete password reset successfully', async () => {
      otpService.validateResetToken.mockResolvedValue(mockOtpRecord as any);
      usersService.findByPhone.mockResolvedValue(mockUser);
      sessionService.deleteByUserId.mockResolvedValue(undefined);
      usersService.update.mockResolvedValue(mockUser);
      otpService.deleteOtpsByPhone.mockResolvedValue(undefined);

      await service.completePasswordReset(phone, resetToken, newPassword);

      expect(otpService.validateResetToken).toHaveBeenCalledWith(
        phone,
        resetToken,
      );
      expect(usersService.findByPhone).toHaveBeenCalledWith(phone);
      expect(sessionService.deleteByUserId).toHaveBeenCalledWith({
        userId: 'user-123',
      });
      expect(usersService.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          password: newPassword,
        }),
      );
      expect(otpService.deleteOtpsByPhone).toHaveBeenCalledWith(phone);
    });

    it('should throw exception when reset token is invalid', async () => {
      otpService.validateResetToken.mockRejectedValue(
        new Error('Invalid reset token'),
      );

      await expect(
        service.completePasswordReset(phone, resetToken, newPassword),
      ).rejects.toThrow('Invalid reset token');
      expect(usersService.findByPhone).not.toHaveBeenCalled();
    });

    it('should throw exception when user not found', async () => {
      otpService.validateResetToken.mockResolvedValue(mockOtpRecord as any);
      usersService.findByPhone.mockResolvedValue(null);
      i18n.t.mockReturnValue('User not found');

      await expect(
        service.completePasswordReset(phone, resetToken, newPassword),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.userNotFound');
      expect(sessionService.deleteByUserId).not.toHaveBeenCalled();
    });

    it('should delete all user sessions on password reset', async () => {
      otpService.validateResetToken.mockResolvedValue(mockOtpRecord as any);
      usersService.findByPhone.mockResolvedValue(mockUser);
      sessionService.deleteByUserId.mockResolvedValue(undefined);
      usersService.update.mockResolvedValue(mockUser);
      otpService.deleteOtpsByPhone.mockResolvedValue(undefined);

      await service.completePasswordReset(phone, resetToken, newPassword);

      expect(sessionService.deleteByUserId).toHaveBeenCalledWith({
        userId: 'user-123',
      });
    });

    it('should delete used OTP after password reset', async () => {
      otpService.validateResetToken.mockResolvedValue(mockOtpRecord as any);
      usersService.findByPhone.mockResolvedValue(mockUser);
      sessionService.deleteByUserId.mockResolvedValue(undefined);
      usersService.update.mockResolvedValue(mockUser);
      otpService.deleteOtpsByPhone.mockResolvedValue(undefined);

      await service.completePasswordReset(phone, resetToken, newPassword);

      expect(otpService.deleteOtpsByPhone).toHaveBeenCalledWith(phone);
    });
  });
});
