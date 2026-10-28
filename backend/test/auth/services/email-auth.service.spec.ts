import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import bcrypt from 'bcryptjs';
import { EmailAuthService } from '../../../src/auth/services/email-auth.service';
import { UsersService } from '../../../src/users/users.service';
import { MailService } from '../../../src/mail/mail.service';
import { SessionService } from '../../../src/session/session.service';
import { TokenService } from '../../../src/auth/services/token.service';
import { AuthEmailLoginDto } from '../../../src/auth/dto/auth-email-login.dto';
import { AuthRegisterLoginDto } from '../../../src/auth/dto/auth-register-login.dto';
import { StatusEnum } from '../../../src/statuses/statuses.enum';
import { AuthProvidersEnum } from '../../../src/auth/auth-providers.enum';
import { User } from '../../../src/users/domain/user';
import { Session } from '../../../src/session/domain/session';

jest.mock('bcryptjs');

describe('EmailAuthService', () => {
  let service: EmailAuthService;
  let jwtService: jest.Mocked<JwtService>;
  let usersService: jest.Mocked<UsersService>;
  let sessionService: jest.Mocked<SessionService>;
  let mailService: jest.Mocked<MailService>;
  let tokenService: jest.Mocked<TokenService>;
  let configService: jest.Mocked<ConfigService>;
  let i18n: jest.Mocked<I18nService>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashed-password',
    provider: AuthProvidersEnum.email,
    status: StatusEnum.active,
    phone: null,
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

  beforeEach(async () => {
    const mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const mockUsersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockSessionService = {
      createForUser: jest.fn(),
      deleteByUserId: jest.fn(),
    };

    const mockMailService = {
      userSignUp: jest.fn(),
      forgotPassword: jest.fn(),
    };

    const mockTokenService = {
      getTokensData: jest.fn(),
    };

    const mockConfigService = {
      getOrThrow: jest.fn((key: string) => {
        const config: Record<string, any> = {
          'auth.confirmEmailSecret': 'confirm-secret',
          'auth.confirmEmailExpires': '1d',
          'auth.forgotSecret': 'forgot-secret',
          'auth.forgotExpires': '1h',
        };
        return config[key];
      }),
    };

    const mockI18nService = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailAuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: MailService, useValue: mockMailService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: I18nService, useValue: mockI18nService },
      ],
    }).compile();

    service = module.get<EmailAuthService>(EmailAuthService);
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);
    sessionService = module.get(SessionService);
    mailService = module.get(MailService);
    tokenService = module.get(TokenService);
    configService = module.get(ConfigService);
    i18n = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateLogin', () => {
    const loginDto: AuthEmailLoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login successfully with valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);

      const result = await service.validateLogin(loginDto);

      expect(result).toEqual({
        ...mockTokenData,
        user: mockUser,
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
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

    it('should throw exception when email not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      i18n.t.mockReturnValue('Email not found');

      await expect(service.validateLogin(loginDto)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.emailNotFound');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw exception when user provider is not email', async () => {
      const googleUser = { ...mockUser, provider: AuthProvidersEnum.google };
      usersService.findByEmail.mockResolvedValue(googleUser);
      i18n.t.mockReturnValue('Need login via provider');

      await expect(service.validateLogin(loginDto)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.needLoginViaProvider', {
        args: { provider: AuthProvidersEnum.google },
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw exception when user has no password', async () => {
      const userWithoutPassword = { ...mockUser, password: undefined };
      usersService.findByEmail.mockResolvedValue(userWithoutPassword);
      i18n.t.mockReturnValue('Incorrect password');

      await expect(service.validateLogin(loginDto)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.incorrectPassword');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw exception when user account is inactive', async () => {
      const inactiveUser = { ...mockUser, status: StatusEnum.inactive };
      usersService.findByEmail.mockResolvedValue(inactiveUser);
      i18n.t.mockReturnValue('Account inactive');

      await expect(service.validateLogin(loginDto)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.accountInactive');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw exception when password is incorrect', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      i18n.t.mockReturnValue('Incorrect password');

      await expect(service.validateLogin(loginDto)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.incorrectPassword');
      expect(sessionService.createForUser).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const registerDto: AuthRegisterLoginDto = {
      email: 'newuser@example.com',
      password: 'Password123!',
      firstName: 'New',
      lastName: 'User',
    };

    it('should register new user and send confirmation email', async () => {
      const newUser = {
        ...mockUser,
        id: 'new-user-123',
        email: 'newuser@example.com',
        status: StatusEnum.inactive,
      };
      usersService.create.mockResolvedValue(newUser);
      jwtService.signAsync.mockResolvedValue('confirmation-hash');
      mailService.userSignUp.mockResolvedValue(undefined);

      await service.register(registerDto);

      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        email: 'newuser@example.com',
        status: StatusEnum.inactive,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { confirmEmailUserId: 'new-user-123' },
        {
          secret: 'confirm-secret',
          expiresIn: '1d',
        },
      );
      expect(mailService.userSignUp).toHaveBeenCalledWith({
        to: 'newuser@example.com',
        data: {
          hash: 'confirmation-hash',
        },
      });
    });

    it('should use config values for JWT secret and expiration', async () => {
      const newUser = { ...mockUser, status: StatusEnum.inactive };
      usersService.create.mockResolvedValue(newUser);
      jwtService.signAsync.mockResolvedValue('hash');
      mailService.userSignUp.mockResolvedValue(undefined);

      await service.register(registerDto);

      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'auth.confirmEmailSecret',
        { infer: true },
      );
      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'auth.confirmEmailExpires',
        { infer: true },
      );
    });
  });

  describe('confirmEmail', () => {
    const confirmationHash = 'valid-confirmation-hash';

    it('should confirm email and activate user', async () => {
      const inactiveUser = { ...mockUser, status: StatusEnum.inactive };
      jwtService.verifyAsync.mockResolvedValue({
        confirmEmailUserId: 'user-123',
      });
      usersService.findById.mockResolvedValue(inactiveUser);
      usersService.update.mockResolvedValue(mockUser);

      await service.confirmEmail(confirmationHash);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(confirmationHash, {
        secret: 'confirm-secret',
      });
      expect(usersService.findById).toHaveBeenCalledWith('user-123');
      expect(usersService.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          status: StatusEnum.active,
        }),
      );
    });

    it('should throw exception when hash is invalid', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
      i18n.t.mockReturnValue('Invalid hash');

      await expect(service.confirmEmail(confirmationHash)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.invalidHash');
      expect(usersService.findById).not.toHaveBeenCalled();
    });

    it('should throw exception when user not found', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        confirmEmailUserId: 'user-123',
      });
      usersService.findById.mockResolvedValue(null);
      i18n.t.mockReturnValue('User not found');

      await expect(service.confirmEmail(confirmationHash)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.userNotFound');
    });

    it('should throw exception when user is not inactive', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        confirmEmailUserId: 'user-123',
      });
      usersService.findById.mockResolvedValue(mockUser);
      i18n.t.mockReturnValue('User not found');

      await expect(service.confirmEmail(confirmationHash)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.userNotFound');
      expect(usersService.update).not.toHaveBeenCalled();
    });
  });

  describe('confirmNewEmail', () => {
    const confirmationHash = 'valid-new-email-hash';

    it('should confirm new email and update user', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        confirmEmailUserId: 'user-123',
        newEmail: 'newemail@example.com',
      });
      usersService.findById.mockResolvedValue(mockUser);
      usersService.update.mockResolvedValue(mockUser);

      await service.confirmNewEmail(confirmationHash);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(confirmationHash, {
        secret: 'confirm-secret',
      });
      expect(usersService.findById).toHaveBeenCalledWith('user-123');
      expect(usersService.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          email: 'newemail@example.com',
          status: StatusEnum.active,
        }),
      );
    });

    it('should throw exception when hash is invalid', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
      i18n.t.mockReturnValue('Invalid hash');

      await expect(service.confirmNewEmail(confirmationHash)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.invalidHash');
      expect(usersService.findById).not.toHaveBeenCalled();
    });

    it('should throw exception when user not found', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        confirmEmailUserId: 'user-123',
        newEmail: 'newemail@example.com',
      });
      usersService.findById.mockResolvedValue(null);
      i18n.t.mockReturnValue('User not found');

      await expect(service.confirmNewEmail(confirmationHash)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.userNotFound');
      expect(usersService.update).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    const email = 'test@example.com';

    it('should send forgot password email', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('reset-hash');
      mailService.forgotPassword.mockResolvedValue(undefined);

      await service.forgotPassword(email);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { forgotUserId: 'user-123' },
        {
          secret: 'forgot-secret',
          expiresIn: '1h',
        },
      );
      expect(mailService.forgotPassword).toHaveBeenCalledWith({
        to: email,
        data: {
          hash: 'reset-hash',
          tokenExpires: expect.any(Number),
        },
      });
    });

    it('should throw exception when email not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      i18n.t.mockReturnValue('Email not exists');

      await expect(service.forgotPassword(email)).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.emailNotExists');
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should calculate correct token expiration', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('reset-hash');
      mailService.forgotPassword.mockResolvedValue(undefined);

      const beforeCall = Date.now();
      await service.forgotPassword(email);
      const afterCall = Date.now();

      const mailCall = mailService.forgotPassword.mock.calls[0][0];
      const tokenExpires = mailCall.data.tokenExpires;

      // Token expires should be ~1 hour (3600000 ms) from now
      expect(tokenExpires).toBeGreaterThan(beforeCall + 3590000);
      expect(tokenExpires).toBeLessThan(afterCall + 3610000);
    });

    it('should use config values for JWT secret and expiration', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('hash');
      mailService.forgotPassword.mockResolvedValue(undefined);

      await service.forgotPassword(email);

      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'auth.forgotSecret',
        {
          infer: true,
        },
      );
      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'auth.forgotExpires',
        {
          infer: true,
        },
      );
    });
  });

  describe('resetPassword', () => {
    const resetHash = 'valid-reset-hash';
    const newPassword = 'NewPassword123!';

    it('should reset password and delete all sessions', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        forgotUserId: 'user-123',
      });
      usersService.findById.mockResolvedValue(mockUser);
      sessionService.deleteByUserId.mockResolvedValue(undefined);
      usersService.update.mockResolvedValue(mockUser);

      await service.resetPassword(resetHash, newPassword);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(resetHash, {
        secret: 'forgot-secret',
      });
      expect(usersService.findById).toHaveBeenCalledWith('user-123');
      expect(sessionService.deleteByUserId).toHaveBeenCalledWith({
        userId: 'user-123',
      });
      expect(usersService.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          password: newPassword,
        }),
      );
    });

    it('should throw exception when hash is invalid', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
      i18n.t.mockReturnValue('Invalid hash');

      await expect(
        service.resetPassword(resetHash, newPassword),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.invalidHash');
      expect(usersService.findById).not.toHaveBeenCalled();
    });

    it('should throw exception when user not found', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        forgotUserId: 'user-123',
      });
      usersService.findById.mockResolvedValue(null);
      i18n.t.mockReturnValue('Hash not found');

      await expect(
        service.resetPassword(resetHash, newPassword),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.hashNotFound');
      expect(sessionService.deleteByUserId).not.toHaveBeenCalled();
    });

    it('should delete sessions before updating password', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        forgotUserId: 'user-123',
      });
      usersService.findById.mockResolvedValue(mockUser);
      sessionService.deleteByUserId.mockResolvedValue(undefined);
      usersService.update.mockResolvedValue(mockUser);

      await service.resetPassword(resetHash, newPassword);

      expect(sessionService.deleteByUserId).toHaveBeenCalledWith({
        userId: 'user-123',
      });
    });
  });
});
