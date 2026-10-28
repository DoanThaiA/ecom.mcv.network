import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import bcrypt from 'bcryptjs';
import { ProfileService } from '../../../src/auth/services/profile.service';
import { UsersService } from '../../../src/users/users.service';
import { MailService } from '../../../src/mail/mail.service';
import { SessionService } from '../../../src/session/session.service';
import { User } from '../../../src/users/domain/user';
import { StatusEnum } from '../../../src/statuses/statuses.enum';

jest.mock('bcryptjs');

describe('ProfileService', () => {
  let service: ProfileService;
  let usersService: jest.Mocked<UsersService>;
  let mailService: jest.Mocked<MailService>;
  let sessionService: jest.Mocked<SessionService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let i18n: jest.Mocked<I18nService>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    phone: '0901234567',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashed-password',
    status: StatusEnum.active,
    photo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockJwtPayload = {
    id: 'user-123',
    role: { id: 'role-1' },
    sessionId: 'session-123',
    iat: 1234567890,
    exp: 1234567890,
  };

  beforeEach(async () => {
    const mockUsersService = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
    };

    const mockMailService = {
      confirmNewEmail: jest.fn().mockResolvedValue(undefined),
    };

    const mockSessionService = {
      deleteByUserIdWithExclude: jest.fn().mockResolvedValue(undefined),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const mockConfigService = {
      getOrThrow: jest.fn((key: string) => {
        if (key === 'auth.confirmEmailSecret') return 'secret';
        if (key === 'auth.confirmEmailExpires') return '1d';
        return 'mock-value';
      }),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: MailService, useValue: mockMailService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    usersService = module.get(UsersService);
    mailService = module.get(MailService);
    sessionService = module.get(SessionService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    i18n = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('me', () => {
    it('should return current user profile', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.me(mockJwtPayload);

      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith('user-123');
    });

    it('should return null when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      const result = await service.me(mockJwtPayload);

      expect(result).toBeNull();
      expect(usersService.findById).toHaveBeenCalledWith('user-123');
    });
  });

  describe('update', () => {
    it('should update user profile with basic info', async () => {
      const updateDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      usersService.findById.mockResolvedValue(mockUser);
      const updatedUser = { ...mockUser, ...updateDto };
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser);

      const result = await service.update(mockJwtPayload, updateDto);

      expect(result).toEqual(updatedUser);
      expect(usersService.update).toHaveBeenCalledWith('user-123', updateDto);
    });

    it('should throw error when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(
        service.update(mockJwtPayload, { firstName: 'Test' }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.userNotFound');
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('should throw error when password change without old password', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      await expect(
        service.update(mockJwtPayload, {
          password: 'NewPassword123!',
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.missingOldPassword');
    });

    it('should throw error when user has no password set', async () => {
      const userWithoutPassword = { ...mockUser, password: undefined };
      usersService.findById.mockResolvedValue(userWithoutPassword);

      await expect(
        service.update(mockJwtPayload, {
          password: 'NewPassword123!',
          oldPassword: 'OldPassword123!',
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.incorrectOldPassword');
    });

    it('should throw error when old password is incorrect', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.update(mockJwtPayload, {
          password: 'NewPassword123!',
          oldPassword: 'WrongPassword',
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.incorrectOldPassword');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'WrongPassword',
        'hashed-password',
      );
    });

    it('should update password and delete other sessions when old password is correct', async () => {
      const updateDto = {
        password: 'NewPassword123!',
        oldPassword: 'OldPassword123!',
      };

      usersService.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      usersService.update.mockResolvedValue(mockUser);
      usersService.findById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);

      await service.update(mockJwtPayload, updateDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'OldPassword123!',
        'hashed-password',
      );
      expect(sessionService.deleteByUserIdWithExclude).toHaveBeenCalledWith({
        userId: 'user-123',
        excludeSessionId: 'session-123',
      });
      expect(usersService.update).toHaveBeenCalled();
    });

    it('should throw error when new email already exists', async () => {
      const existingUser = { ...mockUser, id: 'other-user' };
      usersService.findById.mockResolvedValue(mockUser);
      usersService.findByEmail.mockResolvedValue(existingUser);

      await expect(
        service.update(mockJwtPayload, {
          email: 'existing@example.com',
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.emailExists');
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        'existing@example.com',
      );
    });

    it('should send confirmation email when email changes', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      usersService.findByEmail.mockResolvedValue(null);
      jwtService.signAsync.mockResolvedValue('confirmation-token');
      usersService.update.mockResolvedValue(mockUser);
      usersService.findById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);

      await service.update(mockJwtPayload, {
        email: 'newemail@example.com',
      });

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          confirmEmailUserId: 'user-123',
          newEmail: 'newemail@example.com',
        },
        {
          secret: 'secret',
          expiresIn: '1d',
        },
      );

      expect(mailService.confirmNewEmail).toHaveBeenCalledWith({
        to: 'newemail@example.com',
        data: {
          hash: 'confirmation-token',
        },
      });
    });

    it('should allow updating to same email', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      usersService.update.mockResolvedValue(mockUser);
      usersService.findById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);

      await service.update(mockJwtPayload, {
        email: 'test@example.com', // Same as current email
      });

      // Should not check for existing email or send confirmation
      expect(usersService.findByEmail).not.toHaveBeenCalled();
      expect(mailService.confirmNewEmail).not.toHaveBeenCalled();
    });

    it('should remove email and oldPassword from dto before update', async () => {
      const updateDto = {
        email: 'newemail@example.com',
        oldPassword: 'old',
        firstName: 'Updated',
      };

      usersService.findById.mockResolvedValue(mockUser);
      usersService.findByEmail.mockResolvedValue(null);
      jwtService.signAsync.mockResolvedValue('token');
      usersService.update.mockResolvedValue(mockUser);
      usersService.findById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);

      await service.update(mockJwtPayload, updateDto);

      expect(usersService.update).toHaveBeenCalledWith('user-123', {
        firstName: 'Updated',
      });
    });

    it('should return updated user after successful update', async () => {
      const updateDto = { firstName: 'Updated' };
      const updatedUser = { ...mockUser, firstName: 'Updated' };

      usersService.findById.mockResolvedValueOnce(mockUser);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById.mockResolvedValueOnce(updatedUser);

      const result = await service.update(mockJwtPayload, updateDto);

      expect(result).toEqual(updatedUser);
      expect(usersService.findById).toHaveBeenCalledTimes(2);
    });
  });
});
