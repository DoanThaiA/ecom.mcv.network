import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';

/**
 * Socket module for real-time WebSocket notifications
 *
 * Marked as @Global() so SocketService can be injected anywhere
 * without needing to import SocketModule in every module
 */
@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [SocketService, SocketGateway],
  exports: [SocketService],
})
export class SocketModule {}
