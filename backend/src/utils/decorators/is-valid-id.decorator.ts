import { IsMongoId, ValidationOptions } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export function IsValidId(options?: ValidationOptions) {
  return IsMongoId({
    message: i18nValidationMessage('validation.isValidId'),
    ...options,
  });
}
