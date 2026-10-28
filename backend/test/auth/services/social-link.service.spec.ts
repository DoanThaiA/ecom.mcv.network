import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { SocialLinkService } from '../../../src/auth/services/social-link.service';
import { UsersService } from '../../../src/users/users.service';
import { User } from '../../../src/users/domain/user';
import { SocialAccount } from '../../../src/users/domain/social-account';
import { AuthProvidersEnum } from '../../../src/auth/auth-providers.enum';
import { StatusEnum } from '../../../src/statuses/statuses.enum';

describe('SocialLinkService', () => {
  let service: SocialLinkService;
  let usersService: jest.Mocked<UsersService>;
  let i18n: jest.Mocked<I18nService>;

  const mockSocialData = {
    id: 'google-123',
    email: 'test@gmail.com',
    firstName: 'Test',
    lastName: 'User',
    picture: 'https://example.com/avatar.jpg',
  };

  const mockSocialAccount: SocialAccount = {
    provider: AuthProvidersEnum.google,
    socialId: 'google-123',
    email: 'test@gmail.com',
    firstName: 'Test',
    lastName: 'User',
    avatarUrl: 'https://example.com/avatar.jpg',
    connectedAt: new Date(),
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
    const mockUsersService = {
      findById: jest.fn(),
      findBySocialAccountExcludingUser: jest.fn(),
      update: jest.fn(),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialLinkService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<SocialLinkService>(SocialLinkService);
    usersService = module.get(UsersService);
    i18n = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('linkSocialAccount', () => {
    it('should link social account to user successfully', async () => {
      const updatedUser = {
        ...mockUser,
        socialAccounts: [mockSocialAccount],
      };

      usersService.findById.mockResolvedValueOnce(mockUser);
      usersService.findBySocialAccountExcludingUser.mockResolvedValue(null);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById.mockResolvedValueOnce(updatedUser);

      const result = await service.linkSocialAccount(
        'user-123',
        AuthProvidersEnum.google,
        mockSocialData,
      );

      expect(result).toEqual(updatedUser);
      expect(usersService.findById).toHaveBeenCalledWith('user-123');
      expect(
        usersService.findBySocialAccountExcludingUser,
      ).toHaveBeenCalledWith({
        socialId: 'google-123',
        provider: AuthProvidersEnum.google,
        excludeUserId: 'user-123',
      });
      expect(usersService.update).toHaveBeenCalledWith('user-123', {
        socialAccounts: expect.arrayContaining([
          expect.objectContaining({
            provider: AuthProvidersEnum.google,
            socialId: 'google-123',
            email: 'test@gmail.com',
            firstName: 'Test',
            lastName: 'User',
            avatarUrl: 'https://example.com/avatar.jpg',
          }),
        ]),
      });
    });

    it('should throw error when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(
        service.linkSocialAccount(
          'non-existent',
          AuthProvidersEnum.google,
          mockSocialData,
        ),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.userNotFound');
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('should throw error when social account already linked to another user', async () => {
      const otherUser = { ...mockUser, id: 'other-user' };
      usersService.findById.mockResolvedValue(mockUser);
      usersService.findBySocialAccountExcludingUser.mockResolvedValue(
        otherUser,
      );

      await expect(
        service.linkSocialAccount(
          'user-123',
          AuthProvidersEnum.google,
          mockSocialData,
        ),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('social.socialAccountAlreadyLinked');
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('should throw error when social account already connected to current user', async () => {
      const userWithSocial = {
        ...mockUser,
        socialAccounts: [mockSocialAccount],
      };

      usersService.findById.mockResolvedValue(userWithSocial);
      usersService.findBySocialAccountExcludingUser.mockResolvedValue(null);

      await expect(
        service.linkSocialAccount(
          'user-123',
          AuthProvidersEnum.google,
          mockSocialData,
        ),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith(
        'social.socialAccountAlreadyConnected',
      );
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('should handle user with existing social accounts', async () => {
      const existingAccount: SocialAccount = {
        provider: AuthProvidersEnum.facebook,
        socialId: 'fb-123',
        email: 'fb@example.com',
        firstName: 'FB',
        lastName: 'User',
        avatarUrl: null,
        connectedAt: new Date(),
      };

      const userWithSocial = {
        ...mockUser,
        socialAccounts: [existingAccount],
      };

      const updatedUser = {
        ...mockUser,
        socialAccounts: [existingAccount, mockSocialAccount],
      };

      usersService.findById.mockResolvedValueOnce(userWithSocial);
      usersService.findBySocialAccountExcludingUser.mockResolvedValue(null);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById.mockResolvedValueOnce(updatedUser);

      const result = await service.linkSocialAccount(
        'user-123',
        AuthProvidersEnum.google,
        mockSocialData,
      );

      expect(result.socialAccounts).toHaveLength(2);
      expect(usersService.update).toHaveBeenCalledWith('user-123', {
        socialAccounts: expect.arrayContaining([
          existingAccount,
          expect.objectContaining({
            provider: AuthProvidersEnum.google,
          }),
        ]),
      });
    });

    it('should lowercase email when building social account', async () => {
      const socialDataUppercase = {
        ...mockSocialData,
        id: 'google-999',
        email: 'TEST@GMAIL.COM',
      };

      const userWithoutSocial = { ...mockUser, socialAccounts: [] };
      const updatedUser = { ...mockUser, socialAccounts: [mockSocialAccount] };

      usersService.findById.mockResolvedValueOnce(userWithoutSocial);
      usersService.findBySocialAccountExcludingUser.mockResolvedValue(null);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById.mockResolvedValueOnce(updatedUser);

      await service.linkSocialAccount(
        'user-123',
        AuthProvidersEnum.google,
        socialDataUppercase,
      );

      expect(usersService.update).toHaveBeenCalledWith('user-123', {
        socialAccounts: expect.arrayContaining([
          expect.objectContaining({
            email: 'test@gmail.com',
          }),
        ]),
      });
    });

    it('should handle social data with missing optional fields', async () => {
      const minimalSocialData = {
        id: 'google-456',
      };

      const updatedUser = { ...mockUser, socialAccounts: [] };

      usersService.findById.mockResolvedValueOnce(mockUser);
      usersService.findBySocialAccountExcludingUser.mockResolvedValue(null);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById.mockResolvedValueOnce(updatedUser);

      await service.linkSocialAccount(
        'user-123',
        AuthProvidersEnum.google,
        minimalSocialData,
      );

      expect(usersService.update).toHaveBeenCalledWith('user-123', {
        socialAccounts: expect.arrayContaining([
          expect.objectContaining({
            socialId: 'google-456',
            email: null,
            firstName: null,
            lastName: null,
            avatarUrl: null,
          }),
        ]),
      });
    });

    it('should throw error when user not found after update', async () => {
      const userWithoutSocial = { ...mockUser, socialAccounts: [] };
      const socialDataNew = { ...mockSocialData, id: 'google-new-123' };

      usersService.findById.mockResolvedValueOnce(userWithoutSocial);
      usersService.findBySocialAccountExcludingUser.mockResolvedValue(null);
      usersService.update.mockResolvedValue(mockUser);
      usersService.findById.mockResolvedValueOnce(null);

      await expect(
        service.linkSocialAccount(
          'user-123',
          AuthProvidersEnum.google,
          socialDataNew,
        ),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.userNotFound');
    });
  });

  describe('unlinkSocialAccount', () => {
    it('should unlink social account successfully when user has other auth methods', async () => {
      const userWithSocial = {
        ...mockUser,
        password: 'hashed-password',
        socialAccounts: [mockSocialAccount],
      };

      const updatedUser = {
        ...mockUser,
        socialAccounts: [],
      };

      usersService.findById.mockResolvedValueOnce(userWithSocial);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById.mockResolvedValueOnce(updatedUser);

      const result = await service.unlinkSocialAccount(
        'user-123',
        AuthProvidersEnum.google,
      );

      expect(result).toEqual(updatedUser);
      expect(usersService.update).toHaveBeenCalledWith('user-123', {
        socialAccounts: [],
      });
    });

    it('should throw error when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(
        service.unlinkSocialAccount('non-existent', AuthProvidersEnum.google),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.userNotFound');
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('should throw error when provider not linked', async () => {
      const userWithoutSocial = { ...mockUser, socialAccounts: [] };
      usersService.findById.mockResolvedValue(userWithoutSocial);

      await expect(
        service.unlinkSocialAccount('user-123', AuthProvidersEnum.google),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('social.providerNotLinked');
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('should throw error when trying to unlink primary social account', async () => {
      const userWithPrimarySocial = {
        ...mockUser,
        provider: 'google',
        socialId: 'google-123',
        password: 'hashed-password',
        socialAccounts: [mockSocialAccount],
      };

      usersService.findById.mockResolvedValue(userWithPrimarySocial);

      await expect(
        service.unlinkSocialAccount('user-123', AuthProvidersEnum.google),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('social.cannotUnlinkPrimaryAccount');
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('should throw error when trying to unlink last auth method', async () => {
      // User signed up with email (no password set yet), only has one linked social account
      const userWithOnlySocial = {
        ...mockUser,
        provider: 'email',
        socialId: null,
        password: undefined,
        email: undefined, // No email auth
        phone: undefined,
        socialAccounts: [mockSocialAccount], // Only 1 social account
      };

      usersService.findById.mockResolvedValue(userWithOnlySocial);

      await expect(
        service.unlinkSocialAccount('user-123', AuthProvidersEnum.google),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('social.cannotUnlinkLastAuthMethod');
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('should allow unlinking when user has password', async () => {
      const userWithPasswordAndSocial = {
        ...mockUser,
        password: 'hashed-password',
        socialAccounts: [mockSocialAccount],
      };

      const updatedUser = { ...mockUser, socialAccounts: [] };

      usersService.findById.mockResolvedValueOnce(userWithPasswordAndSocial);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById.mockResolvedValueOnce(updatedUser);

      const result = await service.unlinkSocialAccount(
        'user-123',
        AuthProvidersEnum.google,
      );

      expect(result).toEqual(updatedUser);
      expect(usersService.update).toHaveBeenCalled();
    });

    it('should allow unlinking when user has phone auth', async () => {
      const userWithPhoneAndSocial = {
        ...mockUser,
        provider: 'phone',
        password: undefined,
        phone: '0901234567',
        socialAccounts: [mockSocialAccount],
      };

      const updatedUser = { ...mockUser, socialAccounts: [] };

      usersService.findById.mockResolvedValueOnce(userWithPhoneAndSocial);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById.mockResolvedValueOnce(updatedUser);

      await service.unlinkSocialAccount('user-123', AuthProvidersEnum.google);

      expect(usersService.update).toHaveBeenCalled();
    });

    it('should allow unlinking when user has email auth', async () => {
      const userWithEmailAndSocial = {
        ...mockUser,
        provider: 'email',
        password: undefined,
        email: 'test@example.com',
        socialAccounts: [mockSocialAccount],
      };

      const updatedUser = { ...mockUser, socialAccounts: [] };

      usersService.findById.mockResolvedValueOnce(userWithEmailAndSocial);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById.mockResolvedValueOnce(updatedUser);

      await service.unlinkSocialAccount('user-123', AuthProvidersEnum.google);

      expect(usersService.update).toHaveBeenCalled();
    });

    it('should allow unlinking when user has other social accounts', async () => {
      const facebookAccount: SocialAccount = {
        provider: AuthProvidersEnum.facebook,
        socialId: 'fb-123',
        email: 'fb@example.com',
        firstName: 'FB',
        lastName: 'User',
        avatarUrl: null,
        connectedAt: new Date(),
      };

      const userWithMultipleSocial = {
        ...mockUser,
        password: undefined,
        email: undefined,
        phone: undefined,
        provider: 'google',
        socialId: 'google-primary',
        socialAccounts: [facebookAccount, mockSocialAccount],
      };

      const updatedUser = {
        ...mockUser,
        socialAccounts: [facebookAccount],
      };

      usersService.findById.mockResolvedValueOnce(userWithMultipleSocial);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById.mockResolvedValueOnce(updatedUser);

      await service.unlinkSocialAccount('user-123', AuthProvidersEnum.google);

      expect(usersService.update).toHaveBeenCalledWith('user-123', {
        socialAccounts: [facebookAccount],
      });
    });

    it('should preserve other social accounts when unlinking one', async () => {
      const facebookAccount: SocialAccount = {
        provider: AuthProvidersEnum.facebook,
        socialId: 'fb-123',
        email: 'fb@example.com',
        firstName: 'FB',
        lastName: 'User',
        avatarUrl: null,
        connectedAt: new Date(),
      };

      const userWithMultipleSocial = {
        ...mockUser,
        password: 'hashed-password',
        socialAccounts: [facebookAccount, mockSocialAccount],
      };

      usersService.findById.mockResolvedValueOnce(userWithMultipleSocial);
      usersService.update.mockResolvedValue(mockUser);
      usersService.findById.mockResolvedValueOnce(mockUser);

      await service.unlinkSocialAccount('user-123', AuthProvidersEnum.google);

      expect(usersService.update).toHaveBeenCalledWith('user-123', {
        socialAccounts: [facebookAccount],
      });
    });

    it('should throw error when user not found after update', async () => {
      const userWithSocial = {
        ...mockUser,
        password: 'hashed-password',
        socialAccounts: [mockSocialAccount],
      };

      usersService.findById.mockResolvedValueOnce(userWithSocial);
      usersService.update.mockResolvedValue(mockUser);
      usersService.findById.mockResolvedValueOnce(null);

      await expect(
        service.unlinkSocialAccount('user-123', AuthProvidersEnum.google),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.userNotFound');
    });
  });
});
