import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from '../../src/session/session.service';
import { SessionRepository } from '../../src/session/domain/session.repository';
import { Session } from '../../src/session/domain/session';
import { User } from '../../src/users/domain/user';
import { CmsUser } from '../../src/cms-users/domain/cms-user';

describe('SessionService', () => {
  let service: SessionService;
  let sessionRepository: jest.Mocked<SessionRepository>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    phone: '0901234567',
    firstName: 'John',
    lastName: 'Doe',
  } as User;

  const mockCmsUser: CmsUser = {
    id: 'cms-user-123',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  } as CmsUser;

  const mockSession: Session = {
    id: 'session-123',
    user: mockUser,
    hash: 'abc123hash',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  };

  beforeEach(async () => {
    const mockSessionRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
      deleteByUserId: jest.fn(),
      deleteByUserIdWithExclude: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: SessionRepository, useValue: mockSessionRepository },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    sessionRepository = module.get(SessionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return session by id', async () => {
      sessionRepository.findById.mockResolvedValue(mockSession);

      const result = await service.findById('session-123');

      expect(result).toEqual(mockSession);
      expect(sessionRepository.findById).toHaveBeenCalledWith('session-123');
    });

    it('should return null when session not found', async () => {
      sessionRepository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create session with provided data', async () => {
      const sessionData = {
        user: mockUser,
        hash: 'test-hash',
      };
      const createdSession = { ...mockSession, ...sessionData };
      sessionRepository.create.mockResolvedValue(createdSession);

      const result = await service.create(sessionData);

      expect(result).toEqual(createdSession);
      expect(sessionRepository.create).toHaveBeenCalledWith(sessionData);
    });
  });

  describe('createForUser', () => {
    it('should create session for user with generated hash', async () => {
      sessionRepository.create.mockResolvedValue(mockSession);

      const result = await service.createForUser(mockUser);

      expect(result).toEqual(mockSession);
      expect(sessionRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        hash: expect.any(String),
      });
      // Verify hash is a valid hex string (64 chars for SHA256)
      const callArgs = sessionRepository.create.mock.calls[0][0];
      expect(callArgs.hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should generate different hashes for different calls', async () => {
      sessionRepository.create.mockResolvedValue(mockSession);

      await service.createForUser(mockUser);
      await service.createForUser(mockUser);

      const firstHash = sessionRepository.create.mock.calls[0][0].hash;
      const secondHash = sessionRepository.create.mock.calls[1][0].hash;

      expect(firstHash).not.toBe(secondHash);
    });
  });

  describe('createForCmsUser', () => {
    it('should create session for CMS user with generated hash', async () => {
      sessionRepository.create.mockResolvedValue(mockSession);

      const result = await service.createForCmsUser(mockCmsUser);

      expect(result).toEqual(mockSession);
      expect(sessionRepository.create).toHaveBeenCalledWith({
        user: mockCmsUser,
        hash: expect.any(String),
      });
      // Verify hash is a valid hex string
      const callArgs = sessionRepository.create.mock.calls[0][0];
      expect(callArgs.hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('update', () => {
    it('should update session by id', async () => {
      const updatedSession = { ...mockSession, hash: 'new-hash' };
      sessionRepository.update.mockResolvedValue(updatedSession);

      const result = await service.update('session-123', { hash: 'new-hash' });

      expect(result).toEqual(updatedSession);
      expect(sessionRepository.update).toHaveBeenCalledWith('session-123', {
        hash: 'new-hash',
      });
    });

    it('should return null when session not found', async () => {
      sessionRepository.update.mockResolvedValue(null);

      const result = await service.update('non-existent', { hash: 'new-hash' });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete session by id', async () => {
      sessionRepository.deleteById.mockResolvedValue(undefined);

      await service.delete({ id: 'session-123' });

      expect(sessionRepository.deleteById).toHaveBeenCalledWith('session-123');
    });
  });

  describe('deleteById', () => {
    it('should delete session by id', async () => {
      sessionRepository.deleteById.mockResolvedValue(undefined);

      await service.deleteById('session-123');

      expect(sessionRepository.deleteById).toHaveBeenCalledWith('session-123');
    });
  });

  describe('deleteByUserId', () => {
    it('should delete all sessions for a user', async () => {
      sessionRepository.deleteByUserId.mockResolvedValue(undefined);

      await service.deleteByUserId({ userId: 'user-123' });

      expect(sessionRepository.deleteByUserId).toHaveBeenCalledWith({
        userId: 'user-123',
      });
    });
  });

  describe('deleteByUserIdWithExclude', () => {
    it('should delete all sessions for a user except specified session', async () => {
      sessionRepository.deleteByUserIdWithExclude.mockResolvedValue(undefined);

      await service.deleteByUserIdWithExclude({
        userId: 'user-123',
        excludeSessionId: 'session-456',
      });

      expect(sessionRepository.deleteByUserIdWithExclude).toHaveBeenCalledWith({
        userId: 'user-123',
        excludeSessionId: 'session-456',
      });
    });
  });
});
