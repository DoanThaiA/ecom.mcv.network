import { HttpException, HttpStatus } from '@nestjs/common';

export interface RateLimitData {
  lockedSeconds: number;
  unlockedAt: number;
}

export class NhanhRateLimitException extends HttpException {
  public readonly rateLimitData: RateLimitData;

  constructor(message: string, rateLimitData: RateLimitData) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message,
        error: 'Too Many Requests',
        rateLimitData,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
    this.rateLimitData = rateLimitData;
  }

  getWaitTimeMs(): number {
    const now = Math.floor(Date.now() / 1000);
    const waitSeconds = Math.max(0, this.rateLimitData.unlockedAt - now);
    // Add 2 second padding to be safe
    return (waitSeconds + 2) * 1000;
  }
}
