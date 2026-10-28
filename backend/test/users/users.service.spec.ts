import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { UsersService } from '../../src/users/users.service';
import { UserRepository } from '../../src/users/domain/user.repository';
import { FilesService } from '../../src/files/files.service';
import { CdpSyncService } from '../../src/cdp/cdp-sync.service';
import { RegistrationVoucherService } from '../../src/registration-voucher/registration-voucher.service';
import { AuthProvidersEnum } from '../../src/auth/auth-providers.enum';
import { StatusEnum } from '../../src/statuses/statuses.enum';
import { User } from '../../src/users/domain/user';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<UserRepository>;
  let filesService: jest.Mocked<FilesService>;
  let i18n: jest.Mocked<I18nService>;
  let cdpSyncService: jest.Mocked<CdpSyncService>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    phone: '+84901234567',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashed-password',
    photo: null,
    socialAvatarUrl: null,
    status: StatusEnum.active,
    provider: AuthProvidersEnum.email,
    socialId: null,
    socialAccounts: [],
    cdpCustomerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(0),
  };

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      findBySocialIdAndProvider: jest.fn(),
      findManyWithPagination: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const mockFilesService = {
      findById: jest.fn(),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const mockCdpSyncService = {
      syncUser: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: FilesService, useValue: mockFilesService },
        { provide: I18nService, useValue: mockI18n },
        { provide: CdpSyncService, useValue: mockCdpSyncService },
        {
          provide: RegistrationVoucherService,
          useValue: {
            grantRegistrationVoucher: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(UserRepository);
    filesService = module.get(FilesService);
    i18n = module.get(I18nService);
    cdpSyncService = module.get(CdpSyncService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user with email successfully', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'newuser@example.com',
        password: 'password123',
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          email: createUserDto.email,
          provider: AuthProvidersEnum.email,
        }),
      );
    });

    it('should create a user with phone successfully', async () => {
      const createUserDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '+84909876543',
      };

      userRepository.findByPhone.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(userRepository.findByPhone).toHaveBeenCalledWith(
        createUserDto.phone,
      );
    });

    it('should throw error when email already exists', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when phone already exists', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+84901234567',
      };

      userRepository.findByPhone.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should hash password before storing', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'newuser@example.com',
        password: 'plaintext-password',
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);

      await service.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: expect.not.stringContaining('plaintext-password'),
        }),
      );
    });

    it('should NOT hash password when hashPassword option is false', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'newuser@example.com',
        password: 'hashed-password',
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);

      await service.create(createUserDto, { hashPassword: false });

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashed-password',
        }),
      );
    });

    it('should validate photo exists when provided', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'newuser@example.com',
        photo: { id: 'file-123', path: '/path/to/file' },
      };

      userRepository.findByEmail.mockResolvedValue(null);
      filesService.findById.mockResolvedValue(null);

      await expect(service.create(createUserDto)).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(filesService.findById).toHaveBeenCalledWith('file-123');
    });

    it('should trigger CDP sync after user creation', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'newuser@example.com',
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);
      cdpSyncService.syncUser.mockResolvedValue({ customerId: 'cdp-123' });

      await service.create(createUserDto);

      // Wait for async CDP sync
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(cdpSyncService.syncUser).toHaveBeenCalledWith(mockUser);
    });

    it('should create user with photo when photo exists', async () => {
      const mockFile = { id: 'file-123', path: '/path/to/file' };
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'newuser@example.com',
        photo: mockFile,
      };

      userRepository.findByEmail.mockResolvedValue(null);
      filesService.findById.mockResolvedValue(mockFile as any);
      userRepository.create.mockResolvedValue(mockUser);

      await service.create(createUserDto);

      expect(filesService.findById).toHaveBeenCalledWith('file-123');
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          photo: mockFile,
        }),
      );
    });

    it('should create user with null photo when photo is explicitly null', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'newuser@example.com',
        photo: null,
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);

      await service.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          photo: null,
        }),
      );
    });

    it('should create user with valid status', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'newuser@example.com',
        status: StatusEnum.active,
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);

      await service.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: StatusEnum.active,
        }),
      );
    });

    it('should throw error when invalid status provided', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'newuser@example.com',
        status: 999 as any, // Invalid status
      };

      userRepository.findByEmail.mockResolvedValue(null);

      await expect(service.create(createUserDto)).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should reactivate existing inactive user instead of creating new', async () => {
      const inactiveUser = {
        ...mockUser,
        status: StatusEnum.inactive,
      };
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'inactive@example.com',
        password: 'new-password',
      };

      userRepository.findByEmail.mockResolvedValue(inactiveUser);
      userRepository.update.mockResolvedValue({
        ...inactiveUser,
        status: StatusEnum.active,
      });

      const result = await service.create(createUserDto);

      expect(userRepository.update).toHaveBeenCalledWith(
        inactiveUser.id,
        expect.objectContaining({
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
        }),
      );
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should create user without password', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'newuser@example.com',
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);

      await service.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: createUserDto.firstName,
          password: undefined,
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById('user-123');

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith('user-123');
    });

    it('should return null when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByIds', () => {
    it('should return users for given ids', async () => {
      const users = [mockUser, { ...mockUser, id: 'user-456' }];
      userRepository.findByIds.mockResolvedValue(users);

      const result = await service.findByIds(['user-123', 'user-456']);

      expect(result).toEqual(users);
      expect(userRepository.findByIds).toHaveBeenCalledWith([
        'user-123',
        'user-456',
      ]);
    });
  });

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should return null when email not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByPhone', () => {
    it('should return user when found by phone', async () => {
      userRepository.findByPhone.mockResolvedValue(mockUser);

      const result = await service.findByPhone('+84901234567');

      expect(result).toEqual(mockUser);
      expect(userRepository.findByPhone).toHaveBeenCalledWith('+84901234567');
    });
  });

  describe('findBySocialIdAndProvider', () => {
    it('should return user by social ID and provider', async () => {
      const socialUser = {
        ...mockUser,
        socialId: 'google-123',
        provider: AuthProvidersEnum.google,
      };
      userRepository.findBySocialIdAndProvider.mockResolvedValue(socialUser);

      const result = await service.findBySocialIdAndProvider({
        socialId: 'google-123',
        provider: AuthProvidersEnum.google,
      });

      expect(result).toEqual(socialUser);
      expect(userRepository.findBySocialIdAndProvider).toHaveBeenCalledWith({
        socialId: 'google-123',
        provider: AuthProvidersEnum.google,
      });
    });
  });

  describe('findBySocialAccountExcludingUser', () => {
    beforeEach(() => {
      (userRepository as any).findBySocialAccountExcludingUser = jest.fn();
    });

    it('should return user by social account excluding specified user', async () => {
      const socialUser = {
        ...mockUser,
        id: 'user-456',
        socialId: 'google-123',
        provider: AuthProvidersEnum.google,
      };
      (
        userRepository as any
      ).findBySocialAccountExcludingUser.mockResolvedValue(socialUser);

      const result = await service.findBySocialAccountExcludingUser({
        socialId: 'google-123',
        provider: 'google',
        excludeUserId: 'user-123',
      });

      expect(result).toEqual(socialUser);
      expect(
        (userRepository as any).findBySocialAccountExcludingUser,
      ).toHaveBeenCalledWith({
        socialId: 'google-123',
        provider: 'google',
        excludeUserId: 'user-123',
      });
    });

    it('should return null when no user found', async () => {
      (
        userRepository as any
      ).findBySocialAccountExcludingUser.mockResolvedValue(null);

      const result = await service.findBySocialAccountExcludingUser({
        socialId: 'google-123',
        provider: 'google',
        excludeUserId: 'user-123',
      });

      expect(result).toBeNull();
    });
  });

  describe('findManyWithPagination', () => {
    it('should return paginated users', async () => {
      const paginatedResult = {
        docs: [mockUser],
        totalDocs: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        pagingCounter: 1,
        offset: 0,
      };
      userRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      const result = await service.findManyWithPagination({
        paginationOptions: { page: 1, limit: 10 },
      });

      expect(result).toEqual(paginatedResult);
      expect(userRepository.findManyWithPagination).toHaveBeenCalledWith({
        filterOptions: undefined,
        sortOptions: undefined,
        paginationOptions: { page: 1, limit: 10 },
      });
    });

    it('should apply sorting', async () => {
      const paginatedResult = {
        docs: [],
        totalDocs: 0,
        limit: 10,
        page: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        pagingCounter: 1,
        offset: 0,
      };
      userRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      await service.findManyWithPagination({
        sortOptions: [{ orderBy: 'createdAt', order: 'desc' }],
        paginationOptions: { page: 1, limit: 10 },
      });

      expect(userRepository.findManyWithPagination).toHaveBeenCalledWith({
        filterOptions: undefined,
        sortOptions: [{ orderBy: 'createdAt', order: 'desc' }],
        paginationOptions: { page: 1, limit: 10 },
      });
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };
      const updatedUser = { ...mockUser, ...updateDto };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-123', updateDto);

      expect(result).toEqual(updatedUser);
      expect(userRepository.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          firstName: 'Updated',
          lastName: 'Name',
        }),
      );
    });

    it('should throw error when updating email to existing one', async () => {
      const existingUser = { ...mockUser, id: 'user-456' };
      userRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(
        service.update('user-123', { email: 'existing@example.com' }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    });

    it('should allow updating to same email', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(mockUser);

      const result = await service.update('user-123', {
        email: 'test@example.com',
      });

      expect(result).toEqual(mockUser);
    });

    it('should throw error when updating phone to existing one', async () => {
      const existingUser = { ...mockUser, id: 'user-456' };
      userRepository.findByPhone.mockResolvedValue(existingUser);

      await expect(
        service.update('user-123', { phone: '+84901234567' }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    });

    it('should hash password when updating', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(mockUser);

      await service.update('user-123', { password: 'new-password' });

      expect(userRepository.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          password: expect.not.stringContaining('new-password'),
        }),
      );
    });

    it('should trigger CDP sync after update', async () => {
      const updatedUser = { ...mockUser, firstName: 'Updated' };
      userRepository.update.mockResolvedValue(updatedUser);
      cdpSyncService.syncUser.mockResolvedValue({ customerId: 'cdp-123' });

      await service.update('user-123', { firstName: 'Updated' });

      // Wait for async CDP sync
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(cdpSyncService.syncUser).toHaveBeenCalledWith(updatedUser);
    });

    it('should not rehash password when password unchanged', async () => {
      const updateDto = { password: 'hashed-password' };
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(mockUser);

      await service.update('user-123', updateDto);

      // Should not call update with a newly hashed password
      expect(userRepository.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          password: undefined, // Password not changed, so not included
        }),
      );
    });

    it('should validate photo exists when updating', async () => {
      const updateDto = {
        photo: { id: 'file-123', path: '/path/to/file' },
      };
      filesService.findById.mockResolvedValue(null);

      await expect(service.update('user-123', updateDto)).rejects.toMatchObject(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
        },
      );

      expect(filesService.findById).toHaveBeenCalledWith('file-123');
    });

    it('should update with photo when photo exists', async () => {
      const mockFile = { id: 'file-123', path: '/path/to/file' };
      const updateDto = { photo: mockFile };

      filesService.findById.mockResolvedValue(mockFile as any);
      userRepository.update.mockResolvedValue(mockUser);

      await service.update('user-123', updateDto);

      expect(filesService.findById).toHaveBeenCalledWith('file-123');
      expect(userRepository.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          photo: mockFile,
        }),
      );
    });

    it('should update photo to null when explicitly set', async () => {
      const updateDto = { photo: null };
      userRepository.update.mockResolvedValue(mockUser);

      await service.update('user-123', updateDto);

      expect(userRepository.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          photo: null,
        }),
      );
    });

    it('should update email to null when explicitly set', async () => {
      const updateDto = { email: null };
      userRepository.update.mockResolvedValue(mockUser);

      await service.update('user-123', updateDto);

      expect(userRepository.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          email: null,
        }),
      );
    });

    it('should update phone to null when explicitly set', async () => {
      const updateDto = { phone: null };
      userRepository.update.mockResolvedValue(mockUser);

      await service.update('user-123', updateDto);

      expect(userRepository.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          phone: null,
        }),
      );
    });

    it('should update with valid status', async () => {
      const updateDto = { status: StatusEnum.inactive };
      userRepository.update.mockResolvedValue(mockUser);

      await service.update('user-123', updateDto);

      expect(userRepository.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          status: StatusEnum.inactive,
        }),
      );
    });

    it('should throw error when invalid status provided in update', async () => {
      const updateDto = { status: 999 as any }; // Invalid status

      await expect(service.update('user-123', updateDto)).rejects.toMatchObject(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
        },
      );

      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      userRepository.remove.mockResolvedValue(undefined);

      await service.remove('user-123');

      expect(userRepository.remove).toHaveBeenCalledWith('user-123');
    });
  });
});
