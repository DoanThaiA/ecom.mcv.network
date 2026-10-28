import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { env } from '../env';

export interface ProxyRequestOptions {
  url: string;
  method: Method;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  data?: unknown;
  timeout?: number;
}

/**
 * Sends a request, using a Vietnam proxy server if configured.
 * Use this for APIs that require requests from Vietnam IP addresses.
 * Falls back to direct request if VN_PROXY_URL is not configured.
 *
 * @param options - The request options to be proxied
 * @returns The response from the request
 */
export async function sendVnProxiedRequest<T = unknown>(
  options: ProxyRequestOptions,
): Promise<AxiosResponse<T>> {
  const vnProxyUrl = env.VN_PROXY_URL;
  const axiosConfig: AxiosRequestConfig = {
    timeout: options.timeout ?? 10000,
  };

  if (vnProxyUrl) {
    // Use VN proxy to bypass IP restrictions
    const proxyPayload = {
      url: options.url,
      method: options.method,
      headers: options.headers,
      params: options.params,
      data: options.data,
    };

    return axios.post<T>(
      `${vnProxyUrl}/v1/proxy/send-request`,
      proxyPayload,
      axiosConfig,
    );
  }

  // Direct request (only works from Vietnam IP)
  return axios.request<T>({
    url: options.url,
    method: options.method,
    headers: options.headers,
    params: options.params,
    data: options.data,
    ...axiosConfig,
  });
}
