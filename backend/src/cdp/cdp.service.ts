import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import { AllConfigType } from '../config/config.type';
import { LoginRequest, LoginResponse } from './types/auth.types';
import {
  CreateOrUpdateCustomerRequest,
  CreateOrUpdateCustomerResponse,
  GetCustomerRequest,
  GetCustomerResponse,
} from './types/customer.types';
import {
  CreateOrUpdateCustomerTransactionRequest,
  CreateOrUpdateCustomerTransactionResponse,
} from './types/customerTransaction.types';
import { SecretRepository } from '../secret/secret.repository';
import { getCacheKey } from '../utils/env';
import {
  GetVoucherReleaseRequest,
  GetVoucherReleaseResponse,
  GetCustomerVoucherRequest,
  GetCustomerVoucherResponse,
  UpdateCustomerVoucherForTransactionRequest,
  UpdateCustomerVoucherForTransactionResponse,
  UseVoucherRequest,
  UseVoucherResponse,
  CheckVoucherRequest,
  CheckVoucherResponse,
  RemoveVoucherFromOrderRequest,
  RemoveVoucherFromOrderResponse,
  GetVoucherReleaseCodesRequest,
  GetVoucherReleaseCodesResponse,
  SaveCustomerVoucherRequest,
  SaveCustomerVoucherResponse,
  GetAvailableVoucherCodesRequest,
  GetAvailableVoucherCodesResponse,
} from './types/voucher.types';

interface CdpAccessToken {
  token: string;
  expireTime: number;
}

interface AuthServiceClient extends grpc.Client {
  login(
    request: LoginRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: LoginResponse,
    ) => void,
  ): grpc.ClientUnaryCall;
}

interface CustomerServiceClient extends grpc.Client {
  createOrUpdateCustomer(
    request: CreateOrUpdateCustomerRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: CreateOrUpdateCustomerResponse,
    ) => void,
  ): grpc.ClientUnaryCall;
  getCustomer(
    request: GetCustomerRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: GetCustomerResponse,
    ) => void,
  ): grpc.ClientUnaryCall;
}

interface CustomerTransactionServiceClient extends grpc.Client {
  createOrUpdateCustomerTransaction(
    request: CreateOrUpdateCustomerTransactionRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: CreateOrUpdateCustomerTransactionResponse,
    ) => void,
  ): grpc.ClientUnaryCall;
}

interface VoucherServiceClient extends grpc.Client {
  getVoucherRelease(
    request: GetVoucherReleaseRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: GetVoucherReleaseResponse,
    ) => void,
  ): grpc.ClientUnaryCall;

  getCustomerVoucher(
    request: GetCustomerVoucherRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: GetCustomerVoucherResponse,
    ) => void,
  ): grpc.ClientUnaryCall;

  updateCustomerVoucher(
    request: UpdateCustomerVoucherForTransactionRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: UpdateCustomerVoucherForTransactionResponse,
    ) => void,
  ): grpc.ClientUnaryCall;

  useVoucher(
    request: UseVoucherRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: UseVoucherResponse,
    ) => void,
  ): grpc.ClientUnaryCall;

  checkVoucher(
    request: CheckVoucherRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: CheckVoucherResponse,
    ) => void,
  ): grpc.ClientUnaryCall;

  removeVoucherFromOrder(
    request: RemoveVoucherFromOrderRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: RemoveVoucherFromOrderResponse,
    ) => void,
  ): grpc.ClientUnaryCall;

  getVoucherReleaseCodes(
    request: GetVoucherReleaseCodesRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: GetVoucherReleaseCodesResponse,
    ) => void,
  ): grpc.ClientUnaryCall;

  saveCustomerVoucher(
    request: SaveCustomerVoucherRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: SaveCustomerVoucherResponse,
    ) => void,
  ): grpc.ClientUnaryCall;

  getAvailableVoucherCodes(
    request: GetAvailableVoucherCodesRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: GetAvailableVoucherCodesResponse,
    ) => void,
  ): grpc.ClientUnaryCall;
}

