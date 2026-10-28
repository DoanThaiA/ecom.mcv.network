/**
 * Parsed row from topic products Excel file
 */
export interface TopicExcelRow {
  code: string;
  name: string;
  rowNumber: number;
}

/**
 * Validation error codes for topic product import
 */
export enum TopicImportValidationErrorCode {
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  DUPLICATE_IN_EXCEL = 'DUPLICATE_IN_EXCEL',
  ALREADY_IN_TOPIC = 'ALREADY_IN_TOPIC',
  INVALID_ROW_FORMAT = 'INVALID_ROW_FORMAT',
}
