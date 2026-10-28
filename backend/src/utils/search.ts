/** Map from ASCII base character to a regex character class covering all Vietnamese variants */
const VIETNAMESE_ACCENT_MAP: Record<string, string> = {
  a: '[aàáạảãăắặẳẵằâấầẩẫậ]',
  e: '[eèéẹẻẽêếềệểễ]',
  i: '[iìíịỉĩ]',
  o: '[oòóọỏõôốồộổỗơớờợởỡ]',
  u: '[uùúụủũưứừựửữ]',
  y: '[yỳýỵỷỹ]',
  d: '[dđ]',
};

/**
 * Escapes special regex characters in a string.
 * Use this to sanitize user input before passing to MongoDB $regex
 * to prevent NoSQL injection and ReDoS attacks.
 */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds an accent-insensitive regex pattern from a search string.
 * Strips diacritics from the input first (NFD normalization), then expands
 * each base character to a character class matching all Vietnamese variants.
 * Use with MongoDB `$regex` and `$options: 'i'` for full case + accent insensitivity.
 *
 * @example
 * buildAccentInsensitivePattern('ao')  // '[aàáạảãăắặẳẵằâấầẩẫậ][oòóọỏõôốồộổỗơớờợởỡ]'
 * buildAccentInsensitivePattern('áo')  // same result — diacritics stripped first
 */
export function buildAccentInsensitivePattern(search: string): string {
  const base = search
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  return base
    .split('')
    .map((char) => VIETNAMESE_ACCENT_MAP[char] ?? escapeRegex(char))
    .join('');
}
