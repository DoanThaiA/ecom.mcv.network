import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ShopCustomer } from '../guards/shop-auth.guard';

/**
 * Parameter decorator to extract ShopCustomer from request
 *
 * Usage:
 * ```typescript
 * @Get()
 * @UseGuards(ShopAuthGuard)
 * getCart(@Customer() customer: ShopCustomer) {
 *   // customer.sessionId - always available
 *   // customer.userId - available if authenticated
 *   // customer.isAuthenticated - true if JWT was valid
 * }
 * ```
 */
export const Customer = createParamDecorator(
  (data: keyof ShopCustomer | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const customer: ShopCustomer = request.shopCustomer;

    if (data) {
      return customer[data];
    }

    return customer;
  },
);

/**
 * Parameter decorator to extract client IP address from request
 *
 * Usage:
 * ```typescript
 * @Post()
 * initiatePayment(@ClientIp() clientIp: string) {
 *   // clientIp - client's IP address
 * }
 * ```
 */
export const ClientIp = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();

    // Check x-forwarded-for header (for proxied requests)
    const forwarded = request.headers?.['x-forwarded-for'];
    if (forwarded) {
      const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      return forwardedStr?.split(',')[0]?.trim() || '127.0.0.1';
    }

    return request.ip || request.connection?.remoteAddress || '127.0.0.1';
  },
);
