import axiosInstance from 'src/utils/axios';

import type { FlashSaleResponse as FlashSale } from 'src/types/gen/shared/shared/flash-sales/flash-sale';
import type {
  QueryFlashSalesRequest,
  QueryFlashSalesResponse,
  CreateFlashSaleRequest,
  UpdateFlashSaleRequest,
  AddFlashSaleProductRequest,
  UpdateFlashSaleProductRequest,
  BulkAddFlashSaleProductsRequest,
  BulkUpdateFlashSaleProductsRequest,
  BulkAddFlashSaleProductItem,
  GetFlashSaleRequest,
  ValidateExcelProductsResponse,
  UpsertFlashSaleProductsRequest,
} from 'src/types/gen/cms/cms/flash-sales/flash-sale';
import type {
  ImportSessionResponse,
  PaginatedImportSessionRows,
  QueryImportSessionRowsParams,
  ImportSessionRow,
  UpdateImportSessionRowData,
  ConfirmImportSessionResponse,
} from 'src/types/import-session';

const BULK_ADD_CHUNK_SIZE = 200;

/**
 * Product ID with order number response
 */
export interface FlashSaleProductIdResponse {
  productId: string;
  order: number;
}

/**
 * Per-product failure detail from a bulk-add API call
 */
export interface FailedProduct {
  productId: string;
  productCode: string;
  reason: 'duplicate' | 'notFound' | 'conflict' | 'noStock' | 'noImage';
}

/**
 * Response from a single bulk-add API call (partial-success)
 */
export interface BulkAddFlashSaleProductsResponse {
  addedCount: number;
  failedCount: number;
  failedProducts: FailedProduct[];
}

/**
 * Response from upsert API call (add or update products)
 */
export interface BulkUpsertFlashSaleProductsResponse {
  upsertedCount: number;
  addedCount: number;
  updatedCount: number;
  failedCount: number;
  failedProducts: FailedProduct[];
}

/**
 * Aggregated result across all chunks
 */
export interface BulkAddChunkedResult {
  totalAdded: number;
  totalFailed: number;
  failedProducts: FailedProduct[];
}

/**
 * Flash Sale Repository
 * Handles all flash sale-related API calls
 */
class FlashSaleRepository {
  /**
   * Query flash sales with filters, sort and pagination
   * GET /api/v1/flash-sales
   */
  queryFlashSales = async (params: QueryFlashSalesRequest): Promise<QueryFlashSalesResponse> => {
    const queryParams: Record<string, string> = {};

    if (params.page !== undefined) {
      queryParams.page = params.page.toString();
    }
    if (params.limit !== undefined) {
      queryParams.limit = params.limit.toString();
    }
    if (params.filters) {
      queryParams.filters = JSON.stringify(params.filters);
    }
    if (params.sort && params.sort.length > 0) {
      queryParams.sort = JSON.stringify(params.sort);
    }

    const response = await axiosInstance.get<QueryFlashSalesResponse>('/flash-sales', {
      params: queryParams,
    });

    return response.data;
  };

  /**
   * Get flash sale by ID with products
   * GET /api/v1/flash-sales/{id}
   */
  getFlashSale = async (params: GetFlashSaleRequest): Promise<FlashSale> => {
    const { flashSaleId, ...rest } = params;
    const queryParams: Record<string, string> = {};

    if (rest.page !== undefined) {
      queryParams.page = rest.page.toString();
    }
    if (rest.limit !== undefined) {
      queryParams.limit = rest.limit.toString();
    }
    if (rest.filters) {
      queryParams.filters = JSON.stringify(rest.filters);
    }
    if (rest.sort && rest.sort.length > 0) {
      queryParams.sort = JSON.stringify(rest.sort);
    }

    const response = await axiosInstance.get<FlashSale>(`/flash-sales/${flashSaleId}`, {
      params: queryParams,
    });
    return response.data;
  };

  /**
   * Get all product IDs with order numbers for a flash sale
   * GET /api/v1/flash-sales/{id}/product-ids
   */
  getFlashSaleProductIds = async (flashSaleId: string): Promise<FlashSaleProductIdResponse[]> => {
    const response = await axiosInstance.get<{ products: FlashSaleProductIdResponse[] }>(
      `/flash-sales/${flashSaleId}/product-ids`
    );
    return response.data.products;
  };

  /**
   * Create a new flash sale
   * POST /api/v1/flash-sales
   */
  createFlashSale = async (data: CreateFlashSaleRequest): Promise<FlashSale> => {
    const response = await axiosInstance.post<FlashSale>('/flash-sales', data);
    return response.data;
  };

