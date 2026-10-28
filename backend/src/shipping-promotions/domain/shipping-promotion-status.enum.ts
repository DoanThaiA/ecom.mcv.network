/**
 * Shipping promotion status enumeration (computed from time + isEnabled)
 */
export enum ShippingPromotionStatus {
  /** Currently active - within time range and enabled */
  ACTIVE = 'active',
  /** Upcoming - before start time */
  UPCOMING = 'upcoming',
  /** Ended - after end time */
  ENDED = 'ended',
  /** Manually disabled */
  DISABLED = 'disabled',
}

/**
 * Compute shipping promotion status based on time range and enabled flag
 */
export function computeShippingPromotionStatus(
  startTime: Date,
  endTime: Date,
  isEnabled: boolean,
): ShippingPromotionStatus {
  if (!isEnabled) {
    return ShippingPromotionStatus.DISABLED;
  }

  const now = new Date();

  if (now < startTime) {
    return ShippingPromotionStatus.UPCOMING;
  }

  if (now > endTime) {
    return ShippingPromotionStatus.ENDED;
  }

  return ShippingPromotionStatus.ACTIVE;
}
