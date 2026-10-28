/**
 * Pure comparison logic for the Nhanh.vn reconciliation page.
 *
 * Free of Nest, Mongo and HTTP so the rules can be tested directly. Every rule
 * here was derived from a real production discrepancy during the July 2026
 * webhook outage; the comments record why, because two of them look wrong
 * until you know the data.
 */

/** Product status codes shared by Nhanh.vn and our own `ProductStatus`. */
export const PRODUCT_STATUS_LABEL: Record<number, string> = {
  1: 'Mới',
  2: 'Đang bán',
  3: 'Ngừng bán',
  4: 'Hết hàng',
  5: 'Tạm ngưng',
};

export const VALID_PRODUCT_STATUS = new Set([1, 2, 3, 4, 5]);

/** Nhanh.vn order status codes. Mirrors `NhanhOrderStatus`. */
export const NHANH_ORDER_STATUS_LABEL: Record<number, string> = {
  54: 'Mới',
  55: 'Đang xác nhận',
  57: 'Chờ khách xác nhận',
  56: 'Đã xác nhận',
  42: 'Đang đóng gói',
  40: 'Đã đóng gói',
  43: 'Chờ thu gom',
  73: 'Đổi kho',
  59: 'Đang chuyển',
  71: 'Đang hoàn',
  60: 'Thành công',
  61: 'Thất bại',
  58: 'Hãng vận chuyển huỷ',
  63: 'Khách huỷ',
  64: 'Hệ thống huỷ',
  68: 'Hết hàng',
  72: 'Đã hoàn',
  74: 'Xác nhận hoàn',
};

/**
 * Nhanh order status → our `OrderStatus`.
 *
 * Deliberately duplicated from `NhanhWebhookService.mapNhanhStatusToOrderStatus`
 * rather than extracted, to avoid touching the live webhook path for a
 * read-only admin page. A test asserts every value of the `NhanhOrderStatus`
 * enum is covered here, so the copy cannot silently drift from the original.
 */
export function mapNhanhOrderStatus(nhanhStatus: number): string | null {
  switch (Number(nhanhStatus)) {
    case 54:
    case 55:
    case 57:
      return 'pending';
    case 56:
      return 'confirmed';
    case 42:
    case 40:
    case 43:
    case 73:
      return 'processing';
    case 59:
    case 71:
      return 'shipped';
    case 60:
      return 'delivered';
    case 61:
    case 58:
    case 63:
    case 64:
    case 68:
      return 'cancelled';
    case 72:
    case 74:
      return 'refunded';
    default:
      return null;
  }
}

export interface ProductSide {
  code?: string;
  name?: string;
  status?: number;
  /** Live availability. NOT the denormalised `stock` field — see compareProduct. */
  available?: number | null;
  /** -1 standalone, -2 parent, >0 id of the parent. */
  parentId?: number;
}

export interface ProductComparison {
  statusDiverged: boolean;
  stockDiverged: boolean;
  stockComparable: boolean;
  dbStatus: number | null;
  nhanhStatus: number | null;
  dbAvailable: number | null;
  nhanhAvailable: number | null;
  isParent: boolean;
  /** Visible on the storefront as sellable while Nhanh has hidden it. */
  showingWronglyOnWeb: boolean;
  notes: string[];
}

/**
 * Compare one product against its Nhanh counterpart.
 *
 * Two rules exist because comparing the obvious fields produced false alarms
 * on production data:
 *
 *  - Stock is read from `inventory.available`, never from the top-level
 *    `stock` field. `stock` is a denormalised aggregate that lags: on
 *    12/08/2026 SKU 15QDD2083ST-trắng-XL had `stock: 8` while both
 *    `inventory.available` and Nhanh reported 0. Comparing `stock` flagged
 *    hundreds of healthy SKUs.
 *
 *  - Parent products (`parentId === -2`) are excluded from the stock check.
 *    Nhanh always reports `available: 0` on a parent because the stock lives
 *    on its variants, while we store the sum of the children on the parent.
 *    Comparing them marks every single parent as diverged.
 */
