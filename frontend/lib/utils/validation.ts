/**
 * Validates email format using standard regex pattern
 * @param email - Email string to validate
 * @returns true if valid email format or empty string, false if invalid
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.trim() === '') {
    return true; // Empty email is allowed (optional field)
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates Vietnam phone number format
 * Supports two formats:
 * 1. 10 digits starting with 0 (e.g., 0901234567)
 * 2. International +84 format (e.g., +84901234567)
 *
 * @param phone - Phone string to validate
 * @returns true if valid VN phone format or empty string, false if invalid
 */
export function isValidVNPhone(phone: string): boolean {
  if (!phone || phone.trim() === '') {
    return true; // Empty phone is allowed (optional field)
  }
  const phoneRegex = /^(0\d{9}|\+84\d{9})$/;
  return phoneRegex.test(phone.trim());
}
