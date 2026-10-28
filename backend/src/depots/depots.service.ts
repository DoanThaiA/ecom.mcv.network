import { HttpStatus, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { DepotRepository } from './domain/depot.repository';
import { Depot } from './domain/depot';
import { NhanhAuthService } from '../nhanh/services/nhanh-auth.service';
import { throwException } from '../utils/errors/throw-exception';
import { NullableType } from '../utils/types/nullable.type';

/**
 * Service for managing depots
 */
@Injectable()
export class DepotsService {
  constructor(
    private readonly depotRepository: DepotRepository,
    private readonly nhanhAuthService: NhanhAuthService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Find all depots for the current business
   */
  async findAll(): Promise<Depot[]> {
    const tokenData = await this.nhanhAuthService.getAccessToken();
    const businessId = tokenData?.businessId.toString();

    if (!businessId) {
      throwException({
        status: HttpStatus.UNAUTHORIZED,
        message: this.i18n.t('nhanh.notConnected'),
      });
    }

    return this.depotRepository.findAllByBusiness(businessId);
  }

  /**
   * Find depot by ID
   * @param id - Depot ID
   */
  async findById(id: Depot['id']): Promise<NullableType<Depot>> {
    const depot = await this.depotRepository.findById(id);

    if (!depot) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('depot.notFound'),
      });
    }

    return depot;
  }
}
