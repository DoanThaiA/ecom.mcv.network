/**
 * Import session response from backend
 */
export interface ImportSessionResponse {
  id: string;
  type: 'flash_sale' | 'product_discount' | 'topic' | 'affiliate_product_commission';
  flashSaleId?: string;
  promotionId?: string;
  topicId?: string;
  affiliateId?: string;
  status: 'pending' | 'processing' | 'completed' | 'expired';
  totalRows: number;
  validCount: number;
  invalidCount: number;
  jobId?: string;
  createdAt: string;
}

/**
 * Single row in an import session
 */
export interface ImportSessionRow {
  id: string;
  sessionId: string;
  rowNumber: number;
  productId: string;
  code: string;
  name: string;
  actualName?: string;
  image?: string;
  originalPrice: number;
  discountType: string;
  discountValue: number;
  flashSalePrice: number;
  promotionalQuantity: number;
  stock: number;
  commissionRate?: number;
  isValid: boolean;
  errors: string[];
}

/**
 * Paginated import session rows response
 */
export interface PaginatedImportSessionRows {
  docs: ImportSessionRow[];
  totalDocs: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

/**
 * Query params for getting session rows
 */
export interface QueryImportSessionRowsParams {
  page: number;
  limit: number;
  isValid?: boolean;
  search?: string;
}

/**
 * Update data for inline editing a row
 */
export interface UpdateImportSessionRowData {
  discountType?: string;
  discountValue?: number;
  promotionalQuantity?: number;
}

/**
 * Response from confirming an import session
 */
export interface ConfirmImportSessionResponse {
  jobId: string;
}

/**
 * Job status response (for polling)
 */
export interface JobStatusResponse {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  percentComplete: number;
  jobErrors: Array<{ itemId: string; error: string; timestamp: string }>;
  resultMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}
