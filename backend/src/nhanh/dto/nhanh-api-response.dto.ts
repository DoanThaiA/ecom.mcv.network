/**
 * Common Nhanh API response wrapper
 * All Nhanh API responses follow this structure
 */
export class NhanhApiResponseDto<T> {
  /** Response code: 1 = success, 0 = error */
  code: number;

  /** Response data (present on success) */
  data?: T;

  /** Paginator information for paginated responses */
  paginator?: {
    /** Cursor for next page */
    next?: string | null;
  };

  /** Warning messages */
  warning?: any[];

  /** Error code (present on failure) */
  errorCode?: string;

  /** Error messages (present on failure) */
  messages?: Record<string, any>;
}

/**
 * Pagination request parameters
 */
export class NhanhPaginatorDto {
  /** Number of items per page (max 100) */
  size?: number;

  /** Sort configuration */
  sort?: Record<string, 'asc' | 'desc'>;

  /** Cursor for next page */
  next?: Record<string, any>;
}
