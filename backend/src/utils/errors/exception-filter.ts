import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { I18nContext, I18nValidationException } from 'nestjs-i18n';
import { i18nValidationExceptionFilter } from '../validation/i18n-validation-exception-filter';
import { isRecord } from '../helpers/is-record';
import { Request, Response } from 'express';

@Catch(Error)
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof I18nValidationException) {
      return i18nValidationExceptionFilter.catch(exception, host);
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (isRecord(exceptionResponse)) {
        if (exceptionResponse.errors === undefined) {
          const i18n = I18nContext.current();
          if (i18n) {
            exceptionResponse.message = i18n.t(`http-status.${statusCode}`);
          }
        }
      }

      const normalized =
        typeof exceptionResponse === 'string'
          ? { statusCode, message: exceptionResponse }
          : (exceptionResponse as Record<string, any>);

      this.logger.warn(
        `[${request.method}] ${request.url} -> ${statusCode}\n${JSON.stringify(normalized)}`,
      );

      const responseBody = {
        ...normalized,
        details: {
          timestamp: new Date().toISOString(),
          path: request.url,
        },
      };

      // For multipart uploads (file uploads), destroy the socket after sending response
      // This prevents the gateway from waiting for the full request body to be uploaded
      // before forwarding the error response to the client
      const contentType = request.headers['content-type'] || '';
      const isMultipart = contentType.includes('multipart/form-data');

      if (isMultipart && statusCode === HttpStatus.UNAUTHORIZED) {
        this.logger.warn(
          `Closing connection for unauthorized multipart request to prevent timeout`,
        );
        response.status(statusCode).json(responseBody);
        // Destroy socket to force connection close - client will receive the 401 response
        // instead of waiting for timeout while file continues uploading
        request.socket?.destroy();
        return;
      }

      return response.status(statusCode).json(responseBody);
    }

    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    // Detail error stack for unexpected error
    this.logger.error(
      `[${request.method}] ${request.url} -> 500 ${exception.name}: ${exception.message}`,
      exception.stack,
    );

    return response.status(statusCode).json({
      statusCode,
      message:
        exception?.message && typeof exception.message === 'string'
          ? exception.message
          : 'Internal server error',
      details: {
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}