@Injectable()
export class CdpService implements OnModuleDestroy {
  private readonly logger = new Logger(CdpService.name);
  private readonly CACHE_KEY = getCacheKey('cdp:token');
  private readonly DB_KEY = 'cdp:token';
  private readonly appId = 'mmenu-internal';
  private authClient: AuthServiceClient;
  private customerClient: CustomerServiceClient;
  private customerTransactionClient: CustomerTransactionServiceClient;
  private voucherClient: VoucherServiceClient;

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private secretRepo: SecretRepository,
  ) {
    try {
      // Load proto files
      const authProtoPath = join(process.cwd(), 'proto/cdp/auth.proto');
      const customerProtoPath = join(process.cwd(), 'proto/cdp/customer.proto');

      const packageDefinition = protoLoader.loadSync(authProtoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      const customerPackageDefinition = protoLoader.loadSync(
        customerProtoPath,
        {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
        },
      );

      const customerTransactionProtoPath = join(
        process.cwd(),
        'proto/cdp/customerTransaction.proto',
      );
      const customerTransactionPackageDefinition = protoLoader.loadSync(
        customerTransactionProtoPath,
        {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
          includeDirs: [join(process.cwd(), 'proto/cdp')],
        },
      );

      const authProto = grpc.loadPackageDefinition(packageDefinition) as any;
      const customerProto = grpc.loadPackageDefinition(
        customerPackageDefinition,
      ) as any;
      const customerTransactionProto = grpc.loadPackageDefinition(
        customerTransactionPackageDefinition,
      ) as any;

      const voucherProtoPath = join(process.cwd(), 'proto/cdp/voucher.proto');
      const voucherPackageDefinition = protoLoader.loadSync(voucherProtoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: [join(process.cwd(), 'proto/cdp')],
      });
      const voucherProto = grpc.loadPackageDefinition(
        voucherPackageDefinition,
      ) as any;

      // Use insecure credentials for internal k8s communication
      const credentials = grpc.credentials.createInsecure();

      const cdpServerAddress = this.configService.getOrThrow(
        'cdp.serverAddress',
        {
          infer: true,
        },
      );

      // Create clients
      this.authClient = new authProto.auth.AuthRoutes(
        cdpServerAddress,
        credentials,
      ) as AuthServiceClient;

      this.customerClient = new customerProto.customer.CustomerRoutes(
        cdpServerAddress,
        credentials,
      ) as CustomerServiceClient;

      this.customerTransactionClient =
        new customerTransactionProto.customerTransaction.CustomerTransactionRoutes(
          cdpServerAddress,
          credentials,
        ) as CustomerTransactionServiceClient;

      this.voucherClient = new voucherProto.voucher.VoucherRoutes(
        cdpServerAddress,
        credentials,
      ) as VoucherServiceClient;

      this.logger.log(`Initialized gRPC clients for ${cdpServerAddress}`);
    } catch (error) {
      this.logger.error('Failed to initialize CDP service:', error);
      throw error;
    }
  }

  onModuleDestroy() {
    try {
      this.authClient.close();
      this.customerClient.close();
      this.customerTransactionClient.close();
      this.voucherClient.close();
    } catch (error) {
      this.logger.error('Error closing gRPC clients:', error);
    }
  }

  /**
   * Authenticate and get access token
   * @returns Access token data with token and expiration time
   */
  private async authenticate(): Promise<CdpAccessToken> {
    const phone = this.configService.getOrThrow('cdp.phone', {
      infer: true,
    });
    const password = this.configService.getOrThrow('cdp.password', {
      infer: true,
    });

    try {
      const request: LoginRequest = { phone, password };

      // Create metadata with appid
      const metadata = new grpc.Metadata();
      metadata.add('appid', this.appId);

      const response = await new Promise<LoginResponse>((resolve, reject) => {
        this.authClient.login(
          request,
          metadata,
          (error: grpc.ServiceError | null, response: LoginResponse) => {
            if (error) {
              this.logger.error('Authentication failed:', {
                code: error.code,
                details: error.details,
              });
              reject(error);
            } else {
              resolve(response);
            }
          },
        );
      });

      if (response.code !== 0 || !response.accessToken) {
        throw new Error(`CDP authentication failed: ${response.message}`);
      }

      this.logger.log('Authentication successful');

      return {
        token: response.accessToken.token,
        expireTime: Number(response.accessToken.expireTime),
      };
    } catch (error) {
      this.logger.error('Authentication error:', error);
      throw error;
    }
  }

  /**
   * Check if token is still valid
   * @param expireTime - Unix timestamp when token expires
   * @returns True if token is valid
   */
  private isTokenValid(expireTime: number): boolean {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const bufferTime = 86400; // 1 day in seconds
    return currentTimestamp < expireTime - bufferTime;
  }

  /**
   * Cache the access token with TTL and save to database
   * @param token - The access token to cache
   * @param expireTime - Unix timestamp when token expires
   */
  private async cacheToken(token: string, expireTime: number): Promise<void> {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const bufferTime = 86400; // 1 day buffer
    const ttlInSeconds = expireTime - currentTimestamp - bufferTime;

    const tokenData: CdpAccessToken = {
      token,
      expireTime,
    };

    // Only cache if the token hasn't already expired
    if (ttlInSeconds > 0) {
      const ttlInMs = ttlInSeconds * 1000;

      try {
        // Save to cache
        await this.cacheManager.set<CdpAccessToken>(
          this.CACHE_KEY,
          tokenData,
          ttlInMs,
        );

        // Save to database key-value store
        await this.secretRepo.set<CdpAccessToken>(this.DB_KEY, tokenData);
      } catch (error) {
        this.logger.error('Error caching token:', error);
        throw error;
      }
    }
  }

  /**
   * Get access token - first from cache, then from database, authenticating if needed
   * @returns The access token string or null if authentication fails
   */
  async getAccessToken(): Promise<string | null> {
    try {
      // Try to get from cache first
      const cachedData = await this.cacheManager.get<CdpAccessToken>(
        this.CACHE_KEY,
      );

      if (cachedData && this.isTokenValid(cachedData.expireTime)) {
        return cachedData.token;
      }

      // Remove expired cache
      if (cachedData) {
        await this.cacheManager.del(this.CACHE_KEY);
      }

      // Cache miss or expired - try to get from database
      const dbToken = await this.secretRepo.get<CdpAccessToken>(this.DB_KEY);

      if (dbToken && this.isTokenValid(dbToken.expireTime)) {
        // Cache the valid token from database
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const bufferTime = 86400;
        const ttlInSeconds = dbToken.expireTime - currentTimestamp - bufferTime;
        const ttlInMs = ttlInSeconds * 1000;

        await this.cacheManager.set<CdpAccessToken>(
          this.CACHE_KEY,
          dbToken,
          ttlInMs,
        );
        return dbToken.token;
      }

      // No valid token - need to authenticate
      const newToken = await this.authenticate();
      await this.cacheToken(newToken.token, newToken.expireTime);
      return newToken.token;
    } catch (error) {
      this.logger.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Create or update customer in CDP
   * @param request - Customer data request
   * @returns Response with customer data
   */
  async createOrUpdateCustomer(
    request: CreateOrUpdateCustomerRequest,
  ): Promise<CreateOrUpdateCustomerResponse> {
    const token = await this.getAccessToken();

    if (!token) {
      throw new Error('Failed to get CDP access token');
    }

    try {
      // Create metadata with authorization and appid
      const metadata = new grpc.Metadata();
      metadata.add('authorization', `Bearer ${token}`);
      metadata.add('appid', this.appId);

      const response = await new Promise<CreateOrUpdateCustomerResponse>(
        (resolve, reject) => {
          this.customerClient.createOrUpdateCustomer(
            request,
            metadata,
            (error, response) => {
              if (error) {
                this.logger.error('Sync failed:', {
                  code: error.code,
                  details: error.details,
                });
                reject(error);
              } else {
                resolve(response);
              }
            },
          );
        },
      );

      if (response.code !== 0) {
        this.logger.error('Sync error:', response.message);
      }

      return response;
    } catch (error) {
      this.logger.error('Failed to sync customer:', error);
      throw error;
    }
  }

  /**
   * Get customer from CDP by phone or other identifiers
   * @param request - Customer lookup request
   * @returns Response with customer data if found
   */
  async getCustomer(request: GetCustomerRequest): Promise<GetCustomerResponse> {
    const token = await this.getAccessToken();

    if (!token) {
      throw new Error('Failed to get CDP access token');
    }

    try {
      const metadata = new grpc.Metadata();
      metadata.add('authorization', `Bearer ${token}`);
      metadata.add('appid', this.appId);

      const response = await new Promise<GetCustomerResponse>(
        (resolve, reject) => {
          this.customerClient.getCustomer(
            request,
            metadata,
            (error, response) => {
              if (error) {
                reject(error);
              } else {
                resolve(response);
              }
            },
          );
        },
      );

      return response;
    } catch (error) {
      this.logger.error('Failed to get customer:', error);
      throw error;
    }
  }

  /**
   * Invalidate (remove) the cached token
   */
  async invalidateToken(): Promise<void> {
    try {
      await this.cacheManager.del(this.CACHE_KEY);
    } catch (error) {
      this.logger.error('Error invalidating token:', error);
      throw error;
    }
  }

  /**
   * Check CDP connection by getting a fresh token
   * @returns True if authentication succeeds
   */
  async checkConnection(): Promise<boolean> {
    await this.invalidateToken();

    try {
      const token = await this.getAccessToken();
      return !!token;
    } catch (error) {
      this.logger.error('Connection check failed:', error);
      return false;
    }
  }

  /**
   * Create or update customer transaction in CDP
   * @param request - Transaction data request
   * @returns Response with result
   */
  async createOrUpdateCustomerTransaction(
    request: CreateOrUpdateCustomerTransactionRequest,
  ): Promise<CreateOrUpdateCustomerTransactionResponse> {
    const token = await this.getAccessToken();

    if (!token) {
      throw new Error('Failed to get CDP access token');
    }

    const metadata = new grpc.Metadata();
    metadata.add('authorization', `Bearer ${token}`);
    metadata.add('appid', this.appId);

    const response =
      await new Promise<CreateOrUpdateCustomerTransactionResponse>(
        (resolve, reject) => {
          this.customerTransactionClient.createOrUpdateCustomerTransaction(
            request,
            metadata,
            (error, response) => {
              if (error) {
                reject(error);
              } else {
                resolve(response);
              }
            },
          );
        },
      );

    if (response.code !== 0) {
      this.logger.error('Transaction sync error:', response.message);
    }

    return response;
  }
  /**
   * Get voucher release (to find generic vouchers)
   */
  async getVoucherRelease(
    request: GetVoucherReleaseRequest,
  ): Promise<GetVoucherReleaseResponse> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('Failed to get CDP access token');

    const metadata = new grpc.Metadata();
    metadata.add('authorization', `Bearer ${token}`);
    metadata.add('appid', this.appId);

    return new Promise((resolve, reject) => {
      this.voucherClient.getVoucherRelease(
        request,
        metadata,
        (error, response) => {
          if (error) reject(error);
          else resolve(response);
        },
      );
    });
  }

  /**
   * Get customer vouchers (to check usage)
   */
  async getCustomerVoucher(
    request: GetCustomerVoucherRequest,
  ): Promise<GetCustomerVoucherResponse> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('Failed to get CDP access token');

    const metadata = new grpc.Metadata();
    metadata.add('authorization', `Bearer ${token}`);
    metadata.add('appid', this.appId);

    return new Promise((resolve, reject) => {
      this.voucherClient.getCustomerVoucher(
        request,
        metadata,
        (error, response) => {
          if (error) reject(error);
          else resolve(response);
        },
      );
    });
  }

  /**
   * Update customer voucher usage (redeem)
   */
  async updateCustomerVoucher(
    request: UpdateCustomerVoucherForTransactionRequest,
  ): Promise<UpdateCustomerVoucherForTransactionResponse> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('Failed to get CDP access token');

    const metadata = new grpc.Metadata();
    metadata.add('authorization', `Bearer ${token}`);
    metadata.add('appid', this.appId);

    return new Promise((resolve, reject) => {
      this.voucherClient.updateCustomerVoucher(
        request,
        metadata,
        (error, response) => {
          if (error) reject(error);
          else resolve(response);
        },
      );
    });
  }

  /**
   * Check voucher code validity without consuming usage
   */
  async checkVoucher(
    request: CheckVoucherRequest,
  ): Promise<CheckVoucherResponse> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('Failed to get CDP access token');

    const metadata = new grpc.Metadata();
    metadata.add('authorization', `Bearer ${token}`);
    metadata.add('appid', this.appId);

    return new Promise((resolve, reject) => {
      this.voucherClient.checkVoucher(request, metadata, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  /**
   * Use voucher (consume usage) - call when order is placed
   */
  async useVoucher(request: UseVoucherRequest): Promise<UseVoucherResponse> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('Failed to get CDP access token');

    const metadata = new grpc.Metadata();
    metadata.add('authorization', `Bearer ${token}`);
    metadata.add('appid', this.appId);

    return new Promise((resolve, reject) => {
      this.voucherClient.useVoucher(request, metadata, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  /**
   * Remove voucher from order (release the voucher back)
   */
  async removeVoucherFromOrder(
    request: RemoveVoucherFromOrderRequest,
  ): Promise<RemoveVoucherFromOrderResponse> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('Failed to get CDP access token');

    const metadata = new grpc.Metadata();
    metadata.add('authorization', `Bearer ${token}`);
    metadata.add('appid', this.appId);

    return new Promise((resolve, reject) => {
      this.voucherClient.removeVoucherFromOrder(
        request,
        metadata,
        (error, response) => {
          if (error) reject(error);
          else resolve(response);
        },
      );
    });
  }

  /**
   * Get voucher release codes file for a voucher release event
   * @param request - Request with voucher_release_event_id
   * @returns Response with file data containing voucher codes
   */
  async getVoucherReleaseCodes(
    request: GetVoucherReleaseCodesRequest,
  ): Promise<GetVoucherReleaseCodesResponse> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('Failed to get CDP access token');

    const metadata = new grpc.Metadata();
    metadata.add('authorization', `Bearer ${token}`);
    metadata.add('appid', this.appId);

    return new Promise((resolve, reject) => {
      this.voucherClient.getVoucherReleaseCodes(
        request,
        metadata,
        (error, response) => {
          if (error) reject(error);
          else resolve(response);
        },
      );
    });
  }

  /**
   * Save (assign) a voucher to a customer in CDP
   * @param request - Request with voucher_id, code, and customer_id
   * @returns Response with result code and message
   */
  async saveCustomerVoucher(
    request: SaveCustomerVoucherRequest,
  ): Promise<SaveCustomerVoucherResponse> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('Failed to get CDP access token');

    const metadata = new grpc.Metadata();
    metadata.add('authorization', `Bearer ${token}`);
    metadata.add('appid', this.appId);

    return new Promise((resolve, reject) => {
      this.voucherClient.saveCustomerVoucher(
        request,
        metadata,
        (error, response) => {
          if (error) reject(error);
          else resolve(response);
        },
      );
    });
  }

  /**
   * Get available (unassigned) voucher codes for a voucher release event
   * @param request - Request with voucher_id and limit
   * @returns Response with available voucher codes
   */
  async getAvailableVoucherCodes(
    request: GetAvailableVoucherCodesRequest,
  ): Promise<GetAvailableVoucherCodesResponse> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('Failed to get CDP access token');

    const metadata = new grpc.Metadata();
    metadata.add('authorization', `Bearer ${token}`);
    metadata.add('appid', this.appId);

    return new Promise((resolve, reject) => {
      this.voucherClient.getAvailableVoucherCodes(
        request,
        metadata,
        (error, response) => {
          if (error) reject(error);
          else resolve(response);
        },
      );
    });
  }
}
