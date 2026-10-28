/**
 * Flash sale status enumeration (computed from time + isEnabled)
 */
export enum FlashSaleStatus {
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
 * Compute flash sale status based on time range and enabled flag
 * @param startTime - Flash sale start time
 * @param endTime - Flash sale end time
 * @param isEnabled - Whether the flash sale is enabled
 * @returns Computed flash sale status
 */
export function computeFlashSaleStatus(
  startTime: Date,
  endTime: Date,
  isEnabled: boolean,
): FlashSaleStatus {
  if (!isEnabled) {
    return FlashSaleStatus.DISABLED;
  }

  const now = new Date();

  if (now < startTime) {
    return FlashSaleStatus.UPCOMING;
  }

  if (now > endTime) {
    return FlashSaleStatus.ENDED;
  }

  return FlashSaleStatus.ACTIVE;
}
