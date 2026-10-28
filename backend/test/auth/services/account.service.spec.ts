import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from '../../../src/auth/services/account.service';
import { UsersService } from '../../../src/users/users.service';
import { SessionService } from '../../../src/session/session.service';
import { User } from '../../../src/users/domain/user';
import { StatusEnum } from '../../../src/statuses/statuses.enum';

describe('AccountService', () => {
  let service: AccountService;
  let usersService: jest.Mocked<UsersService>;
  let sessionService: jest.Mocked<SessionService>;

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

  beforeEach(async () => {
    const mockUsersService = {
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const mockSessionService = {
      deleteById: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: SessionService, useValue: mockSessionService },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    usersService = module.get(UsersService);
    sessionService = module.get(SessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('softDelete', () => {
    it('should soft delete user account', async () => {
      await service.softDelete(mockUser);

      expect(usersService.remove).toHaveBeenCalledTimes(1);
      expect(usersService.remove).toHaveBeenCalledWith('user-123');
    });

    it('should call usersService.remove with correct user id', async () => {
      const differentUser = { ...mockUser, id: 'user-456' };

      await service.softDelete(differentUser);

      expect(usersService.remove).toHaveBeenCalledWith('user-456');
    });

    it('should handle removal successfully', async () => {
      usersService.remove.mockResolvedValue(undefined);

      await expect(service.softDelete(mockUser)).resolves.toBeUndefined();
      expect(usersService.remove).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout user by deleting session', async () => {
      const sessionData = { sessionId: 'session-123' };

      await service.logout(sessionData);

      expect(sessionService.deleteById).toHaveBeenCalledTimes(1);
      expect(sessionService.deleteById).toHaveBeenCalledWith('session-123');
    });

    it('should call sessionService.deleteById with correct session id', async () => {
      const sessionData = { sessionId: 'session-xyz-789' };

      await service.logout(sessionData);

      expect(sessionService.deleteById).toHaveBeenCalledWith('session-xyz-789');
    });

    it('should handle logout successfully', async () => {
      const sessionData = { sessionId: 'session-123' };
      sessionService.deleteById.mockResolvedValue(undefined);

      await expect(service.logout(sessionData)).resolves.toBeUndefined();
      expect(sessionService.deleteById).toHaveBeenCalled();
    });

    it('should return result from sessionService.deleteById', async () => {
      const sessionData = { sessionId: 'session-123' };
      const deleteResult = { deleted: true };
      sessionService.deleteById.mockResolvedValue(deleteResult as any);

      const result = await service.logout(sessionData);

      expect(result).toEqual(deleteResult);
      expect(sessionService.deleteById).toHaveBeenCalledWith('session-123');
    });
  });
});
