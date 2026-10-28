import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { ReturnRequestRepository } from './domain/return-request.repository';
import { ReturnRequest } from './domain/return-request';
import { ReturnRequestStatus } from './domain/return-request-status.enum';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';
import { UpdateReturnRequestDto } from './dto/update-return-request.dto';
import { QueryReturnRequestDto } from './dto/query-return-request.dto';
import { throwException } from '../utils/errors/throw-exception';
import { UserRepository } from '../users/domain/user.repository';
import { OrderService } from '../shop/order/order.service';
import { FilesService } from '../files/files.service';
import { PaginateResult } from 'mongoose';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class ReturnsService {
  private readonly logger = new Logger(ReturnsService.name);

  constructor(
    private readonly returnRequestRepository: ReturnRequestRepository,
    private readonly userRepository: UserRepository,
    private readonly orderService: OrderService,
    private readonly filesService: FilesService,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  /**
   * Helper to construct full URL for files
   */
  private getFullImageUrl(path: string): string {
    // Already a full URL
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Check file driver
    const fileDriver = this.configService.get('file.driver', { infer: true });

    if (fileDriver === 'local') {
      // Local files: prefix with backend domain
      const backendDomain = this.configService.getOrThrow('app.backendDomain', {
        infer: true,
      });
      return `${backendDomain}${path}`;
    } else if (fileDriver === 's3' || fileDriver === 's3-presigned') {
      // S3 files: construct S3 URL
      const bucket = this.configService.get('file.awsDefaultS3Bucket', {
        infer: true,
      });
      const region = this.configService.get('file.awsS3Region', {
        infer: true,
      });
      return `https://${bucket}.s3.${region}.amazonaws.com/${path}`;
    }

    // Fallback: return as-is
    return path;
  }

  /**
   * Create return request with embedded customer/order snapshots
   */
  async createReturnRequest(
    userId: string,
    dto: CreateReturnRequestDto,
  ): Promise<ReturnRequest> {
    // 1. Fetch order by order number
    const order = await this.orderService.getByOrderNumber(dto.orderNumber);

    // 2. Validate order belongs to the user
    if (!order.userId || order.userId !== userId) {
      throwException({
        status: HttpStatus.FORBIDDEN,
        message: this.i18n.t('shop.order.notYourOrder'),
      });
    }

    // 3. Fetch user info
    const user = await this.userRepository.findById(userId);

    // 4. Build customer snapshot
    const customer = {
      name:
        order.customer?.name ||
        `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
        'N/A',
      phone: order.customer?.phone || user?.phone || 'N/A',
      email: order.customer?.email || user?.email || undefined,
      address: order.shippingAddress
        ? [
            order.shippingAddress.address,
            order.shippingAddress.ward,
            order.shippingAddress.district,
            order.shippingAddress.city,
          ]
            .filter(Boolean)
            .join(', ')
        : undefined,
    };

    // 5. Build order snapshot
    const orderSnapshot = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      nhanh: order.nhanh
        ? {
            orderId: order.nhanh.orderId,
            syncStatus: order.nhanh.syncStatus,
          }
        : undefined,
      orderAmount: order.total,
      items: (order.items || []).map((item) => ({
        productId: item.productId,
        variantId: item.variantId || undefined,
        code: item.code,
        name: item.name,
        image: item.image || undefined,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    // 6. Resolve image URLs from file IDs
    let imageUrls: string[] = [];
    if (dto.imageIds && dto.imageIds.length > 0) {
      try {
        const files = await Promise.all(
          dto.imageIds.map((id) => this.filesService.findById(id)),
        );
        imageUrls = files
          .filter((f) => f?.path)
          .map((f) => this.getFullImageUrl(f!.path));
      } catch (error) {
        this.logger.warn('Failed to resolve image URLs:', error);
      }
    }

    // 7. Create return request
    const created = await this.returnRequestRepository.create({
      userId,
      customer,
      orderSnapshot,
      requestType: dto.requestType,
      returnReasons: dto.returnReasons,
      exchangeReasons: dto.exchangeReasons,
      otherReason: dto.otherReason,
      images: imageUrls,
      bankInfo: dto.bankInfo,
      status: ReturnRequestStatus.PENDING,
    });

    return created;
  }

  /**
   * Get return requests for CMS (all users)
   */
  async getReturnRequests(
    query: QueryReturnRequestDto,
  ): Promise<PaginateResult<ReturnRequest>> {
    const { page = 1, limit = 10, ...filters } = query;
    return this.returnRequestRepository.findAll(filters, page, limit);
  }

  /**
   * Get return requests for a specific user (shop)
   */
  async getMyReturnRequests(
    userId: string,
    query: QueryReturnRequestDto,
  ): Promise<PaginateResult<ReturnRequest>> {
    const { page = 1, limit = 10, ...filters } = query;
    return this.returnRequestRepository.findAll(
      { ...filters, userId },
      page,
      limit,
    );
  }

  /**
   * Get return request by ID
   */
  async getReturnRequestById(id: string): Promise<ReturnRequest> {
    const result = await this.returnRequestRepository.findById(id);
    if (!result) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: await this.i18n.translate('common.notFound', {
          args: { entity: 'Return request' },
        }),
      });
    }
    return result;
  }

  /**
   * Update return request (CMS only)
   */
  async updateReturnRequest(
    id: string,
    dto: UpdateReturnRequestDto,
  ): Promise<ReturnRequest> {
    const existing = await this.returnRequestRepository.findById(id);
    if (!existing) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: await this.i18n.translate('common.notFound', {
          args: { entity: 'Return request' },
        }),
      });
    }

    const updated = await this.returnRequestRepository.update(id, dto);
    if (!updated) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: await this.i18n.translate('common.updateFailed'),
      });
    }

    return updated;
  }

  /**
   * Delete return request
   */
  async deleteReturnRequest(id: string): Promise<void> {
    const deleted = await this.returnRequestRepository.delete(id);
    if (!deleted) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: await this.i18n.translate('common.notFound', {
          args: { entity: 'Return request' },
        }),
      });
    }
  }
}