  /**
   * Update a flash sale
   * PATCH /api/v1/flash-sales/{id}
   */
  updateFlashSale = async (data: UpdateFlashSaleRequest): Promise<FlashSale> => {
    const { flashSaleId, ...updateData } = data;
    const response = await axiosInstance.patch<FlashSale>(
      `/flash-sales/${flashSaleId}`,
      updateData
    );
    return response.data;
  };

  /**
   * Delete a flash sale
   * DELETE /api/v1/flash-sales/{id}
   */
  deleteFlashSale = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/flash-sales/${id}`);
  };

  /**
   * Toggle flash sale enabled/disabled
   * PATCH /api/v1/flash-sales/{id}/toggle
   */
  toggleFlashSale = async (id: string): Promise<FlashSale> => {
    const response = await axiosInstance.patch<FlashSale>(`/flash-sales/${id}/toggle`);
    return response.data;
  };

  /**
   * Add a product to flash sale
   * POST /api/v1/flash-sales/{id}/products
   */
  addFlashSaleProduct = async (data: AddFlashSaleProductRequest): Promise<FlashSale> => {
    const { flashSaleId, ...productData } = data;
    const response = await axiosInstance.post<FlashSale>(
      `/flash-sales/${flashSaleId}/products`,
      productData
    );
    return response.data;
  };

  /**
   * Update a product in flash sale
   * PATCH /api/v1/flash-sales/{id}/products/{productId}
   */
  updateFlashSaleProduct = async (data: UpdateFlashSaleProductRequest): Promise<FlashSale> => {
    const { flashSaleId, productId, ...updateData } = data;
    const response = await axiosInstance.patch<FlashSale>(
      `/flash-sales/${flashSaleId}/products/${productId}`,
      updateData
    );
    return response.data;
  };

  /**
   * Remove a product from flash sale
   * DELETE /api/v1/flash-sales/{id}/products/{productId}
   */
  removeFlashSaleProduct = async (flashSaleId: string, productId: string): Promise<FlashSale> => {
    const response = await axiosInstance.delete<FlashSale>(
      `/flash-sales/${flashSaleId}/products/${productId}`
    );
    return response.data;
  };

  /**
   * Bulk remove products from flash sale
   * DELETE /api/v1/flash-sales/{id}/products
   */
  bulkRemoveFlashSaleProducts = async (
    flashSaleId: string,
    productIds: string[]
  ): Promise<FlashSale> => {
    const response = await axiosInstance.delete<FlashSale>(`/flash-sales/${flashSaleId}/products`, {
      data: { productIds },
    });
    return response.data;
  };

  /**
   * Toggle product enabled/disabled in flash sale
   * PATCH /api/v1/flash-sales/{id}/products/{productId}/toggle
   */
  toggleFlashSaleProduct = async (flashSaleId: string, productId: string): Promise<FlashSale> => {
    const response = await axiosInstance.patch<FlashSale>(
      `/flash-sales/${flashSaleId}/products/${productId}/toggle`
    );
    return response.data;
  };

  /**
   * Bulk add products to flash sale (single call)
   * POST /api/v1/flash-sales/{id}/products/bulk
   */
  bulkAddFlashSaleProducts = async (
    data: BulkAddFlashSaleProductsRequest
  ): Promise<BulkAddFlashSaleProductsResponse> => {
    const { flashSaleId, products } = data;
    const response = await axiosInstance.post<BulkAddFlashSaleProductsResponse>(
      `/flash-sales/${flashSaleId}/products/bulk`,
      { flashSaleId, products }
    );
    return response.data;
  };

  /**
   * Bulk add products to flash sale in chunks of BULK_ADD_CHUNK_SIZE.
   * Reports progress via callback after each chunk completes.
   */
  bulkAddFlashSaleProductsChunked = async (
    flashSaleId: string,
    products: BulkAddFlashSaleProductItem[],
    onProgress?: (current: number, total: number) => void
  ): Promise<BulkAddChunkedResult> => {
    const totalProducts = products.length;
    let totalAdded = 0;
    let totalFailed = 0;
    const allFailedProducts: FailedProduct[] = [];

    for (let i = 0; i < totalProducts; i += BULK_ADD_CHUNK_SIZE) {
      const chunk = products.slice(i, i + BULK_ADD_CHUNK_SIZE);
      const result = await this.bulkAddFlashSaleProducts({
        flashSaleId,
        products: chunk,
      });

      totalAdded += result.addedCount;
      totalFailed += result.failedCount;
      allFailedProducts.push(...result.failedProducts);

      if (onProgress) {
        onProgress(Math.min(i + chunk.length, totalProducts), totalProducts);
      }
    }

    return { totalAdded, totalFailed, failedProducts: allFailedProducts };
  };

  /**
   * Bulk update products in flash sale
   * PATCH /api/v1/flash-sales/{id}/products/bulk-update
   */
  bulkUpdateFlashSaleProducts = async (
    data: BulkUpdateFlashSaleProductsRequest
  ): Promise<FlashSale> => {
    const { flashSaleId, products } = data;
    const response = await axiosInstance.patch<FlashSale>(`/flash-sales/${flashSaleId}/products`, {
      flashSaleId,
      products,
    });
    return response.data;
  };

  /**
   * Upsert products in flash sale (add or update)
   * PUT /api/v1/flash-sales/{id}/products/bulk
   */
  upsertFlashSaleProducts = async (
    flashSaleId: string,
    data: UpsertFlashSaleProductsRequest
  ): Promise<BulkUpsertFlashSaleProductsResponse> => {
    const response = await axiosInstance.put<BulkUpsertFlashSaleProductsResponse>(
      `/flash-sales/${flashSaleId}/products/bulk`,
      data
    );
    return response.data;
  };

  /**
   * Validate products from Excel file upload
   * POST /api/v1/flash-sales/validate-products (multipart/form-data)
   */
  validateExcelProducts = async (
    file: File,
    startTime: string,
    endTime: string,
    flashSaleId?: string
  ): Promise<ValidateExcelProductsResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('startTime', startTime);
    formData.append('endTime', endTime);
    if (flashSaleId) {
      formData.append('flashSaleId', flashSaleId);
    }

    const response = await axiosInstance.post<ValidateExcelProductsResponse>(
      '/flash-sales/validate-products',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  };

  // ─── Import Session Methods ─────────────────────────────────────────────

  /**
   * Create import session (upload Excel, validate, persist rows)
   * POST /api/v1/flash-sales/{flashSaleId}/import-session
   */
  createImportSession = async (
    flashSaleId: string,
    file: File,
    startTime: string,
    endTime: string
  ): Promise<ImportSessionResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('startTime', startTime);
    formData.append('endTime', endTime);

    const response = await axiosInstance.post<ImportSessionResponse>(
      `/flash-sales/${flashSaleId}/import-session`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  };

  /**
   * Get import session summary
   * GET /api/v1/flash-sales/import-session/{sessionId}
   */
  getImportSession = async (sessionId: string): Promise<ImportSessionResponse> => {
    const response = await axiosInstance.get<ImportSessionResponse>(
      `/flash-sales/import-session/${sessionId}`
    );
    return response.data;
  };

  /**
   * Get paginated import session rows
   * GET /api/v1/flash-sales/import-session/{sessionId}/rows
   */
  getImportSessionRows = async (
    sessionId: string,
    params: QueryImportSessionRowsParams
  ): Promise<PaginatedImportSessionRows> => {
    const queryParams: Record<string, string> = {
      page: params.page.toString(),
      limit: params.limit.toString(),
    };
    if (params.isValid !== undefined) {
      queryParams.isValid = params.isValid.toString();
    }
    if (params.search) {
      queryParams.search = params.search;
    }

    const response = await axiosInstance.get<PaginatedImportSessionRows>(
      `/flash-sales/import-session/${sessionId}/rows`,
      { params: queryParams }
    );
    return response.data;
  };

  /**
   * Update a session row (inline edit)
   * PATCH /api/v1/flash-sales/import-session/{sessionId}/rows/{rowId}
   */
  updateImportSessionRow = async (
    sessionId: string,
    rowId: string,
    data: UpdateImportSessionRowData
  ): Promise<ImportSessionRow> => {
    const response = await axiosInstance.patch<ImportSessionRow>(
      `/flash-sales/import-session/${sessionId}/rows/${rowId}`,
      data
    );
    return response.data;
  };

  /**
   * Delete a session row
   * DELETE /api/v1/flash-sales/import-session/{sessionId}/rows/{rowId}
   */
  deleteImportSessionRow = async (
    sessionId: string,
    rowId: string
  ): Promise<ImportSessionResponse> => {
    const response = await axiosInstance.delete<ImportSessionResponse>(
      `/flash-sales/import-session/${sessionId}/rows/${rowId}`
    );
    return response.data;
  };

  /**
   * Confirm import session and start processing job
   * POST /api/v1/flash-sales/import-session/{sessionId}/confirm
   */
  confirmImportSession = async (sessionId: string): Promise<ConfirmImportSessionResponse> => {
    const response = await axiosInstance.post<ConfirmImportSessionResponse>(
      `/flash-sales/import-session/${sessionId}/confirm`
    );
    return response.data;
  };
}

export const flashSaleRepository = new FlashSaleRepository();
