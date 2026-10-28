import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaginateResult } from 'mongoose';
import { ColorVariantRepository } from './domain/color-variant.repository';
import { ColorVariant } from './domain/color-variant';
import { CreateColorVariantDto } from './dto/create-color-variant.dto';
import { UpdateColorVariantDto } from './dto/update-color-variant.dto';
import { QueryColorVariantsDto } from './dto/query-color-variants.dto';
import { throwException } from '../utils/errors/throw-exception';

/**
 * Service for managing color variants
 */
@Injectable()
export class ColorVariantsService {
  private readonly logger = new Logger(ColorVariantsService.name);

  constructor(
    private readonly colorVariantRepository: ColorVariantRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Normalize color name for matching (lowercase, trimmed)
   */
  private normalizeColorName(name: string): string {
    return name.toLowerCase().trim();
  }

  /**
   * Create a new color variant
   */
  async create(dto: CreateColorVariantDto): Promise<ColorVariant> {
    this.logger.debug(`Creating color variant: ${dto.name}`);

    const nameNormalized = this.normalizeColorName(dto.name);

    // Check for duplicate name
    const exists =
      await this.colorVariantRepository.existsByNormalizedName(nameNormalized);

    if (exists) {
      throwException({
        status: HttpStatus.CONFLICT,
        message: this.i18n.t('colorVariant.nameAlreadyExists'),
        errors: {
          name: `Color variant with name "${dto.name}" already exists`,
        },
      });
    }

    const colorVariant = await this.colorVariantRepository.create({
      name: dto.name,
      nameNormalized,
      displayType: dto.displayType,
      display: {
        colorValue: dto.display.colorValue || null,
        patternImage: dto.display.patternImage || null,
      },
      order: dto.order ?? 0,
    });

    return colorVariant;
  }

  /**
   * Find all color variants with filtering and pagination
   */
  async findAll(
    dto: QueryColorVariantsDto,
    page = 1,
    limit = 50,
  ): Promise<PaginateResult<ColorVariant>> {
    this.logger.debug(
      `Finding color variants with filters: ${JSON.stringify(dto)}`,
    );

    const filterOptions = {
      displayType: dto.displayType,
      name: dto.name,
    };

    // Remove undefined values
    Object.keys(filterOptions).forEach((key) => {
      if (filterOptions[key as keyof typeof filterOptions] === undefined) {
        delete filterOptions[key as keyof typeof filterOptions];
      }
    });

    const result = await this.colorVariantRepository.findManyWithPagination({
      filterOptions:
        Object.keys(filterOptions).length > 0 ? filterOptions : null,
      sortOptions: [{ orderBy: 'order', order: 'asc' }],
      paginationOptions: { page, limit },
    });

    return result;
  }

  /**
   * Find a color variant by ID
   */
  async findOne(id: string): Promise<ColorVariant> {
    const colorVariant = await this.colorVariantRepository.findById(id);

    if (!colorVariant) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('colorVariant.notFound'),
      });
    }

    return colorVariant;
  }

  /**
   * Find all color variants (for public shop endpoint)
   */
  async findAllColors(): Promise<ColorVariant[]> {
    this.logger.debug('Finding all color variants');
    return this.colorVariantRepository.findAll();
  }

  /**
   * Batch lookup color variants by names
   */
  async batchLookupByNames(names: string[]): Promise<ColorVariant[]> {
    this.logger.debug(`Batch lookup for ${names.length} color names`);

    const normalizedNames = names.map((n) => this.normalizeColorName(n));
    return this.colorVariantRepository.findByNormalizedNames(normalizedNames);
  }

  /**
   * Update an existing color variant
   */
  async update(id: string, dto: UpdateColorVariantDto): Promise<ColorVariant> {
    this.logger.debug(`Updating color variant ${id}`);

    // Check color variant exists
    const existingColorVariant = await this.colorVariantRepository.findById(id);
    if (!existingColorVariant) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('colorVariant.notFound'),
      });
    }

    // If name is being updated, check for duplicates
    if (dto.name) {
      const nameNormalized = this.normalizeColorName(dto.name);
      const exists = await this.colorVariantRepository.existsByNormalizedName(
        nameNormalized,
        id,
      );

      if (exists) {
        throwException({
          status: HttpStatus.CONFLICT,
          message: this.i18n.t('colorVariant.nameAlreadyExists'),
          errors: {
            name: `Color variant with name "${dto.name}" already exists`,
          },
        });
      }
    }

    const updatePayload: Record<string, any> = {};
    if (dto.name !== undefined) {
      updatePayload.name = dto.name;
      updatePayload.nameNormalized = this.normalizeColorName(dto.name);
    }
    if (dto.displayType !== undefined)
      updatePayload.displayType = dto.displayType;
    if (dto.display !== undefined) updatePayload.display = dto.display;
    if (dto.order !== undefined) updatePayload.order = dto.order;

    const updatedColorVariant = await this.colorVariantRepository.update(
      id,
      updatePayload,
    );

    if (!updatedColorVariant) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('colorVariant.notFound'),
      });
    }

    return updatedColorVariant;
  }

  /**
   * Hard delete a color variant
   */
  async remove(id: string): Promise<void> {
    const colorVariant = await this.colorVariantRepository.findById(id);

    if (!colorVariant) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('colorVariant.notFound'),
      });
    }

    await this.colorVariantRepository.remove(id);
    this.logger.debug(`Deleted color variant ${id}`);
  }
}
