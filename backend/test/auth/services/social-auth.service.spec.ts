import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { SocialAuthService } from '../../../src/auth/services/social-auth.service';
import { UsersService } from '../../../src/users/users.service';
import { SessionService } from '../../../src/session/session.service';
import { TokenService } from '../../../src/auth/services/token.service';
import { SocialInterface } from '../../../src/social/interfaces/social.interface';
import { StatusEnum } from '../../../src/statuses/statuses.enum';
import { AuthProvidersEnum } from '../../../src/auth/auth-providers.enum';
import { User } from '../../../src/users/domain/user';
import { Session } from '../../../src/session/domain/session';
import { SocialAccount } from '../../../src/users/domain/social-account';

describe('SocialAuthService', () => {
  let service: SocialAuthService;
  let usersService: jest.Mocked<UsersService>;
  let sessionService: jest.Mocked<SessionService>;
  let tokenService: jest.Mocked<TokenService>;
  let i18n: jest.Mocked<I18nService>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    socialId: 'google-123',
    provider: AuthProvidersEnum.google,
    socialAvatarUrl: 'https://example.com/avatar.jpg',
    socialAccounts: [],
    status: StatusEnum.active,
    phone: null,
    password: undefined,
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

  const mockSocialData: SocialInterface = {
    id: 'google-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    picture: 'https://example.com/avatar.jpg',
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      findBySocialIdAndProvider: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockSessionService = {
      createForUser: jest.fn(),
    };

    const mockTokenService = {
      getTokensData: jest.fn(),
    };

    const mockI18nService = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialAuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: I18nService, useValue: mockI18nService },
      ],
    }).compile();

    service = module.get<SocialAuthService>(SocialAuthService);
    usersService = module.get(UsersService);
    sessionService = module.get(SessionService);
    tokenService = module.get(TokenService);
    i18n = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateSocialLogin', () => {
    it('should login existing user by social ID', async () => {
      const userWithSocialAccount = {
        ...mockUser,
        socialAccounts: [
          {
            provider: AuthProvidersEnum.google,
            socialId: 'google-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            avatarUrl: 'https://example.com/avatar.jpg',
            connectedAt: new Date(),
          },
        ],
      };
      usersService.findByEmail.mockResolvedValue(userWithSocialAccount);
      usersService.findBySocialIdAndProvider.mockResolvedValue(
        userWithSocialAccount,
      );
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);

      const result = await service.validateSocialLogin(
        AuthProvidersEnum.google,
        mockSocialData,
      );

      expect(result).toEqual({
        ...mockTokenData,
        user: userWithSocialAccount,
      });
      expect(usersService.findBySocialIdAndProvider).toHaveBeenCalledWith({
        socialId: 'google-123',
        provider: AuthProvidersEnum.google,
      });
      expect(sessionService.createForUser).toHaveBeenCalledWith(
        userWithSocialAccount,
      );
    });

    it('should create new user on first social login', async () => {
      const newUser = { ...mockUser, id: 'new-user-123' };
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findBySocialIdAndProvider.mockResolvedValue(null);
      usersService.create.mockResolvedValue(newUser);
      usersService.findById.mockResolvedValue(newUser);
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);

      const result = await service.validateSocialLogin(
        AuthProvidersEnum.google,
        mockSocialData,
      );

      expect(result).toEqual({
        ...mockTokenData,
        user: newUser,
      });
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          socialId: 'google-123',
          socialAvatarUrl: 'https://example.com/avatar.jpg',
          provider: AuthProvidersEnum.google,
          status: StatusEnum.active,
          socialAccounts: expect.arrayContaining([
            expect.objectContaining({
              provider: AuthProvidersEnum.google,
              socialId: 'google-123',
              email: 'test@example.com',
            }),
          ]),
        }),
      );
      expect(usersService.findById).toHaveBeenCalledWith('new-user-123');
    });

    it('should add social account to existing user found by email', async () => {
      const userByEmail = {
        ...mockUser,
        socialId: null,
        provider: AuthProvidersEnum.email,
        socialAccounts: [],
      };
      usersService.findByEmail.mockResolvedValue(userByEmail);
      usersService.findBySocialIdAndProvider.mockResolvedValue(null);
      usersService.update.mockResolvedValue(userByEmail);
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);

      const result = await service.validateSocialLogin(
        AuthProvidersEnum.google,
        mockSocialData,
      );

      expect(result).toEqual({
        ...mockTokenData,
        user: userByEmail,
      });
      expect(usersService.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          socialAccounts: expect.arrayContaining([
            expect.objectContaining({
              provider: AuthProvidersEnum.google,
              socialId: 'google-123',
            }),
          ]),
        }),
      );
    });

    it('should update user email when social login has email but user does not', async () => {
      const userWithoutEmail = {
        ...mockUser,
        email: null,
        socialAccounts: [
          {
            provider: AuthProvidersEnum.google,
            socialId: 'google-123',
            email: null,
            firstName: 'Test',
            lastName: 'User',
            avatarUrl: 'https://example.com/avatar.jpg',
            connectedAt: new Date(),
          },
        ],
      };
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findBySocialIdAndProvider.mockResolvedValue(
        userWithoutEmail,
      );
      usersService.update.mockResolvedValue(userWithoutEmail);
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);

      await service.validateSocialLogin(
        AuthProvidersEnum.google,
        mockSocialData,
      );

      expect(usersService.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          email: 'test@example.com',
        }),
      );
    });

    it('should update social avatar URL when changed', async () => {
      const userWithOldAvatar = {
        ...mockUser,
        socialAvatarUrl: 'https://example.com/old-avatar.jpg',
        socialAccounts: [
          {
            provider: AuthProvidersEnum.google,
            socialId: 'google-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            avatarUrl: 'https://example.com/old-avatar.jpg',
            connectedAt: new Date(),
          },
        ],
      };
      usersService.findByEmail.mockResolvedValue(userWithOldAvatar);
      usersService.findBySocialIdAndProvider.mockResolvedValue(
        userWithOldAvatar,
      );
      usersService.update.mockResolvedValue(userWithOldAvatar);
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);

      await service.validateSocialLogin(
        AuthProvidersEnum.google,
        mockSocialData,
      );

      expect(usersService.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          socialAvatarUrl: 'https://example.com/avatar.jpg',
        }),
      );
    });

    it('should update social account when data has changed', async () => {
      const userWithOldSocialData = {
        ...mockUser,
        socialAccounts: [
          {
            provider: AuthProvidersEnum.google,
            socialId: 'google-123',
            email: 'old@example.com',
            firstName: 'Old',
            lastName: 'Name',
            avatarUrl: 'https://example.com/old.jpg',
            connectedAt: new Date(),
          },
        ],
      };
      usersService.findByEmail.mockResolvedValue(userWithOldSocialData);
      usersService.findBySocialIdAndProvider.mockResolvedValue(
        userWithOldSocialData,
      );
      usersService.update.mockResolvedValue(userWithOldSocialData);
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);

      await service.validateSocialLogin(
        AuthProvidersEnum.google,
        mockSocialData,
      );

      expect(usersService.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          socialAccounts: expect.arrayContaining([
            expect.objectContaining({
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              avatarUrl: 'https://example.com/avatar.jpg',
            }),
          ]),
        }),
      );
    });

    it('should not update user when no changes detected', async () => {
      const userWithSameData = {
        ...mockUser,
        email: 'test@example.com',
        socialAvatarUrl: 'https://example.com/avatar.jpg',
        socialAccounts: [
          {
            provider: AuthProvidersEnum.google,
            socialId: 'google-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            avatarUrl: 'https://example.com/avatar.jpg',
            connectedAt: new Date(),
          },
        ],
      };
      usersService.findByEmail.mockResolvedValue(userWithSameData);
      usersService.findBySocialIdAndProvider.mockResolvedValue(
        userWithSameData,
      );
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);

      await service.validateSocialLogin(
        AuthProvidersEnum.google,
        mockSocialData,
      );

      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('should throw exception when user not found', async () => {
      const socialDataWithoutId = {
        ...mockSocialData,
        id: '',
        email: 'nonexistent@example.com',
      };
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findBySocialIdAndProvider.mockResolvedValue(null);
      i18n.t.mockReturnValue('User not found');

      await expect(
        service.validateSocialLogin(
          AuthProvidersEnum.google,
          socialDataWithoutId,
        ),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.userNotFound');
    });

    it('should throw exception when user account is inactive', async () => {
      const inactiveUser = { ...mockUser, status: StatusEnum.inactive };
      usersService.findByEmail.mockResolvedValue(inactiveUser);
      usersService.findBySocialIdAndProvider.mockResolvedValue(inactiveUser);
      i18n.t.mockReturnValue('Account inactive');

      await expect(
        service.validateSocialLogin(AuthProvidersEnum.google, mockSocialData),
      ).rejects.toThrow();
      expect(i18n.t).toHaveBeenCalledWith('auth.accountInactive');
      expect(sessionService.createForUser).not.toHaveBeenCalled();
    });

    it('should handle social login without email', async () => {
      const socialDataWithoutEmail = { ...mockSocialData, email: undefined };
      const newUser = { ...mockUser, email: null };
      usersService.findBySocialIdAndProvider.mockResolvedValue(null);
      usersService.create.mockResolvedValue(newUser);
      usersService.findById.mockResolvedValue(newUser);
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);

      await service.validateSocialLogin(
        AuthProvidersEnum.google,
        socialDataWithoutEmail,
      );

      expect(usersService.findByEmail).not.toHaveBeenCalled();
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: null,
        }),
      );
    });

    it('should convert email to lowercase', async () => {
      const socialDataWithUppercaseEmail = {
        ...mockSocialData,
        email: 'TEST@EXAMPLE.COM',
      };
      const newUser = { ...mockUser, email: 'test@example.com' };
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findBySocialIdAndProvider.mockResolvedValue(null);
      usersService.create.mockResolvedValue(newUser);
      usersService.findById.mockResolvedValue(newUser);
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);

      await service.validateSocialLogin(
        AuthProvidersEnum.google,
        socialDataWithUppercaseEmail,
      );

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
        }),
      );
    });

    it('should handle Facebook provider', async () => {
      const facebookData: SocialInterface = {
        id: 'facebook-456',
        email: 'facebook@example.com',
        firstName: 'Facebook',
        lastName: 'User',
        picture: 'https://facebook.com/avatar.jpg',
      };
      const newUser = {
        ...mockUser,
        provider: AuthProvidersEnum.facebook,
        socialId: 'facebook-456',
      };
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findBySocialIdAndProvider.mockResolvedValue(null);
      usersService.create.mockResolvedValue(newUser);
      usersService.findById.mockResolvedValue(newUser);
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);

      await service.validateSocialLogin(
        AuthProvidersEnum.facebook,
        facebookData,
      );

      expect(usersService.findBySocialIdAndProvider).toHaveBeenCalledWith({
        socialId: 'facebook-456',
        provider: AuthProvidersEnum.facebook,
      });
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: AuthProvidersEnum.facebook,
          socialId: 'facebook-456',
        }),
      );
    });

    it('should handle Apple provider', async () => {
      const appleData: SocialInterface = {
        id: 'apple-789',
        email: 'apple@example.com',
        firstName: 'Apple',
        lastName: 'User',
        picture: undefined,
      };
      const newUser = {
        ...mockUser,
        provider: AuthProvidersEnum.apple,
        socialId: 'apple-789',
        socialAvatarUrl: null,
      };
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findBySocialIdAndProvider.mockResolvedValue(null);
      usersService.create.mockResolvedValue(newUser);
      usersService.findById.mockResolvedValue(newUser);
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);

      await service.validateSocialLogin(AuthProvidersEnum.apple, appleData);

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: AuthProvidersEnum.apple,
          socialId: 'apple-789',
          socialAvatarUrl: null,
        }),
      );
    });

    it('should add multiple social accounts to the same user', async () => {
      const userWithGoogleAccount = {
        ...mockUser,
        socialAccounts: [
          {
            provider: AuthProvidersEnum.google,
            socialId: 'google-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            avatarUrl: 'https://google.com/avatar.jpg',
            connectedAt: new Date(),
          },
        ],
      };
      const facebookData: SocialInterface = {
        id: 'facebook-456',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        picture: 'https://facebook.com/avatar.jpg',
      };
      usersService.findByEmail.mockResolvedValue(userWithGoogleAccount);
      usersService.findBySocialIdAndProvider.mockResolvedValue(null);
      usersService.update.mockResolvedValue(userWithGoogleAccount);
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);

      await service.validateSocialLogin(
        AuthProvidersEnum.facebook,
        facebookData,
      );

      expect(usersService.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          socialAccounts: expect.arrayContaining([
            expect.objectContaining({
              provider: AuthProvidersEnum.google,
              socialId: 'google-123',
            }),
            expect.objectContaining({
              provider: AuthProvidersEnum.facebook,
              socialId: 'facebook-456',
            }),
          ]),
        }),
      );
    });

    it('should handle missing optional fields in social data', async () => {
      const minimalSocialData: SocialInterface = {
        id: 'google-999',
        email: undefined,
        firstName: undefined,
        lastName: undefined,
        picture: undefined,
      };
      const newUser = {
        ...mockUser,
        email: null,
        firstName: null,
        lastName: null,
        socialAvatarUrl: null,
      };
      usersService.findBySocialIdAndProvider.mockResolvedValue(null);
      usersService.create.mockResolvedValue(newUser);
      usersService.findById.mockResolvedValue(newUser);
      sessionService.createForUser.mockResolvedValue(mockSession);
      tokenService.getTokensData.mockResolvedValue(mockTokenData);

      await service.validateSocialLogin(
        AuthProvidersEnum.google,
        minimalSocialData,
      );

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: null,
          firstName: null,
          lastName: null,
          socialAvatarUrl: null,
        }),
      );
    });
  });
});
