import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { SessionService } from '../../session/session.service';
import { JwtRefreshPayloadType } from '../strategies/types/jwt-refresh-payload.type';
import { User } from '../../users/domain/user';

@Injectable()
export class AccountService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Soft deletes user account
   */
  async softDelete(user: User): Promise<void> {
    await this.usersService.remove(user.id);
  }

  /**
   * Logs out user by deleting session
   */
  async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>) {
    return this.sessionService.deleteById(data.sessionId);
  }
}
