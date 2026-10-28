import crypto from 'crypto';

/**
 * Generates a cryptographically secure random code verifier for PKCE.
 * The code verifier is a 43-character string containing uppercase, lowercase letters, and numbers.
 * @returns A random code verifier string
 */
export function generateCodeVerifier(): string {
  // Generate random bytes and convert to base64url format
  // We need enough bytes to get 43 characters after encoding
  const bytes = crypto.randomBytes(32);
  return base64UrlEncode(bytes);
}

/**
 * Generates a code challenge from a code verifier using SHA-256 and base64url encoding.
 * @param codeVerifier The code verifier to transform
 * @returns The code challenge string
 */
export function generateCodeChallenge(codeVerifier: string): string {
  // Hash the code verifier using SHA-256
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();

  // Encode to base64url (without padding)
  return base64UrlEncode(hash);
}

/**
 * Encodes a buffer to base64url format (without padding).
 * @param buffer The buffer to encode
 * @returns Base64url encoded string
 */
function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
