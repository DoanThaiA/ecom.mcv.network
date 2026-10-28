import { TransformFnParams } from 'class-transformer/types/interfaces';
import { MaybeType } from '../types/maybe.type';

/**
 * Normalizes a phone number string to E.164 format for Vietnam (+84).
 * Handles various input formats:
 * - 0888264006 -> +84888264006
 * - 84888264006 -> +84888264006
 * - +84888264006 -> +84888264006
 * - 888264006 -> +84888264006
 *
 * Non-string / empty inputs are returned unchanged so callers can treat the
 * result the same as the original value.
 */
export const normalizePhoneNumber = (value: unknown): MaybeType<string> => {
  if (!value || typeof value !== 'string') {
    return value as MaybeType<string>;
  }

  // Remove all non-digit characters except leading +
  let cleaned = value.trim().replace(/[^\d+]/g, '');

  // If it starts with +84, it's already in E.164 format
  if (cleaned.startsWith('+84')) {
    return cleaned;
  }

  // Remove any leading + that isn't followed by 84
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // If it starts with 84, add the +
  if (cleaned.startsWith('84')) {
    return `+${cleaned}`;
  }

  // If it starts with 0, replace with +84
  if (cleaned.startsWith('0')) {
    return `+84${cleaned.substring(1)}`;
  }

  // Otherwise, assume it's a local number without country code or leading 0
  return `+84${cleaned}`;
};

/**
 * Converts a Vietnamese phone number to local "0xxxxxxxxx" format.
 *
 * Built on {@link normalizePhoneNumber} so it accepts the same input variants
 * (0xxx / 84xxx / +84xxx / xxx) and always yields the 0-prefixed local form.
 * Used to match how Nhanh.vn stores/searches mobiles (it normalizes to local).
 *
 * - +84888264006 -> 0888264006
 * - 0888264006   -> 0888264006
 *
 * Non-string / empty inputs are returned unchanged.
 */
export const toLocalVnPhone = (value: unknown): MaybeType<string> => {
  const normalized = normalizePhoneNumber(value);
  if (typeof normalized !== 'string' || !normalized.startsWith('+84')) {
    return normalized;
  }
  return `0${normalized.substring(3)}`;
};

/**
 * class-transformer wrapper around {@link normalizePhoneNumber} so it can be
 * applied via `@Transform(phoneNumberTransformer)` on DTO fields.
 */
export const phoneNumberTransformer = (
  params: TransformFnParams,
): MaybeType<string> => normalizePhoneNumber(params.value);
