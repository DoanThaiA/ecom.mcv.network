import { HttpStatus, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaginateResult } from 'mongoose';
import { AffiliateRepository } from './domain/affiliate.repository';
import { Affiliate } from './domain/affiliate';
import { AffiliateStatus } from './domain/affiliate-status.enum';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';
import {
  FilterAffiliateDto,
  SortAffiliateDto,
} from './dto/query-affiliate.dto';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { NullableType } from '../utils/types/nullable.type';
import { throwException } from '../utils/errors/throw-exception';
import { CommissionSettingsRepository } from '../commission-settings/domain/commission-settings.repository';

/**
 * Generate a random affiliate code in format AFF-XXXXXX
 * where X is uppercase alphanumeric
 */
function generateAffiliateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AFF-${code}`;
}

@Injectable()
export class AffiliatesService {
  constructor(
    private readonly affiliateRepository: AffiliateRepository,
    private readonly commissionSettingsRepository: CommissionSettingsRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Create a new affiliate with auto-generated unique code
   */
  async create(dto: CreateAffiliateDto): Promise<Affiliate> {
    // Check phone uniqueness
    const existingPhone = await this.affiliateRepository.findByPhone(dto.phone);
    if (existingPhone) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('affiliate.phoneAlreadyExists'),
      });
    }

    // Generate unique affiliate code with retry
    let affiliateCode: string = '';
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidate = generateAffiliateCode();
      const existing =
        await this.affiliateRepository.findByAffiliateCode(candidate);
      if (!existing) {
        affiliateCode = candidate;
        break;
      }
    }
    if (!affiliateCode) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('affiliate.codeGenerationFailed'),
      });
    }

    // Use global default rate when not provided or 0
    let defaultCommissionRate = dto.defaultCommissionRate ?? null;
    if (!defaultCommissionRate) {
      const settings = await this.commissionSettingsRepository.getOrCreate();
      defaultCommissionRate = settings.defaultCommissionRate;
    }

    return this.affiliateRepository.create({
      name: dto.name,
      affiliateCode,
      type: dto.type,
      email: dto.email,
      phone: dto.phone,
      bankAccountHolder: dto.bankAccountHolder ?? null,
      bankName: dto.bankName ?? null,
      bankAccountNumber: dto.bankAccountNumber ?? null,
      citizenId: dto.citizenId ?? null,
      notes: dto.notes ?? null,
      status: AffiliateStatus.ACTIVE,
      defaultCommissionRate,
      autoUpdateProducts: dto.autoUpdateProducts ?? true,
    });
  }

  /**
   * List affiliates with pagination, filter, and sort
   */
  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterAffiliateDto | null;
    sortOptions?: SortAffiliateDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Affiliate>> {
    return this.affiliateRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  /**
   * Find affiliate by ID
   */
  findById(id: Affiliate['id']): Promise<NullableType<Affiliate>> {
    return this.affiliateRepository.findById(id);
  }

  /**
   * Update affiliate
   */
  async update(
    id: Affiliate['id'],
    dto: UpdateAffiliateDto,
  ): Promise<Affiliate | null> {
    // Check phone uniqueness if changed
    if (dto.phone) {
      const existingPhone = await this.affiliateRepository.findByPhone(
        dto.phone,
      );
      if (existingPhone && existingPhone.id !== id) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('affiliate.phoneAlreadyExists'),
        });
      }
    }

    return this.affiliateRepository.update(id, {
      name: dto.name,
      type: dto.type,
      email: dto.email,
      phone: dto.phone,
      bankAccountHolder: dto.bankAccountHolder,
      bankName: dto.bankName,
      bankAccountNumber: dto.bankAccountNumber,
      citizenId: dto.citizenId,
      notes: dto.notes,
      status: dto.status,
      defaultCommissionRate: dto.defaultCommissionRate,
      autoUpdateProducts: dto.autoUpdateProducts,
    });
  }

  /**
   * Soft delete affiliate
   */
  async remove(id: Affiliate['id']): Promise<void> {
    const deleted = await this.affiliateRepository.softDelete(id);
    if (!deleted) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('affiliate.notFound'),
      });
    }
  }
}
