/**
 * Utility functions for environment detection
 */

/**
 * Check if we're running on the main/production environment
 * @returns true if on main environment (cchatapi.mmenu.io)
 */
export const isMainEnvironment = (): boolean => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  return (
    apiUrl.includes('cchatapi.mmenu.io') &&
    !apiUrl.includes('internalcchatapi.mmenu.io') &&
    !apiUrl.includes('stagingcchatapi.mmenu.io')
  );
};

/**
 * Check if we're running on the internal environment
 * @returns true if on internal environment (internalcchatapi.mmenu.io)
 */
export const isInternalEnvironment = (): boolean => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  return apiUrl.includes('internalcchatapi.mmenu.io');
};

/**
 * Get the current environment name
 * @returns 'main' | 'internal'
 */
export const getCurrentEnvironment = (): 'main' | 'internal' => {
  if (isMainEnvironment()) return 'main';
  return 'internal';
};

export const getCurrentBaseUrl = (): string => {
  if (isMainEnvironment()) return 'https://cchat.vn';
  if (isInternalEnvironment()) return 'https://internalcchat.mmenu.io';
  return 'https://stagingcchat.mmenu.io';
};

/**
 * Get the API base URL
 * @returns the current API URL
 */
export const getApiUrl = (): string =>
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
