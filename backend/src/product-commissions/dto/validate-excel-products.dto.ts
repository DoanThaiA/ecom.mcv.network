/**
 * Parsed row from affiliate product commission Excel file
 */
export interface AffiliateProductCommissionExcelRow {
  code: string;
  name: string;
  commissionRate: number;
  rowNumber: number;
}

/**
 * Validation error codes for affiliate product commission import
 */
export enum AffiliateProductCommissionValidationErrorCode {
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  INVALID_RATE = 'INVALID_RATE',
  DUPLICATE_IN_EXCEL = 'DUPLICATE_IN_EXCEL',
  INVALID_ROW_FORMAT = 'INVALID_ROW_FORMAT',
}
