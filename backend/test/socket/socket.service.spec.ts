import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { SocketService } from '../../src/socket/socket.service';
import { SocketEvents } from '../../src/socket/socket.events';

describe('SocketService', () => {
  let service: SocketService;
  let mockServer: jest.Mocked<Server>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocketService],
    }).compile();

    service = module.get<SocketService>(SocketService);

    // Create mock Socket.io server
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;

    // Suppress logger output in tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setServer', () => {
    it('should set the Socket.io server instance', () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      service.setServer(mockServer);

      expect(logSpy).toHaveBeenCalledWith('Socket.io server instance set');
    });

    it('should allow setting server multiple times', () => {
      const server1 = { to: jest.fn() } as any;
      const server2 = { to: jest.fn() } as any;

      service.setServer(server1);
      service.setServer(server2);

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('notifyOrderRefetch', () => {
    const mockOrder = {
      id: 'order-123',
      orderNumber: 'ORD-001',
      userId: 'user-123',
      sessionId: 'session-456',
    };

    it('should emit order refetch to both user and session rooms when userId present', () => {
      service.setServer(mockServer);

      service.notifyOrderRefetch(mockOrder);

      // Should emit to user room
      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      // Should emit to session room
      expect(mockServer.to).toHaveBeenCalledWith('session:session-456');
      // Should emit event twice (user + session)
      expect(mockServer.emit).toHaveBeenCalledTimes(2);
      expect(mockServer.emit).toHaveBeenCalledWith(SocketEvents.ORDER_REFETCH, {
        orderId: 'order-123',
        orderNumber: 'ORD-001',
      });
    });

    it('should emit order refetch only to session room when userId is null', () => {
      service.setServer(mockServer);
      const orderWithoutUser = {
        ...mockOrder,
        userId: null,
      };

      service.notifyOrderRefetch(orderWithoutUser);

      // Should NOT emit to user room
      expect(mockServer.to).not.toHaveBeenCalledWith(
        expect.stringContaining('user:'),
      );
      // Should emit to session room
      expect(mockServer.to).toHaveBeenCalledWith('session:session-456');
      // Should emit event once (session only)
      expect(mockServer.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit order refetch only to session room when userId is undefined', () => {
      service.setServer(mockServer);
      const orderWithoutUser = {
        id: 'order-123',
        orderNumber: 'ORD-001',
        sessionId: 'session-456',
      };

      service.notifyOrderRefetch(orderWithoutUser);

      // Should emit to session room only
      expect(mockServer.to).toHaveBeenCalledWith('session:session-456');
      expect(mockServer.emit).toHaveBeenCalledTimes(1);
    });

    it('should not emit when server is not initialized', () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      service.notifyOrderRefetch(mockOrder);

      expect(mockServer.emit).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        'Socket.io server not initialized, skipping emit',
      );
    });

    it('should log debug messages for each room emission', () => {
      service.setServer(mockServer);
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');

      service.notifyOrderRefetch(mockOrder);

      expect(debugSpy).toHaveBeenCalledWith(
        'Emitted order:refetch to user room: user:user-123',
      );
      expect(debugSpy).toHaveBeenCalledWith(
        'Emitted order:refetch to session room: session:session-456',
      );
    });

    it('should log notification sent message', () => {
      service.setServer(mockServer);
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      service.notifyOrderRefetch(mockOrder);

      expect(logSpy).toHaveBeenCalledWith(
        'Order refetch notification sent for order: ORD-001',
      );
    });

    it('should emit correct payload structure', () => {
      service.setServer(mockServer);

      service.notifyOrderRefetch(mockOrder);

      expect(mockServer.emit).toHaveBeenCalledWith(SocketEvents.ORDER_REFETCH, {
        orderId: 'order-123',
        orderNumber: 'ORD-001',
      });
    });

    it('should handle orders with different order numbers', () => {
      service.setServer(mockServer);
      const order1 = { ...mockOrder, orderNumber: 'ORD-100' };
      const order2 = { ...mockOrder, orderNumber: 'ORD-200' };

      service.notifyOrderRefetch(order1);
      service.notifyOrderRefetch(order2);

      expect(mockServer.emit).toHaveBeenCalledWith(SocketEvents.ORDER_REFETCH, {
        orderId: 'order-123',
        orderNumber: 'ORD-100',
      });
      expect(mockServer.emit).toHaveBeenCalledWith(SocketEvents.ORDER_REFETCH, {
        orderId: 'order-123',
        orderNumber: 'ORD-200',
      });
    });

    it('should format user room correctly', () => {
      service.setServer(mockServer);

      service.notifyOrderRefetch(mockOrder);

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
    });

    it('should format session room correctly', () => {
      service.setServer(mockServer);

      service.notifyOrderRefetch(mockOrder);

      expect(mockServer.to).toHaveBeenCalledWith('session:session-456');
    });
  });

  describe('notifyCartRefetch', () => {
    const cartId = 'cart-789';
    const userId = 'user-123';
    const sessionId = 'session-456';

    it('should emit cart refetch to both user and session rooms when userId present', () => {
      service.setServer(mockServer);

      service.notifyCartRefetch(cartId, userId, sessionId);

      // Should emit to user room
      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      // Should emit to session room
      expect(mockServer.to).toHaveBeenCalledWith('session:session-456');
      // Should emit event twice (user + session)
      expect(mockServer.emit).toHaveBeenCalledTimes(2);
      expect(mockServer.emit).toHaveBeenCalledWith(SocketEvents.CART_REFETCH, {
        cartId: 'cart-789',
      });
    });

    it('should emit cart refetch only to session room when userId is null', () => {
      service.setServer(mockServer);

      service.notifyCartRefetch(cartId, null, sessionId);

      // Should NOT emit to user room
      expect(mockServer.to).not.toHaveBeenCalledWith(
        expect.stringContaining('user:'),
      );
      // Should emit to session room
      expect(mockServer.to).toHaveBeenCalledWith('session:session-456');
      // Should emit event once (session only)
      expect(mockServer.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit cart refetch only to session room when userId is undefined', () => {
      service.setServer(mockServer);

      service.notifyCartRefetch(cartId, undefined, sessionId);

      // Should emit to session room only
      expect(mockServer.to).toHaveBeenCalledWith('session:session-456');
      expect(mockServer.emit).toHaveBeenCalledTimes(1);
    });

    it('should not emit when server is not initialized', () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      service.notifyCartRefetch(cartId, userId, sessionId);

      expect(mockServer.emit).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        'Socket.io server not initialized, skipping emit',
      );
    });

    it('should log debug messages for each room emission', () => {
      service.setServer(mockServer);
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');

      service.notifyCartRefetch(cartId, userId, sessionId);

      expect(debugSpy).toHaveBeenCalledWith(
        'Emitted cart:refetch to user room: user:user-123',
      );
      expect(debugSpy).toHaveBeenCalledWith(
        'Emitted cart:refetch to session room: session:session-456',
      );
    });

    it('should log notification sent message', () => {
      service.setServer(mockServer);
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      service.notifyCartRefetch(cartId, userId, sessionId);

      expect(logSpy).toHaveBeenCalledWith(
        'Cart refetch notification sent for cart: cart-789',
      );
    });

    it('should emit correct payload structure', () => {
      service.setServer(mockServer);

      service.notifyCartRefetch(cartId, userId, sessionId);

      expect(mockServer.emit).toHaveBeenCalledWith(SocketEvents.CART_REFETCH, {
        cartId: 'cart-789',
      });
    });

    it('should handle different cart IDs', () => {
      service.setServer(mockServer);

      service.notifyCartRefetch('cart-001', userId, sessionId);
      service.notifyCartRefetch('cart-002', userId, sessionId);

      expect(mockServer.emit).toHaveBeenCalledWith(SocketEvents.CART_REFETCH, {
        cartId: 'cart-001',
      });
      expect(mockServer.emit).toHaveBeenCalledWith(SocketEvents.CART_REFETCH, {
        cartId: 'cart-002',
      });
    });

    it('should format user room correctly', () => {
      service.setServer(mockServer);

      service.notifyCartRefetch(cartId, userId, sessionId);

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
    });

    it('should format session room correctly', () => {
      service.setServer(mockServer);

      service.notifyCartRefetch(cartId, userId, sessionId);

      expect(mockServer.to).toHaveBeenCalledWith('session:session-456');
    });

    it('should handle empty string userId as falsy', () => {
      service.setServer(mockServer);

      service.notifyCartRefetch(cartId, '', sessionId);

      // Empty string is falsy, should only emit to session
      expect(mockServer.emit).toHaveBeenCalledTimes(1);
      expect(mockServer.to).toHaveBeenCalledWith('session:session-456');
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple notifications in sequence', () => {
      service.setServer(mockServer);

      service.notifyOrderRefetch({
        id: 'order-1',
        orderNumber: 'ORD-1',
        userId: 'user-1',
        sessionId: 'session-1',
      });

      service.notifyCartRefetch('cart-1', 'user-1', 'session-1');

      service.notifyOrderRefetch({
        id: 'order-2',
        orderNumber: 'ORD-2',
        userId: 'user-2',
        sessionId: 'session-2',
      });

      // 3 notifications, 2 emissions each (user + session)
      expect(mockServer.emit).toHaveBeenCalledTimes(6);
    });

    it('should allow re-setting server after initialization', () => {
      const server1 = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as any;
      const server2 = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as any;

      service.setServer(server1);
      service.notifyCartRefetch('cart-1', 'user-1', 'session-1');

      expect(server1.emit).toHaveBeenCalled();
      expect(server2.emit).not.toHaveBeenCalled();

      // Reset with new server
      service.setServer(server2);
      service.notifyCartRefetch('cart-2', 'user-2', 'session-2');

      expect(server2.emit).toHaveBeenCalled();
    });

    it('should handle guest user and authenticated user notifications differently', () => {
      service.setServer(mockServer);

      // Guest user (no userId)
      service.notifyCartRefetch('cart-guest', undefined, 'session-guest');
      const guestEmissions = mockServer.emit.mock.calls.length;

      jest.clearAllMocks();

      // Authenticated user
      service.notifyCartRefetch('cart-auth', 'user-auth', 'session-auth');
      const authEmissions = mockServer.emit.mock.calls.length;

      // Authenticated should have more emissions (user + session)
      expect(authEmissions).toBeGreaterThan(guestEmissions);
      expect(guestEmissions).toBe(1); // session only
      expect(authEmissions).toBe(2); // user + session
    });
  });
});
