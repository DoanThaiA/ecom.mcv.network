import { arrayMove } from '@dnd-kit/sortable';

export function moveDescriptionImage(
  images: string[],
  fromIndex: number,
  toIndex: number
): string[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= images.length ||
    toIndex >= images.length
  ) {
    return images;
  }

  return arrayMove(images, fromIndex, toIndex);
}
