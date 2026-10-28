import { I18nContext, type I18nValidationException } from 'nestjs-i18n';
import { isRecord } from '../helpers/is-record';

/**
 * Structured validation error item
 */
export interface ValidationErrorItem {
  /** Dot-notation field path (e.g., "customer.phone") */
  field: string;
  /** Localized error message */
  message: string;
  /** Validation rule code (e.g., "isPhoneNumber") */
  code: string;
}

/**
 * Validation error with property, constraints, and children
 */
interface ValidationErrorLike {
  property?: string;
  constraints?: Record<string, string>;
  children?: ValidationErrorLike[];
}

/**
 * Extracts structured validation errors from ValidationError tree
 * @param errors - Array of validation errors
 * @param parentPath - Parent field path for nested errors
 * @returns Array of structured error items
 */
const extractStructuredErrors = (
  errors: ValidationErrorLike[],
  parentPath = '',
): ValidationErrorItem[] => {
  const result: ValidationErrorItem[] = [];

  for (const error of errors) {
    const fieldPath = parentPath
      ? `${parentPath}.${error.property}`
      : (error.property ?? '');

    if (error.constraints) {
      for (const [code, message] of Object.entries(error.constraints)) {
        result.push({
          field: fieldPath,
          message,
          code,
        });
      }
    }

    if (error.children && error.children.length > 0) {
      result.push(...extractStructuredErrors(error.children, fieldPath));
    }
  }

  return result;
};

/**
 * Extracts structured errors from pre-processed object payload
 * Handles the case when payload is already a nested object from generateErrors()
 */
const extractFromNestedObject = (
  payload: Record<string, unknown>,
  parentPath = '',
): ValidationErrorItem[] => {
  const result: ValidationErrorItem[] = [];

  for (const [key, value] of Object.entries(payload)) {
    const fieldPath = parentPath ? `${parentPath}.${key}` : key;

    if (typeof value === 'string') {
      result.push({
        field: fieldPath,
        message: value,
        code: 'validation',
      });
    } else if (isRecord(value)) {
      result.push(...extractFromNestedObject(value, fieldPath));
    }
  }

  return result;
};

/**
 * Builds structured validation error response
 */
export const buildValidationErrorResponse = (
  exception: I18nValidationException,
  payload: unknown,
  statusCode = 422,
) => {
  let errors: ValidationErrorItem[] = [];

  if (Array.isArray(payload)) {
    const firstItem = payload[0];
    if (firstItem && typeof firstItem === 'object' && 'property' in firstItem) {
      errors = extractStructuredErrors(payload as ValidationErrorLike[]);
    }
  } else if (isRecord(payload)) {
    errors = extractFromNestedObject(payload);
  }

  const rawResponse = exception.getResponse();
  let summary: string;
  const i18n = I18nContext.current();
  if (i18n) {
    summary = i18n.t(`http-status.${statusCode}`);
  } else {
    summary =
      isRecord(rawResponse) && typeof rawResponse.error === 'string'
        ? rawResponse.error
        : (rawResponse as string);
  }

  return {
    statusCode,
    message: summary,
    errors,
  };
};
