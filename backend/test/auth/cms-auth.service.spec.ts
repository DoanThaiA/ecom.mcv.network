import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { CmsAuthService } from '../../src/auth/cms-auth.service';
import { CmsUsersService } from '../../src/cms-users/cms-users.service';
import { SessionService } from '../../src/session/session.service';
import { CmsUser } from '../../src/cms-users/domain/cms-user';
import { Session } from '../../src/session/domain/session';
import { StatusEnum } from '../../src/statuses/statuses.enum';
import { AccountTypeEnum } from '../../src/cms-users/permissions/account-type.enum';

jest.mock('bcryptjs');
jest.mock('crypto');

describe('CmsAuthService', () => {
  let service: CmsAuthService;
  let cmsUsersService: jest.Mocked<CmsUsersService>;
  let sessionService: jest.Mocked<SessionService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let i18n: jest.Mocked<I18nService>;

  const mockCmsUser: CmsUser = {
    id: 'cms-user-123',
    email: 'admin@example.com',
    password: 'hashed-password',
    firstName: 'Admin',
    lastName: 'User',
    permissionGroup: 1,
    status: StatusEnum.active,
    photo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  } as CmsUser;

  const mockSession: Session = {
    id: 'session-123',
    user: mockCmsUser,
    hash: 'session-hash',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  } as Session;

  beforeEach(async () => {
    const mockCmsUsersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    const mockSessionService = {
      createForCmsUser: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByUserIdWithExclude: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const mockConfigService = {
      getOrThrow: jest.fn((key: string) => {
        if (key === 'auth.expires') return '15m';
        if (key === 'auth.secret') return 'jwt-secret';
        if (key === 'auth.refreshSecret') return 'refresh-secret';
        if (key === 'auth.refreshExpires') return '7d';
        return 'mock-value';
      }),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CmsAuthService,
        { provide: CmsUsersService, useValue: mockCmsUsersService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<CmsAuthService>(CmsAuthService);
    cmsUsersService = module.get(CmsUsersService);
    sessionService = module.get(SessionService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    i18n = module.get(I18nService);

    // Setup bcrypt mock
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCmsLogin', () => {
    const loginDto = {
      email: 'admin@example.com',
      password: 'Password123!',
    };

    it('should login successfully with valid credentials', async () => {
      cmsUsersService.findByEmail.mockResolvedValue(mockCmsUser);
      sessionService.createForCmsUser.mockResolvedValue(mockSession);
      jwtService.signAsync
        .mockResolvedValueOnce('jwt-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.validateCmsLogin(loginDto);

      expect(result).toEqual({
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        tokenExpires: expect.any(Number),
        user: mockCmsUser,
      });
      expect(cmsUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        'hashed-password',
      );
      expect(sessionService.createForCmsUser).toHaveBeenCalledWith(mockCmsUser);
    });

    it('should throw error when email not found', async () => {
      cmsUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.validateCmsLogin(loginDto)).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.emailNotFound');
      expect(sessionService.createForCmsUser).not.toHaveBeenCalled();
    });

    it('should throw error when user has no password', async () => {
      const userWithoutPassword = { ...mockCmsUser, password: undefined };
      cmsUsersService.findByEmail.mockResolvedValue(
        userWithoutPassword as CmsUser,
      );

      await expect(service.validateCmsLogin(loginDto)).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.incorrectPassword');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error when account is inactive', async () => {
      const inactiveUser = { ...mockCmsUser, status: StatusEnum.inactive };
      cmsUsersService.findByEmail.mockResolvedValue(inactiveUser);

      await expect(service.validateCmsLogin(loginDto)).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.accountInactive');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error when password is incorrect', async () => {
      cmsUsersService.findByEmail.mockResolvedValue(mockCmsUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateCmsLogin(loginDto)).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.incorrectPassword');
      expect(sessionService.createForCmsUser).not.toHaveBeenCalled();
    });

    it('should create session and generate tokens on successful login', async () => {
      cmsUsersService.findByEmail.mockResolvedValue(mockCmsUser);
      sessionService.createForCmsUser.mockResolvedValue(mockSession);
      jwtService.signAsync
        .mockResolvedValueOnce('jwt-token')
        .mockResolvedValueOnce('refresh-token');

      await service.validateCmsLogin(loginDto);

      expect(sessionService.createForCmsUser).toHaveBeenCalledWith(mockCmsUser);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          id: mockCmsUser.id,
          permissions: mockCmsUser.permissions ?? [],
          accountType: mockCmsUser.accountType ?? null,
          affiliateId: mockCmsUser.affiliateId ?? null,
          sessionId: mockSession.id,
        },
        {
          secret: 'jwt-secret',
          expiresIn: '15m',
        },
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          sessionId: mockSession.id,
          hash: mockSession.hash,
        },
        {
          secret: 'refresh-secret',
          expiresIn: '7d',
        },
      );
    });
  });

  describe('getCmsTokensData', () => {
    it('should generate JWT tokens with correct payload', async () => {
      const tokenData = {
        id: 'cms-user-123',
        permissions: [],
        accountType: AccountTypeEnum.website_admin,
        affiliateId: null as string | null,
        sessionId: 'session-123',
        hash: 'session-hash',
      };

      jwtService.signAsync
        .mockResolvedValueOnce('jwt-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.getCmsTokensData(tokenData);

      expect(result).toEqual({
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        tokenExpires: expect.any(Number),
      });
      expect(result.tokenExpires).toBeGreaterThan(Date.now());
    });

    it('should use config values for token generation', async () => {
      const tokenData = {
        id: 'cms-user-123',
        permissions: [],
        accountType: AccountTypeEnum.website_admin,
        affiliateId: null as string | null,
        sessionId: 'session-456',
        hash: 'hash-456',
      };

      jwtService.signAsync
        .mockResolvedValueOnce('token')
        .mockResolvedValueOnce('refresh');

      await service.getCmsTokensData(tokenData);

      expect(configService.getOrThrow).toHaveBeenCalledWith('auth.expires', {
        infer: true,
      });
      expect(configService.getOrThrow).toHaveBeenCalledWith('auth.secret', {
        infer: true,
      });
      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'auth.refreshSecret',
        { infer: true },
      );
      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'auth.refreshExpires',
        { infer: true },
      );
    });

    it('should calculate token expiration correctly', async () => {
      configService.getOrThrow.mockImplementation((key: string) => {
        if (key === 'auth.expires') return '30m';
        if (key === 'auth.secret') return 'secret';
        if (key === 'auth.refreshSecret') return 'refresh-secret';
        if (key === 'auth.refreshExpires') return '7d';
        return 'mock';
      });

      jwtService.signAsync
        .mockResolvedValueOnce('token')
        .mockResolvedValueOnce('refresh');

      const beforeTime = Date.now();
      const result = await service.getCmsTokensData({
        id: 'user-1',
        permissions: [],
        accountType: AccountTypeEnum.website_admin,
        affiliateId: null,
        sessionId: 'session-1',
        hash: 'hash-1',
      });
      const afterTime = Date.now();

      // Token should expire in ~30 minutes (1800000 ms)
      expect(result.tokenExpires).toBeGreaterThan(beforeTime + 1799000);
      expect(result.tokenExpires).toBeLessThan(afterTime + 1801000);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully with valid session', async () => {
      const refreshData = {
        sessionId: 'session-123',
        hash: 'session-hash',
      };

      const mockHashUpdate = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('new-hash'),
      };
      (crypto.createHash as jest.Mock).mockReturnValue(mockHashUpdate);

      sessionService.findById.mockResolvedValue(mockSession);
      sessionService.update.mockResolvedValue(null);
      cmsUsersService.findById.mockResolvedValue(mockCmsUser);
      jwtService.signAsync
        .mockResolvedValueOnce('new-jwt-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await service.refreshToken(refreshData);

      expect(result).toEqual({
        token: 'new-jwt-token',
        refreshToken: 'new-refresh-token',
        tokenExpires: expect.any(Number),
      });
      expect(sessionService.findById).toHaveBeenCalledWith('session-123');
      expect(sessionService.update).toHaveBeenCalledWith('session-123', {
        hash: 'new-hash',
      });
      expect(cmsUsersService.findById).toHaveBeenCalledWith(mockCmsUser.id);
    });

    it('should throw error when session not found', async () => {
      const refreshData = {
        sessionId: 'non-existent',
        hash: 'some-hash',
      };

      sessionService.findById.mockResolvedValue(null);

      await expect(service.refreshToken(refreshData)).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.sessionNotFound');
      expect(sessionService.update).not.toHaveBeenCalled();
    });

    it('should throw error when session hash does not match', async () => {
      const refreshData = {
        sessionId: 'session-123',
        hash: 'wrong-hash',
      };

      const sessionWithDifferentHash = {
        ...mockSession,
        hash: 'correct-hash',
      };
      sessionService.findById.mockResolvedValue(sessionWithDifferentHash);

      await expect(service.refreshToken(refreshData)).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.invalidSession');
      expect(sessionService.update).not.toHaveBeenCalled();
    });

    it('should throw error when user not found after session validation', async () => {
      const refreshData = {
        sessionId: 'session-123',
        hash: 'session-hash',
      };

      const mockHashUpdate = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('new-hash'),
      };
      (crypto.createHash as jest.Mock).mockReturnValue(mockHashUpdate);

      sessionService.findById.mockResolvedValue(mockSession);
      sessionService.update.mockResolvedValue(null);
      cmsUsersService.findById.mockResolvedValue(null);

      await expect(service.refreshToken(refreshData)).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.userNotFound');
    });

    it('should generate new hash for session on refresh', async () => {
      const refreshData = {
        sessionId: 'session-123',
        hash: 'session-hash',
      };

      const mockHashUpdate = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('new-random-hash'),
      };
      (crypto.createHash as jest.Mock).mockReturnValue(mockHashUpdate);

      sessionService.findById.mockResolvedValue(mockSession);
      sessionService.update.mockResolvedValue(null);
      cmsUsersService.findById.mockResolvedValue(mockCmsUser);
      jwtService.signAsync
        .mockResolvedValueOnce('token')
        .mockResolvedValueOnce('refresh');

      await service.refreshToken(refreshData);

      expect(crypto.createHash).toHaveBeenCalledWith('sha256');
      expect(mockHashUpdate.update).toHaveBeenCalledWith(expect.any(String));
      expect(mockHashUpdate.digest).toHaveBeenCalledWith('hex');
      expect(sessionService.update).toHaveBeenCalledWith('session-123', {
        hash: 'new-random-hash',
      });
    });
  });

  describe('logout', () => {
    it('should delete session on logout', async () => {
      const logoutData = { sessionId: 'session-123' };
      sessionService.delete.mockResolvedValue(undefined);

      await service.logout(logoutData);

      expect(sessionService.delete).toHaveBeenCalledWith({
        id: 'session-123',
      });
      expect(sessionService.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle logout for different session IDs', async () => {
      const logoutData = { sessionId: 'session-xyz-789' };
      sessionService.delete.mockResolvedValue(undefined);

      await service.logout(logoutData);

      expect(sessionService.delete).toHaveBeenCalledWith({
        id: 'session-xyz-789',
      });
    });
  });

  describe('me', () => {
    it('should return current CMS user', async () => {
      const jwtPayload = {
        id: 'cms-user-123',
        sessionId: 'session-123',
        iat: 1234567890,
        exp: 1234567890,
      };

      cmsUsersService.findById.mockResolvedValue(mockCmsUser);

      const result = await service.me(jwtPayload);

      expect(result).toEqual(mockCmsUser);
      expect(cmsUsersService.findById).toHaveBeenCalledWith('cms-user-123');
    });

    it('should return null when user not found', async () => {
      const jwtPayload = {
        id: 'non-existent',
        sessionId: 'session-456',
        iat: 1234567890,
        exp: 1234567890,
      };

      cmsUsersService.findById.mockResolvedValue(null);

      const result = await service.me(jwtPayload);

      expect(result).toBeNull();
      expect(cmsUsersService.findById).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('update', () => {
    const jwtPayload = {
      id: 'cms-user-123',
      sessionId: 'session-123',
      iat: 1234567890,
      exp: 1234567890,
    };

    it('should update CMS user profile successfully', async () => {
      const updateDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const updatedUser = { ...mockCmsUser, ...updateDto };
      cmsUsersService.findById.mockResolvedValueOnce(mockCmsUser);
      cmsUsersService.update.mockResolvedValue(updatedUser);
      cmsUsersService.findById.mockResolvedValueOnce(updatedUser);

      const result = await service.update(jwtPayload, updateDto);

      expect(result).toEqual(updatedUser);
      expect(cmsUsersService.update).toHaveBeenCalledWith(
        'cms-user-123',
        updateDto,
      );
    });

    it('should throw error when user not found', async () => {
      cmsUsersService.findById.mockResolvedValue(null);

      await expect(
        service.update(jwtPayload, { firstName: 'Test' }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.userNotFound');
      expect(cmsUsersService.update).not.toHaveBeenCalled();
    });

    it('should throw error when password change without old password', async () => {
      cmsUsersService.findById.mockResolvedValue(mockCmsUser);

      await expect(
        service.update(jwtPayload, { password: 'NewPassword123!' }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.missingOldPassword');
    });

    it('should throw error when user has no password set', async () => {
      const userWithoutPassword = { ...mockCmsUser, password: undefined };
      cmsUsersService.findById.mockResolvedValue(
        userWithoutPassword as CmsUser,
      );

      await expect(
        service.update(jwtPayload, {
          password: 'NewPassword123!',
          oldPassword: 'OldPassword123!',
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.incorrectOldPassword');
    });

    it('should throw error when old password is incorrect', async () => {
      cmsUsersService.findById.mockResolvedValue(mockCmsUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.update(jwtPayload, {
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

      cmsUsersService.findById.mockResolvedValueOnce(mockCmsUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      cmsUsersService.update.mockResolvedValue(mockCmsUser);
      cmsUsersService.findById.mockResolvedValueOnce(mockCmsUser);

      await service.update(jwtPayload, updateDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'OldPassword123!',
        'hashed-password',
      );
      expect(sessionService.deleteByUserIdWithExclude).toHaveBeenCalledWith({
        userId: 'cms-user-123',
        excludeSessionId: 'session-123',
      });
      expect(cmsUsersService.update).toHaveBeenCalled();
    });

    it('should throw error when new email already exists', async () => {
      const existingUser = { ...mockCmsUser, id: 'other-user' };
      cmsUsersService.findById.mockResolvedValueOnce(mockCmsUser);
      cmsUsersService.findByEmail.mockResolvedValue(existingUser);

      await expect(
        service.update(jwtPayload, { email: 'existing@example.com' }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.emailExists');
      expect(cmsUsersService.findByEmail).toHaveBeenCalledWith(
        'existing@example.com',
      );
    });

    it('should allow updating to same email', async () => {
      cmsUsersService.findById.mockResolvedValueOnce(mockCmsUser);
      cmsUsersService.findByEmail.mockResolvedValue(mockCmsUser);
      cmsUsersService.update.mockResolvedValue(mockCmsUser);
      cmsUsersService.findById.mockResolvedValueOnce(mockCmsUser);

      await service.update(jwtPayload, { email: 'admin@example.com' });

      expect(cmsUsersService.update).toHaveBeenCalled();
    });

    it('should skip email check when email is not changing', async () => {
      cmsUsersService.findById.mockResolvedValueOnce(mockCmsUser);
      cmsUsersService.update.mockResolvedValue(mockCmsUser);
      cmsUsersService.findById.mockResolvedValueOnce(mockCmsUser);

      await service.update(jwtPayload, { firstName: 'Updated' });

      expect(cmsUsersService.findByEmail).not.toHaveBeenCalled();
    });

    it('should return updated user after successful update', async () => {
      const updateDto = { firstName: 'Updated' };
      const updatedUser = { ...mockCmsUser, firstName: 'Updated' };

      cmsUsersService.findById.mockResolvedValueOnce(mockCmsUser);
      cmsUsersService.update.mockResolvedValue(updatedUser);
      cmsUsersService.findById.mockResolvedValueOnce(updatedUser);

      const result = await service.update(jwtPayload, updateDto);

      expect(result).toEqual(updatedUser);
      expect(cmsUsersService.findById).toHaveBeenCalledTimes(2);
    });
  });
});
