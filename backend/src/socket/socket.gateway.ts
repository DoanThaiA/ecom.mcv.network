import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { SocketService } from './socket.service';
import { getUserRoom, getSessionRoom } from './socket.utils';

/**
 * Extended socket with customer context
 */
export interface AuthenticatedSocket extends Socket {
  customer: {
    userId?: string;
    sessionId: string;
    isAuthenticated: boolean;
  };
}

/**
 * WebSocket Gateway for real-time shop refetch notifications
 *
 * Supports:
 * - JWT authenticated users (joins both user and session rooms)
 * - Guest users via sessionId (joins session room only)
 *
 * Events emitted:
 * - order:refetch - notify client to refetch order data
 * - cart:refetch - notify client to refetch cart data
 */
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/shop',
  transports: ['websocket', 'polling'],
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly socketService: SocketService,
  ) {}

  afterInit(server: Server): void {
    // Inject server instance into SocketService
    this.socketService.setServer(server);
    this.logger.log('WebSocket Gateway initialized on namespace /shop');
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const customer = await this.authenticateClient(client);
      client.customer = customer;

      // Join session room (all clients)
      const sessionRoom = getSessionRoom(customer.sessionId);
      await client.join(sessionRoom);
      this.logger.debug(
        `Client ${client.id} joined session room: ${sessionRoom}`,
      );

      // If authenticated, also join user room
      if (customer.isAuthenticated && customer.userId) {
        const userRoom = getUserRoom(customer.userId);
        await client.join(userRoom);
        this.logger.debug(`Client ${client.id} joined user room: ${userRoom}`);
      }

      this.logger.log(
        `Client connected: ${client.id} (${customer.isAuthenticated ? 'authenticated' : 'guest'})`,
      );
    } catch (error) {
      this.logger.warn(
        `Client ${client.id} connection rejected: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      client.emit('connection:error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Authenticate client from handshake data
   * Supports both JWT token and sessionId-only (guest) authentication
   */
  private async authenticateClient(client: Socket): Promise<{
    userId?: string;
    sessionId: string;
    isAuthenticated: boolean;
  }> {
    const handshake = client.handshake;
    const token =
      (handshake.auth?.token as string) || (handshake.query?.token as string);
    const sessionId =
      (handshake.auth?.sessionId as string) ||
      (handshake.query?.sessionId as string);

    // Try JWT authentication first
    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
        });

        return {
          userId: payload.id,
          sessionId: payload.sessionId || sessionId || payload.id,
          isAuthenticated: true,
        };
      } catch {
        // Invalid token - fall through to guest flow
        this.logger.debug('Invalid JWT token, falling back to guest session');
      }
    }

    // Guest user flow - require sessionId
    if (!sessionId) {
      throw new Error('Session ID required for guest connections');
    }

    return {
      sessionId,
      isAuthenticated: false,
    };
  }

  /**
   * Health check ping/pong
   */
  @SubscribeMessage('ping')
  handlePing(): { event: string; data: string } {
    return { event: 'pong', data: 'ok' };
  }
}
