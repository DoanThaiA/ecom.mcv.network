import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaginateResult } from 'mongoose';
import { PopupAdsRepository } from './domain/popup-ads.repository';
import { PopupAds } from './domain/popup-ads';
import { CreatePopupAdsDto } from './dto/create-popup-ads.dto';
import { UpdatePopupAdsDto } from './dto/update-popup-ads.dto';
import { QueryPopupAdsDto } from './dto/query-popup-ads.dto';
import { throwException } from '../utils/errors/throw-exception';

/**
 * Service for managing popup ads
 */
@Injectable()
export class PopupAdsService {
  private readonly logger = new Logger(PopupAdsService.name);

  constructor(
    private readonly popupAdsRepository: PopupAdsRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Create a new popup ads
   */
  async create(dto: CreatePopupAdsDto): Promise<PopupAds> {
    this.logger.debug(`Creating popup ads: ${dto.name}`);

    const popupAds = await this.popupAdsRepository.create({
      image: dto.image,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      name: dto.name,
      link: dto.link || null,
      order: dto.order ?? 0,
      isActive: dto.isActive ?? true,
      deletedAt: null,
    });

    return popupAds;
  }

  /**
   * Find all popup ads with filtering and pagination
   */
  async findAll(
    dto: QueryPopupAdsDto,
    page = 1,
    limit = 50,
  ): Promise<PaginateResult<PopupAds>> {
    this.logger.debug(`Finding popup ads with filters: ${JSON.stringify(dto)}`);

    const filterOptions: Record<string, any> = {};

    if (dto.isActive !== undefined) {
      filterOptions.isActive = dto.isActive;
    }
    if (dto.name) {
      filterOptions.name = dto.name;
    }

    const result = await this.popupAdsRepository.findManyWithPagination({
      filterOptions:
        Object.keys(filterOptions).length > 0 ? filterOptions : null,
      sortOptions: [
        { orderBy: 'order', order: 'asc' },
        { orderBy: 'createdAt', order: 'asc' },
      ],
      paginationOptions: { page, limit },
    });

    return result;
  }

  /**
   * Find a popup ads by ID
   */
  async findOne(id: string): Promise<PopupAds> {
    const popupAds = await this.popupAdsRepository.findById(id);

    if (!popupAds) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('popupAds.notFound'),
      });
    }

    return popupAds;
  }

  /**
   * Find active popup ads within the current time range
   * Used by shop frontend to display popup ads
   */
  async findActiveInRange(): Promise<PopupAds[]> {
    this.logger.debug('Finding active popup ads within current time range');
    return this.popupAdsRepository.findActiveInRange();
  }

  /**
   * Update an existing popup ads
   */
  async update(id: string, dto: UpdatePopupAdsDto): Promise<PopupAds> {
    this.logger.debug(`Updating popup ads ${id}`);

    const existing = await this.popupAdsRepository.findById(id);
    if (!existing) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('popupAds.notFound'),
      });
    }

    const payload: Record<string, any> = {};
    if (dto.image !== undefined) payload.image = dto.image;
    if (dto.startAt !== undefined) payload.startAt = new Date(dto.startAt);
    if (dto.endAt !== undefined) payload.endAt = new Date(dto.endAt);
    if (dto.name !== undefined) payload.name = dto.name;
    if ('link' in dto) payload.link = dto.link;
    if (dto.order !== undefined) payload.order = dto.order;
    if (dto.isActive !== undefined) payload.isActive = dto.isActive;

    const updated = await this.popupAdsRepository.update(id, payload);

    if (!updated) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('popupAds.notFound'),
      });
    }

    return updated;
  }

  /**
   * Soft delete a popup ads
   */
  async remove(id: string): Promise<void> {
    const popupAds = await this.popupAdsRepository.findById(id);

    if (!popupAds) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('popupAds.notFound'),
      });
    }

    await this.popupAdsRepository.remove(id);
    this.logger.debug(`Deleted popup ads ${id}`);
  }
}
