import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../../../../src/test/mongo-test.module';
import { CartDocumentRepository } from '../../../../src/shop/cart/model/cart.repository';
import {
  CartSchemaClass,
  CartSchema,
} from '../../../../src/shop/cart/model/cart.schema';
import { Cart, CartItem } from '../../../../src/shop/cart/domain/cart';

describe('CartDocumentRepository', () => {
  let repository: CartDocumentRepository;
  let cartModel: Model<CartSchemaClass>;
  let module: TestingModule;

  const createTestCart = (
    overrides: Partial<Cart> = {},
  ): Omit<Cart, 'id' | 'createdAt' | 'updatedAt'> => {
    return {
      sessionId: `session-${Date.now()}`,
      userId: null,
      items: [],
      comboInstances: [],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      ...overrides,
    } as Omit<Cart, 'id' | 'createdAt' | 'updatedAt'>;
  };

  const createTestItem = (overrides: Partial<CartItem> = {}): CartItem => {
    return {
      productId: '507f1f77bcf86cd799439011',
      variantId: null,
      code: 'PROD-001',
      name: 'Test Product',
      image: 'http://example.com/image.jpg',
      price: 100000,
      quantity: 1,
      comboInstanceId: null,
      ...overrides,
    } as CartItem;
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: CartSchemaClass.name, schema: CartSchema },
        ]),
      ],
      providers: [CartDocumentRepository],
    }).compile();

    repository = module.get<CartDocumentRepository>(CartDocumentRepository);
    cartModel = module.get<Model<CartSchemaClass>>(
      getModelToken(CartSchemaClass.name),
    );
  }, 60000);

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });

  beforeEach(async () => {
    await cartModel.deleteMany({});
  });

  describe('create', () => {
    it('should create a cart and return domain entity with id', async () => {
      const cartData = createTestCart();

      const result = await repository.create(cartData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.sessionId).toBe(cartData.sessionId);
      expect(result.items).toHaveLength(0);
    });

    it('should create cart with items', async () => {
      const cartData = createTestCart({
        items: [createTestItem(), createTestItem({ code: 'PROD-002' })],
      });

      const result = await repository.create(cartData);

      expect(result.items).toHaveLength(2);
    });

    it('should persist cart to database', async () => {
      const cartData = createTestCart();

      const created = await repository.create(cartData);
      const found = await cartModel.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.sessionId).toBe(cartData.sessionId);
    });
  });

  describe('findById', () => {
    it('should find cart by id', async () => {
      const cartData = createTestCart();
      const created = await repository.create(cartData);

      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.sessionId).toBe(cartData.sessionId);
    });

    it('should return null when cart not found', async () => {
      const found = await repository.findById('507f1f77bcf86cd799439011');

      expect(found).toBeNull();
    });
  });

  describe('findBySessionId', () => {
    it('should find cart by session id', async () => {
      const sessionId = 'unique-session-123';
      await repository.create(createTestCart({ sessionId }));

      const found = await repository.findBySessionId(sessionId);

      expect(found).not.toBeNull();
      expect(found?.sessionId).toBe(sessionId);
    });

    it('should return null when session not found', async () => {
      const found = await repository.findBySessionId('non-existent');

      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find cart by user id', async () => {
      const userId = '507f1f77bcf86cd799439099';
      await repository.create(createTestCart({ userId }));

      const found = await repository.findByUserId(userId);

      expect(found).not.toBeNull();
      expect(found?.userId).toBe(userId);
    });

    it('should return null when user has no cart', async () => {
      const found = await repository.findByUserId('507f1f77bcf86cd799439099');

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update cart items', async () => {
      const created = await repository.create(createTestCart());

      const newItems = [
        createTestItem({ quantity: 2 }),
        createTestItem({ code: 'PROD-002', price: 200000 }),
      ];

      const updated = await repository.update(created.id, { items: newItems });

      expect(updated?.items).toHaveLength(2);
      expect(updated?.items[0].quantity).toBe(2);
    });

    it('should update userId', async () => {
      const created = await repository.create(createTestCart());
      const userId = '507f1f77bcf86cd799439099';

      const updated = await repository.update(created.id, { userId });

      expect(updated?.userId).toBe(userId);
    });

    it('should update expiresAt', async () => {
      const created = await repository.create(createTestCart());
      const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const updated = await repository.update(created.id, {
        expiresAt: newExpiry,
      });

      expect(updated?.expiresAt).toEqual(newExpiry);
    });

    it('should return null when cart not found', async () => {
      const result = await repository.update('507f1f77bcf86cd799439011', {
        items: [],
      });

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete cart from database', async () => {
      const created = await repository.create(createTestCart());

      await repository.remove(created.id);
      const found = await repository.findById(created.id);

      expect(found).toBeNull();
    });
  });

  describe('removeExpired', () => {
    it('should remove expired carts', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await repository.create(
        createTestCart({ sessionId: 'expired-1', expiresAt: yesterday }),
      );
      await repository.create(
        createTestCart({ sessionId: 'expired-2', expiresAt: yesterday }),
      );
      await repository.create(
        createTestCart({ sessionId: 'valid', expiresAt: tomorrow }),
      );

      const removedCount = await repository.removeExpired();

      expect(removedCount).toBe(2);

      const remaining = await cartModel.find({});
      expect(remaining).toHaveLength(1);
      expect(remaining[0].sessionId).toBe('valid');
    });

    it('should return 0 when no expired carts', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await repository.create(createTestCart({ expiresAt: tomorrow }));

      const removedCount = await repository.removeExpired();

      expect(removedCount).toBe(0);
    });
  });

  describe('mergeGuestCartToUser', () => {
    it('should merge guest cart items to existing user cart', async () => {
      const guestSessionId = 'guest-session';
      const userId = '507f1f77bcf86cd799439099';

      // Create guest cart with items
      await repository.create(
        createTestCart({
          sessionId: guestSessionId,
          items: [createTestItem({ productId: '507f1f77bcf86cd799439001' })],
        }),
      );

      // Create user cart with different items
      await repository.create(
        createTestCart({
          sessionId: 'user-session',
          userId,
          items: [createTestItem({ productId: '507f1f77bcf86cd799439002' })],
        }),
      );

      const merged = await repository.mergeGuestCartToUser(
        guestSessionId,
        userId,
      );

      expect(merged?.items).toHaveLength(2);
      expect(merged?.userId).toBe(userId);
    });

    it('should add quantities when same product exists', async () => {
      const guestSessionId = 'guest-session';
      const userId = '507f1f77bcf86cd799439099';
      const productId = '507f1f77bcf86cd799439001';

      // Create guest cart with item quantity 3
      await repository.create(
        createTestCart({
          sessionId: guestSessionId,
          items: [createTestItem({ productId, quantity: 3 })],
        }),
      );

      // Create user cart with same item quantity 2
      await repository.create(
        createTestCart({
          sessionId: 'user-session',
          userId,
          items: [createTestItem({ productId, quantity: 2 })],
        }),
      );

      const merged = await repository.mergeGuestCartToUser(
        guestSessionId,
        userId,
      );

      expect(merged?.items).toHaveLength(1);
      expect(merged?.items[0].quantity).toBe(5);
    });

    it('should convert guest cart to user cart when user has no cart', async () => {
      const guestSessionId = 'guest-session';
      const userId = '507f1f77bcf86cd799439099';

      const guestCart = await repository.create(
        createTestCart({
          sessionId: guestSessionId,
          items: [createTestItem()],
        }),
      );

      const merged = await repository.mergeGuestCartToUser(
        guestSessionId,
        userId,
      );

      expect(merged?.id).toBe(guestCart.id);
      expect(merged?.userId).toBe(userId);
      expect(merged?.expiresAt).toBeNull();
    });

    it('should return existing user cart when guest cart is empty', async () => {
      const guestSessionId = 'guest-session';
      const userId = '507f1f77bcf86cd799439099';

      await repository.create(
        createTestCart({ sessionId: guestSessionId, items: [] }),
      );

      const userCart = await repository.create(
        createTestCart({
          sessionId: 'user-session',
          userId,
          items: [createTestItem()],
        }),
      );

      const result = await repository.mergeGuestCartToUser(
        guestSessionId,
        userId,
      );

      expect(result?.id).toBe(userCart.id);
    });

    it('should return user cart when guest cart does not exist', async () => {
      const userId = '507f1f77bcf86cd799439099';

      const userCart = await repository.create(
        createTestCart({
          sessionId: 'user-session',
          userId,
          items: [createTestItem()],
        }),
      );

      const result = await repository.mergeGuestCartToUser(
        'non-existent-session',
        userId,
      );

      expect(result?.id).toBe(userCart.id);
    });

    it('should delete guest cart after merging to different user cart', async () => {
      const guestSessionId = 'guest-session';
      const userId = '507f1f77bcf86cd799439099';

      await repository.create(
        createTestCart({
          sessionId: guestSessionId,
          items: [createTestItem({ productId: '507f1f77bcf86cd799439001' })],
        }),
      );

      await repository.create(
        createTestCart({
          sessionId: 'user-session',
          userId,
          items: [createTestItem({ productId: '507f1f77bcf86cd799439002' })],
        }),
      );

      await repository.mergeGuestCartToUser(guestSessionId, userId);

      const guestCart = await repository.findBySessionId(guestSessionId);
      expect(guestCart).toBeNull();
    });
  });

  describe('unique sessionId constraint', () => {
    it('should enforce unique sessionId', async () => {
      await repository.create(createTestCart({ sessionId: 'unique-session' }));

      await expect(
        repository.create(createTestCart({ sessionId: 'unique-session' })),
      ).rejects.toThrow();
    });
  });
});
