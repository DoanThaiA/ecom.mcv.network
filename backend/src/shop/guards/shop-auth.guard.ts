import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { AllConfigType } from '../../config/config.type';
import { throwException } from '../../utils/errors/throw-exception';

/**
 * Shop customer context attached to request
 */
export interface ShopCustomer {
  /** User ID (if authenticated) */
  userId?: string;
  /** Session ID (always present) */
  sessionId: string;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
}

/**
 * Guard that handles both authenticated (JWT) and anonymous (session-based) users
 *
 * For authenticated users:
 * - Extracts and verifies JWT from Authorization header
 * - Sets userId and sessionId from JWT payload
 *
 * For anonymous users:
 * - Requires x-session-id header
 * - Sets only sessionId
 *
 * Attaches ShopCustomer to request.shopCustomer
 */
@Injectable()
export class ShopAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly i18n: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Try to extract JWT token
    const authHeader = request.headers.authorization;
    const sessionIdHeader = request.headers['x-session-id'];

    if (authHeader?.startsWith('Bearer ')) {
      // Authenticated user flow
      const token = authHeader.substring(7);

      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
        });

        const shopCustomer: ShopCustomer = {
          userId: payload.id,
          sessionId: payload.sessionId || sessionIdHeader || payload.id,
          isAuthenticated: true,
        };

        request.shopCustomer = shopCustomer;
        return true;
      } catch {
        // Invalid/expired token
        throwException({
          status: HttpStatus.UNAUTHORIZED,
          message: this.i18n.t('auth.unauthorized'),
        });
      }
    }

    // Anonymous user flow - require session ID
    if (!sessionIdHeader) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shop.session.required'),
      });
    }

    const shopCustomer: ShopCustomer = {
      sessionId: sessionIdHeader,
      isAuthenticated: false,
    };

    request.shopCustomer = shopCustomer;
    return true;
  }
}
