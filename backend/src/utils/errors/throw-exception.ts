import {
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  InternalServerErrorException,
} from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

type ErrorDetails = Record<string, string> | null;

export interface HttpErrorInput {
  status: HttpStatus;
  message?: string;
  errors?: ErrorDetails;
}

const EX_MAP: Record<number, new (response?: any) => HttpException> = {
  [HttpStatus.BAD_REQUEST]: BadRequestException,
  [HttpStatus.UNAUTHORIZED]: UnauthorizedException,
  [HttpStatus.FORBIDDEN]: ForbiddenException,
  [HttpStatus.NOT_FOUND]: NotFoundException,
  [HttpStatus.CONFLICT]: ConflictException,
  [HttpStatus.UNPROCESSABLE_ENTITY]: UnprocessableEntityException,
  [HttpStatus.INTERNAL_SERVER_ERROR]: InternalServerErrorException,
};

/**
 * Auto derive message from errors if not explicitly provided
 */
function deriveMessage(
  message: string | undefined,
  errors: ErrorDetails,
  status: HttpStatus,
): string | null {
  if (message) return message;
  if (!errors) {
    const i18n = I18nContext.current();
    if (i18n) {
      return i18n.t(`http-status.${status}`);
    }
    return null;
  }

  const values = Object.values(errors);
  return values.length === 1 ? values[0] : null;
}

export function throwException({
  status = HttpStatus.BAD_REQUEST,
  message,
  errors = null,
}: HttpErrorInput): never {
  const ExceptionType = EX_MAP[status];
  const body = {
    statusCode: status,
    message: deriveMessage(message, errors, status),
    errors,
  };
  if (ExceptionType) {
    throw new ExceptionType(body);
  }
  throw new HttpException(body, status);
}
