import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';
import { TokenService } from '../../../src/auth/services/token.service';
import { SessionService } from '../../../src/session/session.service';
import { UsersService } from '../../../src/users/users.service';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let sessionService: jest.Mocked<SessionService>;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  const mockSession = {
    id: 'session-123',
    hash: 'test-hash-123',
    user: { id: 'user-123' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const mockConfigService = {
      getOrThrow: jest.fn(),
    };

    const mockSessionService = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const mockUsersService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    sessionService = module.get(SessionService);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTokensData', () => {
    it('should generate access token and refresh token', async () => {
      const mockAccessToken = 'access-token-123';
      const mockRefreshToken = 'refresh-token-123';

      configService.getOrThrow.mockImplementation((key: string) => {
        switch (key) {
          case 'auth.expires':
            return '15m';
          case 'auth.secret':
            return 'access-secret';
          case 'auth.refreshSecret':
            return 'refresh-secret';
          case 'auth.refreshExpires':
            return '7d';
          default:
            return null;
        }
      });

      jwtService.signAsync
        .mockResolvedValueOnce(mockAccessToken)
        .mockResolvedValueOnce(mockRefreshToken);

      const result = await service.getTokensData({
        id: mockUser.id,
        sessionId: mockSession.id,
        hash: mockSession.hash,
      });

      expect(result).toHaveProperty('token', mockAccessToken);
      expect(result).toHaveProperty('refreshToken', mockRefreshToken);
      expect(result).toHaveProperty('tokenExpires');
      expect(typeof result.tokenExpires).toBe('number');
      expect(result.tokenExpires).toBeGreaterThan(Date.now());

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);

      // Verify access token payload
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        { id: mockUser.id, sessionId: mockSession.id },
        { secret: 'access-secret', expiresIn: '15m' },
      );

      // Verify refresh token payload
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { sessionId: mockSession.id, hash: mockSession.hash },
        { secret: 'refresh-secret', expiresIn: '7d' },
      );
    });

    it('should calculate correct token expiration time', async () => {
      configService.getOrThrow.mockImplementation((key: string) => {
        if (key === 'auth.expires') return '1h';
        return 'mock-secret';
      });

      jwtService.signAsync.mockResolvedValue('mock-token');

      const beforeCall = Date.now();
      const result = await service.getTokensData({
        id: mockUser.id,
        sessionId: mockSession.id,
        hash: mockSession.hash,
      });
      const afterCall = Date.now();

      // Token should expire approximately 1 hour from now
      const oneHourInMs = 60 * 60 * 1000;
      expect(result.tokenExpires).toBeGreaterThanOrEqual(
        beforeCall + oneHourInMs,
      );
      expect(result.tokenExpires).toBeLessThanOrEqual(afterCall + oneHourInMs);
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully with valid session and hash', async () => {
      sessionService.findById.mockResolvedValue(mockSession as any);
      usersService.findById.mockResolvedValue(mockUser as any);
      sessionService.update.mockResolvedValue(mockSession as any);

      configService.getOrThrow.mockReturnValue('mock-value');
      jwtService.signAsync.mockResolvedValue('new-token');

      const result = await service.refreshToken({
        sessionId: mockSession.id,
        hash: mockSession.hash,
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('tokenExpires');

      expect(sessionService.findById).toHaveBeenCalledWith(mockSession.id);
      expect(usersService.findById).toHaveBeenCalledWith(mockSession.user.id);
      expect(sessionService.update).toHaveBeenCalled();
    });

    it('should throw unauthorized error when session not found', async () => {
      sessionService.findById.mockResolvedValue(null);

      await expect(
        service.refreshToken({
          sessionId: 'non-existent-session',
          hash: 'some-hash',
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
      });

      expect(sessionService.findById).toHaveBeenCalledWith(
        'non-existent-session',
      );
      expect(usersService.findById).not.toHaveBeenCalled();
    });

    it('should throw unauthorized error when hash does not match', async () => {
      sessionService.findById.mockResolvedValue(mockSession as any);

      await expect(
        service.refreshToken({
          sessionId: mockSession.id,
          hash: 'wrong-hash',
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
      });

      expect(usersService.findById).not.toHaveBeenCalled();
    });

    it('should throw unauthorized error when user not found', async () => {
      sessionService.findById.mockResolvedValue(mockSession as any);
      usersService.findById.mockResolvedValue(null);

      await expect(
        service.refreshToken({
          sessionId: mockSession.id,
          hash: mockSession.hash,
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
      });

      expect(usersService.findById).toHaveBeenCalledWith(mockSession.user.id);
      expect(sessionService.update).not.toHaveBeenCalled();
    });

    it('should update session hash on successful refresh', async () => {
      sessionService.findById.mockResolvedValue(mockSession as any);
      usersService.findById.mockResolvedValue(mockUser as any);
      sessionService.update.mockResolvedValue(mockSession as any);

      configService.getOrThrow.mockReturnValue('mock-value');
      jwtService.signAsync.mockResolvedValue('new-token');

      await service.refreshToken({
        sessionId: mockSession.id,
        hash: mockSession.hash,
      });

      expect(sessionService.update).toHaveBeenCalledWith(
        mockSession.id,
        expect.objectContaining({
          hash: expect.any(String),
        }),
      );

      // Ensure the new hash is different from the old one
      const updateCall = sessionService.update.mock.calls[0];
      expect(updateCall[1].hash).not.toBe(mockSession.hash);
    });
  });
});
