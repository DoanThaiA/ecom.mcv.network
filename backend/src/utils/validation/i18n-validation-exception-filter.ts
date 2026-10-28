import { I18nValidationExceptionFilter } from 'nestjs-i18n';
import { buildValidationErrorResponse } from './validation-error-response';

export const i18nValidationExceptionFilter = new I18nValidationExceptionFilter({
  errorHttpStatusCode: 422,
  detailedErrors: true,
  responseBodyFormatter: (_host, exception, errors) =>
    buildValidationErrorResponse(exception, errors, 422),
});
