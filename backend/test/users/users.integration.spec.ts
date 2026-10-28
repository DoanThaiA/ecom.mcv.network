import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { HttpStatus } from '@nestjs/common';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../../src/test/mongo-test.module';
import { UsersService } from '../../src/users/users.service';
import { UsersDocumentRepository } from '../../src/users/model/user.repository';
import { UserRepository } from '../../src/users/domain/user.repository';
import { UserSchemaClass, UserSchema } from '../../src/users/model/user.schema';
import { FilesService } from '../../src/files/files.service';
import { CdpSyncService } from '../../src/cdp/cdp-sync.service';
import { RegistrationVoucherService } from '../../src/registration-voucher/registration-voucher.service';
import { AuthProvidersEnum } from '../../src/auth/auth-providers.enum';
import { StatusEnum } from '../../src/statuses/statuses.enum';

/**
 * Integration tests for UsersService + UsersDocumentRepository
 * Tests the full flow from service through repository to in-memory MongoDB
 */
describe('UsersService Integration', () => {
  let service: UsersService;
  let userModel: PaginateModel<UserSchemaClass>;
  let module: TestingModule;

  const mockFilesService = {
    findById: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  const mockCdpSyncService = {
    syncUser: jest.fn().mockResolvedValue(null),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: UserSchemaClass.name, schema: UserSchema },
        ]),
      ],
      providers: [
        UsersService,
        UsersDocumentRepository,
        { provide: UserRepository, useExisting: UsersDocumentRepository },
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
    userModel = module.get<PaginateModel<UserSchemaClass>>(
      getModelToken(UserSchemaClass.name),
    );
  }, 60000);

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });

  beforeEach(async () => {
    await userModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('create user flow', () => {
    it('should create user and persist to database', async () => {
      const createDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const user = await service.create(createDto);

      // Verify returned user
      expect(user.id).toBeDefined();
      expect(user.email).toBe(createDto.email);
      expect(user.firstName).toBe(createDto.firstName);

      // Verify persisted to database
      const dbUser = await userModel.findById(user.id);
      expect(dbUser).not.toBeNull();
      expect(dbUser?.email).toBe(createDto.email);

      // Verify password was hashed
      expect(dbUser?.password).not.toBe(createDto.password);
      expect(dbUser?.password?.startsWith('$2')).toBe(true); // bcrypt hash
    });

    it('should prevent duplicate email across full stack', async () => {
      const email = 'duplicate@example.com';

      await service.create({
        firstName: 'First',
        lastName: 'User',
        email,
      });

      await expect(
        service.create({
          firstName: 'Second',
          lastName: 'User',
          email,
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      // Verify only one user in database
      const count = await userModel.countDocuments({});
      expect(count).toBe(1);
    });

    it('should prevent duplicate phone across full stack', async () => {
      const phone = '+84901234567';

      await service.create({
        firstName: 'First',
        lastName: 'User',
        phone,
      });

      await expect(
        service.create({
          firstName: 'Second',
          lastName: 'User',
          phone,
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    });

    it('should trigger CDP sync after creation', async () => {
      const user = await service.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'cdp-test@example.com',
      });

      // Wait for async CDP sync
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockCdpSyncService.syncUser).toHaveBeenCalledWith(
        expect.objectContaining({ id: user.id }),
      );
    });
  });

  describe('find user flow', () => {
    it('should find user by id through service and repository', async () => {
      const created = await service.create({
        firstName: 'Find',
        lastName: 'Me',
        email: 'findme@example.com',
      });

      const found = await service.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.email).toBe('findme@example.com');
    });

    it('should find user by email through full stack', async () => {
      const email = 'byemail@example.com';
      await service.create({
        firstName: 'By',
        lastName: 'Email',
        email,
      });

      const found = await service.findByEmail(email);

      expect(found).not.toBeNull();
      expect(found?.email).toBe(email);
    });

    it('should find user by phone through full stack', async () => {
      const phone = '+84999888777';
      await service.create({
        firstName: 'By',
        lastName: 'Phone',
        phone,
      });

      const found = await service.findByPhone(phone);

      expect(found).not.toBeNull();
      expect(found?.phone).toBe(phone);
    });

    it('should find user by social provider through full stack', async () => {
      const socialId = 'google-12345';
      await service.create({
        firstName: 'Social',
        lastName: 'User',
        email: 'social@example.com',
        provider: AuthProvidersEnum.google,
        socialId,
      });

      const found = await service.findBySocialIdAndProvider({
        socialId,
        provider: AuthProvidersEnum.google,
      });

      expect(found).not.toBeNull();
      expect(found?.socialId).toBe(socialId);
    });

    it('should find multiple users by ids', async () => {
      const user1 = await service.create({
        firstName: 'User',
        lastName: 'One',
        email: 'user1@example.com',
      });
      const user2 = await service.create({
        firstName: 'User',
        lastName: 'Two',
        email: 'user2@example.com',
      });
      await service.create({
        firstName: 'User',
        lastName: 'Three',
        email: 'user3@example.com',
      });

      const found = await service.findByIds([user1.id, user2.id]);

      expect(found).toHaveLength(2);
      expect(found.map((u) => u.id)).toContain(user1.id);
      expect(found.map((u) => u.id)).toContain(user2.id);
    });
  });

  describe('pagination flow', () => {
    beforeEach(async () => {
      for (let i = 0; i < 25; i++) {
        await service.create({
          firstName: `User`,
          lastName: `Number${i}`,
          email: `user${i}@example.com`,
        });
      }
    });

    it('should return paginated users through full stack', async () => {
      const result = await service.findManyWithPagination({
        paginationOptions: { page: 1, limit: 10 },
      });

      expect(result.docs).toHaveLength(10);
      expect(result.totalDocs).toBe(25);
      expect(result.totalPages).toBe(3);
      expect(result.hasNextPage).toBe(true);
    });

    it('should return correct page through full stack', async () => {
      const page1 = await service.findManyWithPagination({
        paginationOptions: { page: 1, limit: 10 },
        sortOptions: [{ orderBy: 'email', order: 'asc' }],
      });

      const page2 = await service.findManyWithPagination({
        paginationOptions: { page: 2, limit: 10 },
        sortOptions: [{ orderBy: 'email', order: 'asc' }],
      });

      // Pages should have different users
      const page1Ids = page1.docs.map((u) => u.id);
      const page2Ids = page2.docs.map((u) => u.id);

      const overlap = page1Ids.filter((id) => page2Ids.includes(id));
      expect(overlap).toHaveLength(0);
    });

    it('should apply sorting through full stack', async () => {
      const result = await service.findManyWithPagination({
        sortOptions: [{ orderBy: 'email', order: 'asc' }],
        paginationOptions: { page: 1, limit: 5 },
      });

      // Emails should be in alphabetical order
      const emails = result.docs.map((u) => u.email);
      const sortedEmails = [...emails].sort();
      expect(emails).toEqual(sortedEmails);
    });
  });

  describe('update user flow', () => {
    it('should update user and persist changes', async () => {
      const created = await service.create({
        firstName: 'Original',
        lastName: 'Name',
        email: 'original@example.com',
      });

      const updated = await service.update(created.id, {
        firstName: 'Updated',
        lastName: 'Person',
      });

      expect(updated?.firstName).toBe('Updated');
      expect(updated?.lastName).toBe('Person');

      // Verify persisted to database
      const dbUser = await userModel.findById(created.id);
      expect(dbUser?.firstName).toBe('Updated');
    });

    it('should hash new password on update', async () => {
      const created = await service.create({
        firstName: 'Password',
        lastName: 'Test',
        email: 'password@example.com',
        password: 'original-password',
      });

      const originalHash = (await userModel.findById(created.id))?.password;

      await service.update(created.id, {
        password: 'new-password',
      });

      const newHash = (await userModel.findById(created.id))?.password;

      expect(newHash).not.toBe(originalHash);
      expect(newHash).not.toBe('new-password');
      expect(newHash?.startsWith('$2')).toBe(true);
    });

    it('should prevent updating to existing email', async () => {
      await service.create({
        firstName: 'Existing',
        lastName: 'User',
        email: 'existing@example.com',
      });

      const userToUpdate = await service.create({
        firstName: 'To',
        lastName: 'Update',
        email: 'toupdate@example.com',
      });

      await expect(
        service.update(userToUpdate.id, {
          email: 'existing@example.com',
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    });

    it('should allow updating to same email', async () => {
      const user = await service.create({
        firstName: 'Same',
        lastName: 'Email',
        email: 'same@example.com',
      });

      const updated = await service.update(user.id, {
        firstName: 'Updated',
        email: 'same@example.com',
      });

      expect(updated?.firstName).toBe('Updated');
      expect(updated?.email).toBe('same@example.com');
    });
  });

  describe('delete user flow', () => {
    it('should remove user from database', async () => {
      const created = await service.create({
        firstName: 'Delete',
        lastName: 'Me',
        email: 'deleteme@example.com',
      });

      await service.remove(created.id);

      const found = await service.findById(created.id);
      expect(found).toBeNull();

      const dbUser = await userModel.findById(created.id);
      expect(dbUser).toBeNull();
    });
  });

  describe('data integrity', () => {
    it('should maintain data consistency across service and repository', async () => {
      // Create user via service
      const created = await service.create({
        firstName: 'Integrity',
        lastName: 'Test',
        email: 'integrity@example.com',
        phone: '+84111222333',
        status: StatusEnum.active,
      });

      // Verify all data is consistent
      const viaService = await service.findById(created.id);
      const viaDb = await userModel.findById(created.id).lean();

      expect(viaService?.email).toBe(viaDb?.email);
      expect(viaService?.phone).toBe(viaDb?.phone);
      expect(viaService?.firstName).toBe(viaDb?.firstName);
      expect(viaService?.status).toBe(viaDb?.status);
    });

    it('should properly map domain entity through all layers', async () => {
      const created = await service.create({
        firstName: 'Mapper',
        lastName: 'Test',
        email: 'mapper@example.com',
        provider: AuthProvidersEnum.email,
      });

      // User returned from create should have all expected fields
      expect(created.id).toBeDefined();
      expect(created.createdAt).toBeInstanceOf(Date);
      expect(created.updatedAt).toBeInstanceOf(Date);
      expect(created.provider).toBe(AuthProvidersEnum.email);

      // User found by ID should match
      const found = await service.findById(created.id);
      expect(found?.id).toBe(created.id);
      expect(found?.email).toBe(created.email);
    });
  });
});
