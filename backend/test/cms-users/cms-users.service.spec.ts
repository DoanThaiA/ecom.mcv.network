import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CmsUsersService } from '../../src/cms-users/cms-users.service';
import { CmsUserRepository } from '../../src/cms-users/domain/cms-user.repository';
import { FilesService } from '../../src/files/files.service';
import { AffiliatesService } from '../../src/affiliates/affiliates.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../src/mail/mail.service';
import { CmsUser } from '../../src/cms-users/domain/cms-user';
import { AccountTypeEnum } from '../../src/cms-users/permissions/account-type.enum';
import { StatusEnum } from '../../src/statuses/statuses.enum';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('CmsUsersService', () => {
  let service: CmsUsersService;
  let cmsUserRepository: jest.Mocked<CmsUserRepository>;
  let filesService: jest.Mocked<FilesService>;
  let affiliatesService: jest.Mocked<AffiliatesService>;
  let i18n: jest.Mocked<I18nService>;

  const mockCmsUser: CmsUser = {
    id: 'cms-user-123',
    email: 'admin@example.com',
    password: 'hashed-password',
    firstName: 'Admin',
    lastName: 'User',
    permissionGroup: 1,
    accountType: AccountTypeEnum.website_admin,
    permissions: [],
    affiliateId: null,
    phone: null,
    status: StatusEnum.active,
    photo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  };

  beforeEach(async () => {
    const mockCmsUserRepository = {
      create: jest.fn(),
      findManyWithPagination: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailAll: jest.fn().mockResolvedValue(null),
      findByAffiliateId: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      freeEmail: jest.fn(),
    };

    const mockFilesService = {
      findById: jest.fn(),
    };

    const mockAffiliatesService = {
      findById: jest.fn(),
      findManyWithPagination: jest.fn(),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CmsUsersService,
        { provide: CmsUserRepository, useValue: mockCmsUserRepository },
        { provide: FilesService, useValue: mockFilesService },
        { provide: AffiliatesService, useValue: mockAffiliatesService },
        { provide: I18nService, useValue: mockI18n },
        {
          provide: MailService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
            getOrThrow: jest.fn().mockReturnValue('mock-value'),
          },
        },
      ],
    }).compile();

    service = module.get<CmsUsersService>(CmsUsersService);
    cmsUserRepository = module.get(CmsUserRepository);
    filesService = module.get(FilesService);
    affiliatesService = module.get(AffiliatesService);
    i18n = module.get(I18nService);

    // Mock bcrypt
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      email: 'newadmin@example.com',
      password: 'Password123!',
      firstName: 'New',
      lastName: 'Admin',
      permissionGroup: 1,
      accountType: AccountTypeEnum.website_admin,
    };

    it('should create CMS user successfully', async () => {
      cmsUserRepository.findByEmail.mockResolvedValue(null);
      cmsUserRepository.create.mockResolvedValue(mockCmsUser);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCmsUser);
      expect(cmsUserRepository.findByEmail).toHaveBeenCalledWith(
        createDto.email,
      );
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 'salt');
      expect(cmsUserRepository.create).toHaveBeenCalledWith({
        email: createDto.email,
        password: 'hashed-password',
        firstName: createDto.firstName,
        lastName: createDto.lastName,
        phone: undefined,
        permissionGroup: createDto.permissionGroup,
        accountType: AccountTypeEnum.website_admin,
        permissions: [],
        affiliateId: null,
        photo: undefined,
        status: StatusEnum.active,
      });
    });

    it('should throw error when email already exists', async () => {
      cmsUserRepository.findByEmail.mockResolvedValue(mockCmsUser);

      await expect(service.create(createDto)).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('user.emailAlreadyExists');
      expect(cmsUserRepository.create).not.toHaveBeenCalled();
    });

    it('should validate and attach photo if provided', async () => {
      const mockFile = { id: 'file-123', path: '/uploads/photo.jpg' };
      const dtoWithPhoto = {
        ...createDto,
        photo: { id: 'file-123', path: '/uploads/photo.jpg' },
      };

      cmsUserRepository.findByEmail.mockResolvedValue(null);
      filesService.findById.mockResolvedValue(mockFile as any);
      cmsUserRepository.create.mockResolvedValue(mockCmsUser);

      await service.create(dtoWithPhoto);

      expect(filesService.findById).toHaveBeenCalledWith('file-123');
      expect(cmsUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          photo: mockFile,
        }),
      );
    });

    it('should throw error when photo does not exist', async () => {
      const dtoWithPhoto = {
        ...createDto,
        photo: { id: 'non-existent', path: '' },
      };

      cmsUserRepository.findByEmail.mockResolvedValue(null);
      filesService.findById.mockResolvedValue(null);

      await expect(service.create(dtoWithPhoto)).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('user.imageNotExists');
    });

    it('should throw error when permission group is invalid', async () => {
      const dtoWithInvalidPermission = {
        ...createDto,
        permissionGroup: 999,
      };

      cmsUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.create(dtoWithInvalidPermission),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('cms-user.permissionGroupNotExists');
    });

    it('should use provided status if valid', async () => {
      const dtoWithStatus = {
        ...createDto,
        status: StatusEnum.inactive,
      };

      cmsUserRepository.findByEmail.mockResolvedValue(null);
      cmsUserRepository.create.mockResolvedValue(mockCmsUser);

      await service.create(dtoWithStatus);

      expect(cmsUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: StatusEnum.inactive,
        }),
      );
    });

    it('should throw error when status is invalid', async () => {
      const dtoWithInvalidStatus = {
        ...createDto,
        status: 999 as StatusEnum,
      };

      cmsUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.create(dtoWithInvalidStatus)).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('user.statusNotExists');
    });

    it('should create user with null photo when explicitly provided', async () => {
      const dtoWithNullPhoto = {
        ...createDto,
        photo: null,
      };

      cmsUserRepository.findByEmail.mockResolvedValue(null);
      cmsUserRepository.create.mockResolvedValue(mockCmsUser);

      await service.create(dtoWithNullPhoto);

      expect(cmsUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          photo: null,
        }),
      );
    });
  });

  describe('findManyWithPagination', () => {
    it('should return paginated CMS users', async () => {
      const paginatedResult = {
        docs: [mockCmsUser],
        totalDocs: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
      };
      cmsUserRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      const result = await service.findManyWithPagination({
        filterOptions: {},
        sortOptions: [],
        paginationOptions: { page: 1, limit: 10 },
      });

      expect(result).toEqual(paginatedResult);
      expect(cmsUserRepository.findManyWithPagination).toHaveBeenCalledWith({
        filterOptions: {},
        sortOptions: [],
        paginationOptions: { page: 1, limit: 10 },
      });
    });
  });

  describe('findById', () => {
    it('should return CMS user by id', async () => {
      cmsUserRepository.findById.mockResolvedValue(mockCmsUser);

      const result = await service.findById('cms-user-123');

      expect(result).toEqual(mockCmsUser);
      expect(cmsUserRepository.findById).toHaveBeenCalledWith('cms-user-123');
    });

    it('should return null when user not found', async () => {
      cmsUserRepository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByIds', () => {
    it('should return multiple CMS users by ids', async () => {
      const users = [mockCmsUser, { ...mockCmsUser, id: 'cms-user-456' }];
      cmsUserRepository.findByIds.mockResolvedValue(users as any);

      const result = await service.findByIds(['cms-user-123', 'cms-user-456']);

      expect(result).toEqual(users);
      expect(result).toHaveLength(2);
    });
  });

  describe('findByEmail', () => {
    it('should return CMS user by email', async () => {
      cmsUserRepository.findByEmail.mockResolvedValue(mockCmsUser);

      const result = await service.findByEmail('admin@example.com');

      expect(result).toEqual(mockCmsUser);
      expect(cmsUserRepository.findByEmail).toHaveBeenCalledWith(
        'admin@example.com',
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update CMS user successfully', async () => {
      const updatedUser = { ...mockCmsUser, ...updateDto };
      cmsUserRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update('cms-user-123', updateDto);

      expect(result).toEqual(updatedUser);
      expect(cmsUserRepository.update).toHaveBeenCalledWith(
        'cms-user-123',
        expect.objectContaining({
          firstName: 'Updated',
          lastName: 'Name',
        }),
      );
    });

    it('should hash new password if different from current', async () => {
      const updateWithPassword = {
        ...updateDto,
        password: 'NewPassword123!',
      };

      cmsUserRepository.findById.mockResolvedValue(mockCmsUser);
      cmsUserRepository.update.mockResolvedValue(mockCmsUser);

      await service.update('cms-user-123', updateWithPassword);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123!', 'salt');
      expect(cmsUserRepository.update).toHaveBeenCalledWith(
        'cms-user-123',
        expect.objectContaining({
          password: 'hashed-password',
        }),
      );
    });

    it('should throw error when updating to existing email', async () => {
      const updateWithEmail = {
        ...updateDto,
        email: 'existing@example.com',
      };

      const existingUser = { ...mockCmsUser, id: 'different-id' };
      cmsUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(
        service.update('cms-user-123', updateWithEmail),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('user.emailAlreadyExists');
    });

    it('should allow updating to own email', async () => {
      const updateWithEmail = {
        ...updateDto,
        email: 'admin@example.com',
      };

      cmsUserRepository.findByEmail.mockResolvedValue(mockCmsUser);
      cmsUserRepository.update.mockResolvedValue(mockCmsUser);

      await service.update('cms-user-123', updateWithEmail);

      expect(cmsUserRepository.update).toHaveBeenCalledWith(
        'cms-user-123',
        expect.objectContaining({
          email: 'admin@example.com',
        }),
      );
    });

    it('should validate and update photo', async () => {
      const mockFile = { id: 'file-456', path: '/uploads/new-photo.jpg' };
      const updateWithPhoto = {
        ...updateDto,
        photo: { id: 'file-456', path: '/uploads/new-photo.jpg' },
      };

      filesService.findById.mockResolvedValue(mockFile as any);
      cmsUserRepository.update.mockResolvedValue(mockCmsUser);

      await service.update('cms-user-123', updateWithPhoto);

      expect(filesService.findById).toHaveBeenCalledWith('file-456');
      expect(cmsUserRepository.update).toHaveBeenCalledWith(
        'cms-user-123',
        expect.objectContaining({
          photo: mockFile,
        }),
      );
    });

    it('should throw error when photo does not exist', async () => {
      const updateWithPhoto = {
        ...updateDto,
        photo: { id: 'non-existent', path: '' },
      };

      filesService.findById.mockResolvedValue(null);

      await expect(
        service.update('cms-user-123', updateWithPhoto),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('user.imageNotExists');
    });

    it('should update user with null photo when explicitly provided', async () => {
      const updateWithNullPhoto = {
        ...updateDto,
        photo: null,
      };

      cmsUserRepository.update.mockResolvedValue(mockCmsUser);

      await service.update('cms-user-123', updateWithNullPhoto);

      expect(cmsUserRepository.update).toHaveBeenCalledWith(
        'cms-user-123',
        expect.objectContaining({
          photo: null,
        }),
      );
    });

    it('should update user with valid permission group', async () => {
      const updateWithPermissionGroup = {
        ...updateDto,
        permissionGroup: 2,
      };

      cmsUserRepository.update.mockResolvedValue(mockCmsUser);

      await service.update('cms-user-123', updateWithPermissionGroup);

      expect(cmsUserRepository.update).toHaveBeenCalledWith(
        'cms-user-123',
        expect.objectContaining({
          permissionGroup: 2,
        }),
      );
    });

    it('should throw error when updating with invalid permission group', async () => {
      const updateWithInvalidGroup = {
        ...updateDto,
        permissionGroup: 999,
      };

      await expect(
        service.update('cms-user-123', updateWithInvalidGroup),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('cms-user.permissionGroupNotExists');
    });

    it('should update user with valid status', async () => {
      const updateWithStatus = {
        ...updateDto,
        status: StatusEnum.inactive,
      };

      cmsUserRepository.update.mockResolvedValue(mockCmsUser);

      await service.update('cms-user-123', updateWithStatus);

      expect(cmsUserRepository.update).toHaveBeenCalledWith(
        'cms-user-123',
        expect.objectContaining({
          status: StatusEnum.inactive,
        }),
      );
    });

    it('should throw error when updating with invalid status', async () => {
      const updateWithInvalidStatus = {
        ...updateDto,
        status: 999 as StatusEnum,
      };

      await expect(
        service.update('cms-user-123', updateWithInvalidStatus),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('user.statusNotExists');
    });
  });

  describe('remove', () => {
    it('should remove CMS user successfully', async () => {
      cmsUserRepository.remove.mockResolvedValue(undefined);

      await service.remove('cms-user-123');

      expect(cmsUserRepository.remove).toHaveBeenCalledWith('cms-user-123');
    });
  });
});
