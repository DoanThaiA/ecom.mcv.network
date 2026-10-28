export type InfocmsConfig = {
  /** Master ID from CMS contract */
  masterId: string;
  /** Client ID for API access */
  clientId: string;
  /** Client secret for HMAC authentication */
  clientSecret: string;
  /** Bank code for processing */
  bankCode: string;
  /** POS unique ID for this system */
  posUniqueId: string;
  /** RSA private key (Base64 encoded PKCS#8) for signing API requests */
  privateKey?: string;
  /** InfoCMS RSA public key (Base64 encoded) for verifying callback signatures */
  publicKey?: string;
};
