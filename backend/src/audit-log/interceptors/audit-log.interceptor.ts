import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  AUDIT_LOG_KEY,
  AuditLogOptions,
} from '../decorators/audit-log.decorator';
import { AuditLogService } from '../audit-log.service';
import { AuditLogStatus } from '../domain/audit-log-status.enum';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../utils/env';

/**
 * Default sensitive fields to redact from input
 */
const DEFAULT_SENSITIVE_FIELDS = [
  'password',
  'oldPassword',
  'newPassword',
  'accessToken',
  'refreshToken',
  'token',
  'secret',
  'apiKey',
  'apiSecret',
  'accessCode',
];

/**
 * Maximum output size in characters before truncation
 */
const MAX_OUTPUT_SIZE = 10000;

/**
 * Interceptor that handles audit logging for decorated controller methods
 *
 * - Reads metadata from @AuditLog() decorator
 * - Captures request context (user, IP, user agent, etc.)
 * - Logs success/failure asynchronously (fire-and-forget)
 * - Redacts sensitive fields from input
 * - Truncates large outputs
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Get metadata from handler or class
    const options = this.reflector.getAllAndOverride<AuditLogOptions>(
      AUDIT_LOG_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no @AuditLog decorator, skip logging
    if (!options) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();
    const requestId = uuidv4();

    // Extract user info from request (set by JWT strategy)
    const user = request.user;
    const userId = user?.id?.toString() ?? null;
    const userEmail = user?.email ?? null;
    const userType = this.determineUserType(request);

    // Capture request input if enabled (default: true)
    const shouldCaptureInput = options.captureInput !== false;
    const input = shouldCaptureInput
      ? this.sanitizeInput(
          {
            body: request.body,
            params: request.params,
            query: request.query,
          },
          options.sensitiveFields,
        )
      : undefined;

    // Build base log entry
    const baseLogEntry = {
      action: options.action,
      category: options.category,
      description: options.description,
      userId,
      userEmail,
      userType,
      httpMethod: request.method,
      endpoint: request.originalUrl || request.url,
      ipAddress: this.getClientIp(request),
      userAgent: request.headers['user-agent'],
      requestId,
      input,
    };

    return next.handle().pipe(
      tap((response) => {
        // Success case - log asynchronously
        const durationMs = Date.now() - startTime;

        this.auditLogService
          .create({
            ...baseLogEntry,
            status: AuditLogStatus.SUCCESS,
            output: options.captureOutput
              ? this.sanitizeOutput(response)
              : undefined,
            durationMs,
          })
          .catch((err) => {
            this.logger.error(`Failed to save audit log: ${err.message}`);
          });
      }),
      catchError((error) => {
        // Failure case - log asynchronously
        const durationMs = Date.now() - startTime;

        this.auditLogService
          .create({
            ...baseLogEntry,
            status: AuditLogStatus.FAILURE,
            error: {
              message: error.message,
              name: error.name,
              stack:
                env.NODE_ENV !== 'production' && env.NODE_ENV !== 'internal'
                  ? error.stack
                  : undefined,
            },
            durationMs,
          })
          .catch((err) => {
            this.logger.error(`Failed to save audit log: ${err.message}`);
          });

        return throwError(() => error);
      }),
    );
  }

  /**
   * Determine user type based on request context
   */
  private determineUserType(request: unknown): 'cms' | 'system' {
    const req = request as {
      user?: { permissionGroup?: unknown; id?: unknown };
    };
    // Check if CMS user (has permissionGroup from jwt-cms strategy)
    if (req.user?.permissionGroup !== undefined) {
      return 'cms';
    }
    return 'system';
  }

  /**
   * Get client IP address from request
   */
  private getClientIp(request: unknown): string | undefined {
    const req = request as {
      headers?: Record<string, string | string[] | undefined>;
      ip?: string;
      connection?: { remoteAddress?: string };
    };
    const forwarded = req.headers?.['x-forwarded-for'];
    if (forwarded) {
      const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      return forwardedStr?.split(',')[0]?.trim();
    }
    return req.ip || req.connection?.remoteAddress;
  }

  /**
   * Sanitize input by redacting sensitive fields
   */
  private sanitizeInput(
    input: Record<string, unknown>,
    customSensitiveFields?: string[],
  ): Record<string, unknown> {
    const sensitiveFields = [
      ...DEFAULT_SENSITIVE_FIELDS,
      ...(customSensitiveFields || []),
    ];

    return this.redactSensitiveFields(input, sensitiveFields);
  }

  /**
   * Recursively redact sensitive fields from an object
   */
  private redactSensitiveFields(
    obj: unknown,
    sensitiveFields: string[],
  ): Record<string, unknown> {
    if (obj === null || obj === undefined) {
      return {};
    }

    if (typeof obj !== 'object') {
      return {};
    }

    if (Array.isArray(obj)) {
      return obj.map((item) =>
        this.redactSensitiveFields(item, sensitiveFields),
      ) as unknown as Record<string, unknown>;
    }

    const result: Record<string, unknown> = {};
    const objRecord = obj as Record<string, unknown>;

    for (const [key, value] of Object.entries(objRecord)) {
      if (sensitiveFields.includes(key.toLowerCase())) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.redactSensitiveFields(value, sensitiveFields);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Sanitize output by truncating if too large
   */
  private sanitizeOutput(
    response: unknown,
  ): Record<string, unknown> | undefined {
    if (response === null || response === undefined) {
      return undefined;
    }

    try {
      const stringified = JSON.stringify(response);
      if (stringified.length > MAX_OUTPUT_SIZE) {
        return {
          _truncated: true,
          _originalSize: stringified.length,
          _message: 'Output too large, truncated for storage',
        };
      }
      return response as Record<string, unknown>;
    } catch {
      return {
        _error: 'Failed to serialize output',
      };
    }
  }
}