export function compareProduct(
  db: ProductSide,
  nhanh: ProductSide | null | undefined,
): ProductComparison {
  const notes: string[] = [];
  const isParent = Number(db.parentId) === -2;

  if (!nhanh) {
    notes.push(
      'Nhanh không trả về sản phẩm này. Có thể đã bị xoá bên Nhanh, cũng có thể chỉ là lỗi mạng — không tự suy diễn.',
    );
    return {
      statusDiverged: false,
      stockDiverged: false,
      stockComparable: false,
      dbStatus: db.status ?? null,
      nhanhStatus: null,
      dbAvailable: db.available ?? null,
      nhanhAvailable: null,
      isParent,
      showingWronglyOnWeb: false,
      notes,
    };
  }

  const dbStatus = Number(db.status);
  const nhanhStatus = Number(nhanh.status);
  const statusKnown =
    VALID_PRODUCT_STATUS.has(dbStatus) && VALID_PRODUCT_STATUS.has(nhanhStatus);
  const statusDiverged = statusKnown && dbStatus !== nhanhStatus;

  if (!statusKnown) {
    notes.push('Một trong hai phía có giá trị trạng thái không hợp lệ.');
  }

  const dbAvailable = typeof db.available === 'number' ? db.available : null;
  const nhanhAvailable =
    typeof nhanh.available === 'number' ? nhanh.available : null;

  const stockComparable =
    !isParent && dbAvailable !== null && nhanhAvailable !== null;
  const stockDiverged = stockComparable && dbAvailable !== nhanhAvailable;

  if (isParent) {
    notes.push(
      'Sản phẩm cha: Nhanh luôn báo tồn 0 vì tồn nằm ở biến thể con, nên không so tồn kho ở đây.',
    );
  }

  return {
    statusDiverged,
    stockDiverged,
    stockComparable,
    dbStatus: Number.isFinite(dbStatus) ? dbStatus : null,
    nhanhStatus: Number.isFinite(nhanhStatus) ? nhanhStatus : null,
    dbAvailable,
    nhanhAvailable,
    isParent,
    showingWronglyOnWeb: statusDiverged && dbStatus === 2 && nhanhStatus !== 2,
    notes,
  };
}

export interface OrderComparison {
  diverged: boolean;
  dbStatus: string | null;
  nhanhStatus: number | null;
  nhanhStatusLabel: string | null;
  shouldBe: string | null;
  notes: string[];
}

/** Compare one order's status against Nhanh's, using the webhook's own mapping. */
export function compareOrder(
  dbStatus: string | null | undefined,
  nhanhStatus: number | null | undefined,
): OrderComparison {
  const notes: string[] = [];

  if (nhanhStatus === null || nhanhStatus === undefined) {
    notes.push(
      'Nhanh không trả về đơn này. Kiểm tra lại `nhanh.orderId` trước khi kết luận.',
    );
    return {
      diverged: false,
      dbStatus: dbStatus ?? null,
      nhanhStatus: null,
      nhanhStatusLabel: null,
      shouldBe: null,
      notes,
    };
  }

  const shouldBe = mapNhanhOrderStatus(nhanhStatus);
  if (!shouldBe) {
    notes.push(
      `Nhanh trả về mã trạng thái ${nhanhStatus} chưa có trong bảng ánh xạ.`,
    );
  }

  return {
    diverged: Boolean(shouldBe) && shouldBe !== (dbStatus ?? null),
    dbStatus: dbStatus ?? null,
    nhanhStatus: Number(nhanhStatus),
    nhanhStatusLabel: NHANH_ORDER_STATUS_LABEL[Number(nhanhStatus)] ?? null,
    shouldBe,
    notes,
  };
}

export interface BatchSummary {
  checked: number;
  notReturnedByNhanh: number;
  statusDiverged: number;
  stockDiverged: number;
  showingWronglyOnWeb: number;
  divergenceRatePercent: number;
}

/** Roll a sample of product comparisons into the numbers shown on the page. */
export function summariseProducts(
  comparisons: ProductComparison[],
): BatchSummary {
  const checked = comparisons.length;
  const notReturned = comparisons.filter((c) => c.nhanhStatus === null).length;
  const statusDiverged = comparisons.filter((c) => c.statusDiverged).length;
  const stockDiverged = comparisons.filter((c) => c.stockDiverged).length;
  const showingWrong = comparisons.filter((c) => c.showingWronglyOnWeb).length;
  const anyDiverged = comparisons.filter(
    (c) => c.statusDiverged || c.stockDiverged,
  ).length;

  return {
    checked,
    notReturnedByNhanh: notReturned,
    statusDiverged,
    stockDiverged,
    showingWronglyOnWeb: showingWrong,
    divergenceRatePercent:
      checked === 0 ? 0 : Math.round((anyDiverged / checked) * 1000) / 10,
  };
}

/** Roll a sample of order comparisons into the numbers shown on the page. */
export function summariseOrders(comparisons: OrderComparison[]): BatchSummary {
  const checked = comparisons.length;
  const notReturned = comparisons.filter((c) => c.nhanhStatus === null).length;
  const diverged = comparisons.filter((c) => c.diverged).length;

  return {
    checked,
    notReturnedByNhanh: notReturned,
    statusDiverged: diverged,
    stockDiverged: 0,
    showingWronglyOnWeb: 0,
    divergenceRatePercent:
      checked === 0 ? 0 : Math.round((diverged / checked) * 1000) / 10,
  };
}
