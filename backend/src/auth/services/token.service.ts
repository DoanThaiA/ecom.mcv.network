import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import ms from 'ms';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { AllConfigType } from '../../config/config.type';
import { SessionService } from '../../session/session.service';
import { UsersService } from '../../users/users.service';
import { JwtRefreshPayloadType } from '../strategies/types/jwt-refresh-payload.type';
import { LoginResponseDto } from '../dto/login-response.dto';
import { User } from '../../users/domain/user';
import { Session } from '../../session/domain/session';
import { throwException } from '../../utils/errors/throw-exception';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly sessionService: SessionService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Generates JWT access token and refresh token for a user session
   */
  async getTokensData(data: {
    id: User['id'];
    sessionId: Session['id'];
    hash: Session['hash'];
  }): Promise<{
    token: string;
    refreshToken: string;
    tokenExpires: number;
  }> {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  /**
   * Refreshes access token using refresh token
   */
  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sessionId' | 'hash'>,
  ): Promise<Omit<LoginResponseDto, 'user'>> {
    const session = await this.sessionService.findById(data.sessionId);

    if (!session) {
      throwException({
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    if (session.hash !== data.hash) {
      throwException({
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const user = await this.usersService.findById(session.user.id);

    if (!user) {
      throwException({
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    await this.sessionService.update(session.id, {
      hash,
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: session.user.id,
      sessionId: session.id,
      hash,
    });

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }
}
