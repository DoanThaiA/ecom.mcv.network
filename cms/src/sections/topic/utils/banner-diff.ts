import type { TopicBannerItem } from '../components/topic-banners-tab';

/**
 * Banner difference result for sync operations
 */
export interface BannerDiff {
  /** Banners to add (new banners without server ID) */
  toAdd: TopicBannerItem[];
  /** Banner IDs to remove (in original but not in current) */
  toRemove: string[];
  /** Banners to update (existing banners with changed content) */
  toUpdate: TopicBannerItem[];
  /** Whether the order of banners has changed */
  hasOrderChanged: boolean;
  /** Full reorder list with updated order values */
  reorderList: { bannerId: string; order: number }[];
}

/**
 * Calculate the difference between original and current banners
 * Used to determine which API calls are needed to sync changes
 *
 * @param original - Original banners from server
 * @param current - Current banners after user modifications
 * @returns BannerDiff with add/remove/reorder information
 */
export function calculateBannerDiff(
  original: TopicBannerItem[],
  current: TopicBannerItem[]
): BannerDiff {
  const originalIds = new Set(original.filter((b) => b.id).map((b) => b.id!));
  const currentWithId = current.filter((b) => b.id);
  const currentIds = new Set(currentWithId.map((b) => b.id!));

  // Banners to add (no server ID = new banners)
  const toAdd = current.filter((b) => !b.id);

  // Banners to remove (in original but not in current)
  const toRemove = original.filter((b) => b.id && !currentIds.has(b.id)).map((b) => b.id!);

  // Banners to update (existing banners with changed content)
  const originalMap = new Map(original.filter((b) => b.id).map((b) => [b.id!, b]));
  const toUpdate = currentWithId.filter((b) => {
    const orig = originalMap.get(b.id!);
    if (!orig) return false;
    return (
      orig.mediaType !== b.mediaType ||
      orig.media?.mobile !== b.media?.mobile ||
      orig.media?.tablet !== b.media?.tablet ||
      orig.media?.desktop !== b.media?.desktop ||
      (orig.link ?? '') !== (b.link ?? '')
    );
  });

  // Build reorder list for existing banners with updated order values
  const reorderList = currentWithId.map((b, idx) => ({
    bannerId: b.id!,
    order: idx + 1,
  }));

  // Check if order changed for remaining banners
  let hasOrderChanged = toAdd.length > 0 || toRemove.length > 0;

  if (!hasOrderChanged) {
    const originalFiltered = original.filter((b) => b.id && currentIds.has(b.id));
    const currentFiltered = currentWithId.filter((b) => originalIds.has(b.id!));

    if (originalFiltered.length !== currentFiltered.length) {
      hasOrderChanged = true;
    } else {
      for (let i = 0; i < originalFiltered.length; i++) {
        if (originalFiltered[i].id !== currentFiltered[i].id) {
          hasOrderChanged = true;
          break;
        }
      }
    }
  }

  return { toAdd, toRemove, toUpdate, hasOrderChanged, reorderList };
}
