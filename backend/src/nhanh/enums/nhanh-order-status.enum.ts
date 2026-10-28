/**
 * Nhanh.vn Order Status Codes
 * @see https://apidocs.nhanh.vn/v3/modelconstant#order-status
 */
export enum NhanhOrderStatus {
  // Pending statuses
  NEW = 54,
  CONFIRMING = 55,
  WAITING_CUSTOMER_CONFIRMATION = 57,

  // Confirmed
  CONFIRMED = 56,

  // Processing statuses
  PACKING = 42,
  PACKED = 40,
  WAITING_FOR_PICKUP = 43,
  CHANGING_WAREHOUSE = 73,

  // Shipping statuses
  SHIPPING = 59,
  RETURNING = 71,

  // Completed
  SUCCESS = 60,

  // Cancelled statuses
  FAILED = 61,
  CARRIER_CANCELLED = 58,
  CUSTOMER_CANCELLED = 63,
  SYSTEM_CANCELLED = 64,
  OUT_OF_STOCK = 68,

  // Returned statuses
  RETURNED = 72,
  RETURN_CONFIRMED = 74,
}
