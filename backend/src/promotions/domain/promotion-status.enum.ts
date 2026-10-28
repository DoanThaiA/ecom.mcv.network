/**
 * Promotion status enum - matches proto PromotionStatus
 * (computed from time + isEnabled)
 */
export enum PromotionStatus {
  UNSPECIFIED = 0,
  ACTIVE = 1, // Within time range and enabled
  UPCOMING = 2, // Before start time
  ENDED = 3, // After end time
  PAUSED = 4, // Manually paused
}

/**
 * Helper to compute promotion status from dates and isEnabled flag
 */
export function computePromotionStatus(
  startTime: Date,
  endTime: Date,
  isEnabled: boolean,
): PromotionStatus {
  if (!isEnabled) {
    return PromotionStatus.PAUSED;
  }

  const now = new Date();

  if (now < startTime) {
    return PromotionStatus.UPCOMING;
  }

  if (now > endTime) {
    return PromotionStatus.ENDED;
  }

  return PromotionStatus.ACTIVE;
}
