import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model, PaginateModel } from 'mongoose';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../../../src/test/mongo-test.module';
import { UsersDocumentRepository } from '../../../src/users/model/user.repository';
import {
  UserSchemaClass,
  UserSchema,
} from '../../../src/users/model/user.schema';
import { User } from '../../../src/users/domain/user';
import { AuthProvidersEnum } from '../../../src/auth/auth-providers.enum';
import { StatusEnum } from '../../../src/statuses/statuses.enum';

describe('UsersDocumentRepository', () => {
  let repository: UsersDocumentRepository;
  let userModel: PaginateModel<UserSchemaClass>;
  let module: TestingModule;

  const createTestUser = (overrides: Partial<User> = {}): User => {
    const user = new User();
    user.email = `test-${Date.now()}@example.com`;
    user.phone = null;
    user.firstName = 'John';
    user.lastName = 'Doe';
    user.password = 'hashed-password';
    user.provider = AuthProvidersEnum.email;
    user.socialId = null;
    user.status = StatusEnum.active;
    user.socialAccounts = [];
    user.cdpCustomerId = null;
    user.photo = null;
    user.socialAvatarUrl = null;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.deletedAt = new Date(0);
    Object.assign(user, overrides);
    return user;
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: UserSchemaClass.name, schema: UserSchema },
        ]),
      ],
      providers: [UsersDocumentRepository],
    }).compile();

    repository = module.get<UsersDocumentRepository>(UsersDocumentRepository);
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
  });

  describe('create', () => {
    it('should create a user and return domain entity with id', async () => {
      const userData = createTestUser();

      const result = await repository.create(userData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.firstName).toBe(userData.firstName);
      expect(result.lastName).toBe(userData.lastName);
      expect(result.provider).toBe(AuthProvidersEnum.email);
    });

    it('should persist user to database', async () => {
      const userData = createTestUser();

      const created = await repository.create(userData);
      const found = await userModel.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.email).toBe(userData.email);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const userData = createTestUser();
      const created = await repository.create(userData);

      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.email).toBe(userData.email);
    });

    it('should return null when user not found', async () => {
      const found = await repository.findById('507f1f77bcf86cd799439011');

      expect(found).toBeNull();
    });
  });

  describe('findByIds', () => {
    it('should find multiple users by ids', async () => {
      const user1 = await repository.create(
        createTestUser({ email: 'user1@test.com' }),
      );
      const user2 = await repository.create(
        createTestUser({ email: 'user2@test.com' }),
      );
      await repository.create(createTestUser({ email: 'user3@test.com' }));

      const found = await repository.findByIds([user1.id, user2.id]);

      expect(found).toHaveLength(2);
      expect(found.map((u) => u.id)).toContain(user1.id);
      expect(found.map((u) => u.id)).toContain(user2.id);
    });

    it('should return empty array when no users found', async () => {
      const found = await repository.findByIds(['507f1f77bcf86cd799439011']);

      expect(found).toEqual([]);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userData = createTestUser({ email: 'findme@test.com' });
      await repository.create(userData);

      const found = await repository.findByEmail('findme@test.com');

      expect(found).not.toBeNull();
      expect(found?.email).toBe('findme@test.com');
    });

    it('should return null when email not found', async () => {
      const found = await repository.findByEmail('nonexistent@test.com');

      expect(found).toBeNull();
    });

    it('should return null for null email', async () => {
      const found = await repository.findByEmail(null as any);

      expect(found).toBeNull();
    });
  });

  describe('findByPhone', () => {
    it('should find user by phone', async () => {
      const userData = createTestUser({
        email: null,
        phone: '+84901234567',
      });
      await repository.create(userData);

      const found = await repository.findByPhone('+84901234567');

      expect(found).not.toBeNull();
      expect(found?.phone).toBe('+84901234567');
    });

    it('should return null when phone not found', async () => {
      const found = await repository.findByPhone('+84999999999');

      expect(found).toBeNull();
    });

    it('should return null for null phone', async () => {
      const found = await repository.findByPhone(null as any);

      expect(found).toBeNull();
    });
  });

  describe('findBySocialIdAndProvider', () => {
    it('should find user by social id and provider', async () => {
      const userData = createTestUser({
        socialId: 'google-123',
        provider: AuthProvidersEnum.google,
      });
      await repository.create(userData);

      const found = await repository.findBySocialIdAndProvider({
        socialId: 'google-123',
        provider: AuthProvidersEnum.google,
      });

      expect(found).not.toBeNull();
      expect(found?.socialId).toBe('google-123');
      expect(found?.provider).toBe(AuthProvidersEnum.google);
    });

    it('should return null when not found', async () => {
      const found = await repository.findBySocialIdAndProvider({
        socialId: 'nonexistent',
        provider: AuthProvidersEnum.google,
      });

      expect(found).toBeNull();
    });

    it('should return null for null socialId', async () => {
      const found = await repository.findBySocialIdAndProvider({
        socialId: null,
        provider: AuthProvidersEnum.google,
      });

      expect(found).toBeNull();
    });
  });

  describe('findManyWithPagination', () => {
    beforeEach(async () => {
      // Create test users
      for (let i = 0; i < 15; i++) {
        await repository.create(
          createTestUser({
            email: `user${i}@test.com`,
            firstName: `User${i}`,
          }),
        );
      }
    });

    it('should return paginated results', async () => {
      const result = await repository.findManyWithPagination({
        paginationOptions: { page: 1, limit: 10 },
      });

      expect(result.docs).toHaveLength(10);
      expect(result.totalDocs).toBe(15);
      expect(result.totalPages).toBe(2);
      expect(result.page).toBe(1);
      expect(result.hasNextPage).toBe(true);
    });

    it('should return second page', async () => {
      const result = await repository.findManyWithPagination({
        paginationOptions: { page: 2, limit: 10 },
      });

      expect(result.docs).toHaveLength(5);
      expect(result.page).toBe(2);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPrevPage).toBe(true);
    });

    it('should apply sorting', async () => {
      const result = await repository.findManyWithPagination({
        sortOptions: [{ orderBy: 'firstName', order: 'asc' }],
        paginationOptions: { page: 1, limit: 5 },
      });

      expect(result.docs[0].firstName).toBe('User0');
      expect(result.docs[1].firstName).toBe('User1');
    });

    it('should filter by date range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const result = await repository.findManyWithPagination({
        filterOptions: {
          createdAtFrom: yesterday,
          createdAtTo: tomorrow,
        },
        paginationOptions: { page: 1, limit: 20 },
      });

      expect(result.totalDocs).toBe(15);
    });
  });

  describe('update', () => {
    it('should update user and return updated entity', async () => {
      const created = await repository.create(createTestUser());

      const updated = await repository.update(created.id, {
        firstName: 'Updated',
        lastName: 'Name',
      });

      expect(updated).not.toBeNull();
      expect(updated?.firstName).toBe('Updated');
      expect(updated?.lastName).toBe('Name');
      expect(updated?.email).toBe(created.email);
    });

    it('should persist updates to database', async () => {
      const created = await repository.create(createTestUser());

      await repository.update(created.id, { firstName: 'Persisted' });
      const found = await repository.findById(created.id);

      expect(found?.firstName).toBe('Persisted');
    });

    it('should return null when user not found', async () => {
      const result = await repository.update('507f1f77bcf86cd799439011', {
        firstName: 'Test',
      });

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete user from database', async () => {
      const created = await repository.create(createTestUser());

      await repository.remove(created.id);
      const found = await repository.findById(created.id);

      expect(found).toBeNull();
    });

    it('should not throw when deleting non-existent user', async () => {
      await expect(
        repository.remove('507f1f77bcf86cd799439011'),
      ).resolves.toBeUndefined();
    });
  });

  describe('unique indexes', () => {
    it('should enforce unique email constraint', async () => {
      await repository.create(createTestUser({ email: 'unique@test.com' }));

      await expect(
        repository.create(createTestUser({ email: 'unique@test.com' })),
      ).rejects.toThrow();
    });

    it('should enforce unique phone constraint', async () => {
      await repository.create(
        createTestUser({ email: null, phone: '+84901111111' }),
      );

      await expect(
        repository.create(
          createTestUser({ email: null, phone: '+84901111111' }),
        ),
      ).rejects.toThrow();
    });
  });
});
