import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { EmailAuthService } from '../../src/auth/services/email-auth.service';
import { PhoneAuthService } from '../../src/auth/services/phone-auth.service';
import { SocialAuthService } from '../../src/auth/services/social-auth.service';
import { ProfileService } from '../../src/auth/services/profile.service';
import { AccountService } from '../../src/auth/services/account.service';
import { TokenService } from '../../src/auth/services/token.service';
import { OtpDeliveryMethod } from '../../src/auth/dto/auth-phone-register.dto';
import { User } from '../../src/users/domain/user';
import { StatusEnum } from '../../src/statuses/statuses.enum';

describe('AuthService', () => {
  let service: AuthService;
  let emailAuthService: jest.Mocked<EmailAuthService>;
  let phoneAuthService: jest.Mocked<PhoneAuthService>;
  let socialAuthService: jest.Mocked<SocialAuthService>;
  let profileService: jest.Mocked<ProfileService>;
  let accountService: jest.Mocked<AccountService>;
  let tokenService: jest.Mocked<TokenService>;

  const mockLoginResponse = {
    token: 'jwt-token',
    refreshToken: 'refresh-token',
    tokenExpires: 3600,
    user: {
      id: 'user-123',
      email: 'test@example.com',
    } as User,
  };

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    phone: '0901234567',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashed-password',
    provider: 'email',
    socialId: null,
    socialAccounts: [],
    status: StatusEnum.active,
    photo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  } as User;

  beforeEach(async () => {
    const mockEmailAuthService = {
      validateLogin: jest.fn(),
      register: jest.fn(),
      confirmEmail: jest.fn(),
      confirmNewEmail: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    };

    const mockPhoneAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      verifyOtp: jest.fn(),
      requestPasswordResetOtp: jest.fn(),
      verifyPasswordResetOtp: jest.fn(),
      completePasswordReset: jest.fn(),
    };

    const mockSocialAuthService = {
      validateSocialLogin: jest.fn(),
    };

    const mockProfileService = {
      me: jest.fn(),
      update: jest.fn(),
    };

    const mockAccountService = {
      softDelete: jest.fn(),
      logout: jest.fn(),
    };

    const mockTokenService = {
      refreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: EmailAuthService, useValue: mockEmailAuthService },
        { provide: PhoneAuthService, useValue: mockPhoneAuthService },
        { provide: SocialAuthService, useValue: mockSocialAuthService },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: AccountService, useValue: mockAccountService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    emailAuthService = module.get(EmailAuthService);
    phoneAuthService = module.get(PhoneAuthService);
    socialAuthService = module.get(SocialAuthService);
    profileService = module.get(ProfileService);
    accountService = module.get(AccountService);
    tokenService = module.get(TokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Email Authentication Methods', () => {
    describe('validateLogin', () => {
      it('should delegate to emailAuthService.validateLogin', async () => {
        const loginDto = {
          email: 'test@example.com',
          password: 'Password123!',
        };
        emailAuthService.validateLogin.mockResolvedValue(mockLoginResponse);

        const result = await service.validateLogin(loginDto);

        expect(result).toEqual(mockLoginResponse);
        expect(emailAuthService.validateLogin).toHaveBeenCalledWith(loginDto);
        expect(emailAuthService.validateLogin).toHaveBeenCalledTimes(1);
      });
    });

    describe('register', () => {
      it('should delegate to emailAuthService.register', async () => {
        const registerDto = {
          email: 'newuser@example.com',
          password: 'Password123!',
          firstName: 'New',
          lastName: 'User',
        };
        emailAuthService.register.mockResolvedValue(undefined);

        await service.register(registerDto);

        expect(emailAuthService.register).toHaveBeenCalledWith(registerDto);
        expect(emailAuthService.register).toHaveBeenCalledTimes(1);
      });
    });

    describe('confirmEmail', () => {
      it('should delegate to emailAuthService.confirmEmail', async () => {
        const hash = 'confirmation-hash-123';
        emailAuthService.confirmEmail.mockResolvedValue(undefined);

        await service.confirmEmail(hash);

        expect(emailAuthService.confirmEmail).toHaveBeenCalledWith(hash);
        expect(emailAuthService.confirmEmail).toHaveBeenCalledTimes(1);
      });
    });

    describe('confirmNewEmail', () => {
      it('should delegate to emailAuthService.confirmNewEmail', async () => {
        const hash = 'new-email-hash-456';
        emailAuthService.confirmNewEmail.mockResolvedValue(undefined);

        await service.confirmNewEmail(hash);

        expect(emailAuthService.confirmNewEmail).toHaveBeenCalledWith(hash);
        expect(emailAuthService.confirmNewEmail).toHaveBeenCalledTimes(1);
      });
    });

    describe('emailForgotPassword', () => {
      it('should delegate to emailAuthService.forgotPassword', async () => {
        const email = 'forgot@example.com';
        emailAuthService.forgotPassword.mockResolvedValue(undefined);

        await service.emailForgotPassword(email);

        expect(emailAuthService.forgotPassword).toHaveBeenCalledWith(email);
        expect(emailAuthService.forgotPassword).toHaveBeenCalledTimes(1);
      });
    });

    describe('emailResetPassword', () => {
      it('should delegate to emailAuthService.resetPassword', async () => {
        const hash = 'reset-hash-789';
        const password = 'NewPassword123!';
        emailAuthService.resetPassword.mockResolvedValue(undefined);

        await service.emailResetPassword(hash, password);

        expect(emailAuthService.resetPassword).toHaveBeenCalledWith(
          hash,
          password,
        );
        expect(emailAuthService.resetPassword).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Phone Authentication Methods', () => {
    describe('phoneRegister', () => {
      it('should delegate to phoneAuthService.register', async () => {
        const registerDto = {
          phone: '0901234567',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User',
          otp: '123456',
          otpMethod: OtpDeliveryMethod.ZNS,
        };
        phoneAuthService.register.mockResolvedValue(undefined);

        await service.phoneRegister(registerDto);

        expect(phoneAuthService.register).toHaveBeenCalledWith(registerDto);
        expect(phoneAuthService.register).toHaveBeenCalledTimes(1);
      });
    });

    describe('phoneLogin', () => {
      it('should delegate to phoneAuthService.login', async () => {
        const loginDto = {
          phone: '0901234567',
          password: 'Password123!',
        };
        phoneAuthService.login.mockResolvedValue(mockLoginResponse);

        const result = await service.phoneLogin(loginDto);

        expect(result).toEqual(mockLoginResponse);
        expect(phoneAuthService.login).toHaveBeenCalledWith(loginDto);
        expect(phoneAuthService.login).toHaveBeenCalledTimes(1);
      });
    });

    describe('verifyPhoneOtp', () => {
      it('should delegate to phoneAuthService.verifyOtp', async () => {
        const verifyDto = {
          phone: '0901234567',
          otp: '123456',
        };
        phoneAuthService.verifyOtp.mockResolvedValue(mockLoginResponse);

        const result = await service.verifyPhoneOtp(verifyDto);

        expect(result).toEqual(mockLoginResponse);
        expect(phoneAuthService.verifyOtp).toHaveBeenCalledWith(verifyDto);
        expect(phoneAuthService.verifyOtp).toHaveBeenCalledTimes(1);
      });
    });

    describe('phoneRequestPasswordResetOtp', () => {
      it('should delegate to phoneAuthService.requestPasswordResetOtp', async () => {
        const phone = '0901234567';
        const otpMethod = OtpDeliveryMethod.ZNS;
        phoneAuthService.requestPasswordResetOtp.mockResolvedValue(undefined);

        await service.phoneRequestPasswordResetOtp(phone, otpMethod);

        expect(phoneAuthService.requestPasswordResetOtp).toHaveBeenCalledWith(
          phone,
          otpMethod,
        );
        expect(phoneAuthService.requestPasswordResetOtp).toHaveBeenCalledTimes(
          1,
        );
      });

      it('should delegate without otpMethod parameter', async () => {
        const phone = '0901234567';
        phoneAuthService.requestPasswordResetOtp.mockResolvedValue(undefined);

        await service.phoneRequestPasswordResetOtp(phone);

        expect(phoneAuthService.requestPasswordResetOtp).toHaveBeenCalledWith(
          phone,
          undefined,
        );
      });
    });

    describe('phoneVerifyPasswordResetOtp', () => {
      it('should delegate to phoneAuthService.verifyPasswordResetOtp', async () => {
        const phone = '0901234567';
        const otp = '123456';
        const resetTokenResponse = { resetToken: 'reset-token-123' };
        phoneAuthService.verifyPasswordResetOtp.mockResolvedValue(
          resetTokenResponse,
        );

        const result = await service.phoneVerifyPasswordResetOtp(phone, otp);

        expect(result).toEqual(resetTokenResponse);
        expect(phoneAuthService.verifyPasswordResetOtp).toHaveBeenCalledWith(
          phone,
          otp,
        );
        expect(phoneAuthService.verifyPasswordResetOtp).toHaveBeenCalledTimes(
          1,
        );
      });
    });

    describe('phoneCompletePasswordReset', () => {
      it('should delegate to phoneAuthService.completePasswordReset', async () => {
        const phone = '0901234567';
        const resetToken = 'reset-token-123';
        const password = 'NewPassword123!';
        phoneAuthService.completePasswordReset.mockResolvedValue(undefined);

        await service.phoneCompletePasswordReset(phone, resetToken, password);

        expect(phoneAuthService.completePasswordReset).toHaveBeenCalledWith(
          phone,
          resetToken,
          password,
        );
        expect(phoneAuthService.completePasswordReset).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Social Authentication Methods', () => {
    describe('validateSocialLogin', () => {
      it('should delegate to socialAuthService.validateSocialLogin', async () => {
        const authProvider = 'google';
        const socialData = {
          id: 'google-123',
          email: 'social@example.com',
          firstName: 'Social',
          lastName: 'User',
        };
        socialAuthService.validateSocialLogin.mockResolvedValue(
          mockLoginResponse,
        );

        const result = await service.validateSocialLogin(
          authProvider,
          socialData,
        );

        expect(result).toEqual(mockLoginResponse);
        expect(socialAuthService.validateSocialLogin).toHaveBeenCalledWith(
          authProvider,
          socialData,
        );
        expect(socialAuthService.validateSocialLogin).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Profile Methods', () => {
    describe('me', () => {
      it('should delegate to profileService.me', async () => {
        const jwtPayload = {
          id: 'user-123',
          role: { id: 'role-1' },
          sessionId: 'session-123',
          iat: 1234567890,
          exp: 1234567890,
        };
        profileService.me.mockResolvedValue(mockUser);

        const result = await service.me(jwtPayload);

        expect(result).toEqual(mockUser);
        expect(profileService.me).toHaveBeenCalledWith(jwtPayload);
        expect(profileService.me).toHaveBeenCalledTimes(1);
      });
    });

    describe('update', () => {
      it('should delegate to profileService.update', async () => {
        const jwtPayload = {
          id: 'user-123',
          role: { id: 'role-1' },
          sessionId: 'session-123',
          iat: 1234567890,
          exp: 1234567890,
        };
        const updateDto = {
          firstName: 'Updated',
          lastName: 'Name',
        };
        const updatedUser = { ...mockUser, ...updateDto };
        profileService.update.mockResolvedValue(updatedUser);

        const result = await service.update(jwtPayload, updateDto);

        expect(result).toEqual(updatedUser);
        expect(profileService.update).toHaveBeenCalledWith(
          jwtPayload,
          updateDto,
        );
        expect(profileService.update).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Account Methods', () => {
    describe('softDelete', () => {
      it('should delegate to accountService.softDelete', async () => {
        accountService.softDelete.mockResolvedValue(undefined);

        await service.softDelete(mockUser);

        expect(accountService.softDelete).toHaveBeenCalledWith(mockUser);
        expect(accountService.softDelete).toHaveBeenCalledTimes(1);
      });
    });

    describe('logout', () => {
      it('should delegate to accountService.logout', async () => {
        const logoutData = { sessionId: 'session-123' };
        accountService.logout.mockResolvedValue(undefined);

        await service.logout(logoutData);

        expect(accountService.logout).toHaveBeenCalledWith(logoutData);
        expect(accountService.logout).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Token Methods', () => {
    describe('refreshToken', () => {
      it('should delegate to tokenService.refreshToken', async () => {
        const refreshData = {
          sessionId: 'session-123',
          hash: 'refresh-hash',
        };
        const tokenResponse = {
          token: 'new-jwt-token',
          refreshToken: 'new-refresh-token',
          tokenExpires: 3600,
        };
        tokenService.refreshToken.mockResolvedValue(tokenResponse);

        const result = await service.refreshToken(refreshData);

        expect(result).toEqual(tokenResponse);
        expect(tokenService.refreshToken).toHaveBeenCalledWith(refreshData);
        expect(tokenService.refreshToken).toHaveBeenCalledTimes(1);
      });
    });
  });
});
