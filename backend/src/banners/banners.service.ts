import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaginateResult } from 'mongoose';
import { BannerRepository } from './domain/banner.repository';
import { Banner } from './domain/banner';
import { BannerPosition } from './model/banner-position.enum';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { QueryBannersDto } from './dto/query-banners.dto';
import { ReorderBannersDto } from './dto/reorder-banners.dto';
import { throwException } from '../utils/errors/throw-exception';

/**
 * Service for managing banners
 */
@Injectable()
export class BannersService {
  private readonly logger = new Logger(BannersService.name);

  constructor(
    private readonly bannerRepository: BannerRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Create a new banner
   */
  async create(dto: CreateBannerDto): Promise<Banner> {
    this.logger.debug(`Creating banner for position: ${dto.position}`);

    const banner = await this.bannerRepository.create({
      position: dto.position,
      mediaType: dto.mediaType,
      media: dto.media,
      link: dto.link || null,
      order: dto.order,
      isActive: dto.isActive ?? true,
      deletedAt: null,
    });

    return banner;
  }

  /**
   * Find all banners with filtering and pagination
   */
  async findAll(
    dto: QueryBannersDto,
    page = 1,
    limit = 50,
  ): Promise<PaginateResult<Banner>> {
    this.logger.debug(`Finding banners with filters: ${JSON.stringify(dto)}`);

    const filterOptions = {
      position: dto.position,
      isActive: dto.isActive,
    };

    // Remove undefined values
    Object.keys(filterOptions).forEach((key) => {
      if (filterOptions[key as keyof typeof filterOptions] === undefined) {
        delete filterOptions[key as keyof typeof filterOptions];
      }
    });

    const result = await this.bannerRepository.findManyWithPagination({
      filterOptions:
        Object.keys(filterOptions).length > 0 ? filterOptions : null,
      sortOptions: [{ orderBy: 'order', order: 'asc' }],
      paginationOptions: { page, limit },
    });

    return result;
  }

  /**
   * Find a banner by ID
   */
  async findOne(id: string): Promise<Banner> {
    const banner = await this.bannerRepository.findById(id);

    if (!banner) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('banner.notFound'),
      });
    }

    return banner;
  }

  /**
   * Find active banners by position
   * Used by shop frontend to display banners
   */
  async findActiveByPosition(position: BannerPosition): Promise<Banner[]> {
    this.logger.debug(`Finding active banners for position: ${position}`);
    return this.bannerRepository.findActiveByPosition(position);
  }

  /**
   * Update an existing banner
   */
  async update(id: string, dto: UpdateBannerDto): Promise<Banner> {
    this.logger.debug(`Updating banner ${id}`);

    // Check banner exists
    const existingBanner = await this.bannerRepository.findById(id);
    if (!existingBanner) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('banner.notFound'),
      });
    }

    const updatedBanner = await this.bannerRepository.update(id, dto);

    if (!updatedBanner) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('banner.notFound'),
      });
    }

    return updatedBanner;
  }

  /**
   * Soft delete a banner
   */
  async remove(id: string): Promise<void> {
    const banner = await this.bannerRepository.findById(id);

    if (!banner) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('banner.notFound'),
      });
    }

    await this.bannerRepository.remove(id);
    this.logger.debug(`Deleted banner ${id}`);
  }

  /**
   * Reorder banners (bulk update order)
   */
  async reorder(dto: ReorderBannersDto): Promise<void> {
    this.logger.debug(`Reordering ${dto.banners.length} banners`);

    // Validate all banners exist
    const bannerIds = dto.banners.map((b) => b.bannerId);
    const existingBanners = await Promise.all(
      bannerIds.map((id) => this.bannerRepository.findById(id)),
    );

    const notFoundIds = bannerIds.filter(
      (id, index) => !existingBanners[index],
    );

    if (notFoundIds.length > 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('banner.bannersNotFound'),
        errors: {
          bannerIds: `Banners not found: ${notFoundIds.join(', ')}`,
        },
      });
    }

    // Perform bulk update
    await this.bannerRepository.bulkUpdateOrder(
      dto.banners.map((b) => ({ id: b.bannerId, order: b.order })),
    );

    this.logger.debug(`Successfully reordered banners`);
  }
}
