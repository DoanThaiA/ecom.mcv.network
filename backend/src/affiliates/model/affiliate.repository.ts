import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { buildAccentInsensitivePattern } from '../../utils/search';
import { Affiliate } from '../domain/affiliate';
import { AffiliateStatus } from '../domain/affiliate-status.enum';
import { AffiliateRepository } from '../domain/affiliate.repository';
import {
  FilterAffiliateDto,
  SortAffiliateDto,
} from '../dto/query-affiliate.dto';
import { AffiliateMapper } from './affiliate.mapper';
import { AffiliateSchemaClass } from './affiliate.schema';

@Injectable()
export class AffiliateDocumentRepository implements AffiliateRepository {
  constructor(
    @InjectModel(AffiliateSchemaClass.name)
    private readonly affiliateModel: PaginateModel<AffiliateSchemaClass>,
  ) {}

  async create(
    data: Omit<Affiliate, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<Affiliate> {
    const doc = AffiliateMapper.toDocument(data as Affiliate);
    const created = new this.affiliateModel(doc);
    const saved = await created.save();
    return AffiliateMapper.toDomain(saved);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterAffiliateDto | null;
    sortOptions?: SortAffiliateDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Affiliate>> {
    const where: FilterQuery<AffiliateSchemaClass> = { deletedAt: null };

    if (filterOptions?.statuses?.length) {
      where['status'] = { $in: filterOptions.statuses };
    }
    if (filterOptions?.types?.length) {
      where['type'] = { $in: filterOptions.types };
    }
    if (filterOptions?.search) {
      const pattern = buildAccentInsensitivePattern(filterOptions.search);
      where['$or'] = [
        { name: { $regex: pattern, $options: 'i' } },
        { affiliateCode: { $regex: pattern, $options: 'i' } },
        { phone: { $regex: pattern, $options: 'i' } },
        { email: { $regex: pattern, $options: 'i' } },
      ];
    }

    const sort = sortOptions?.reduce(
      (acc, opt) => ({
        ...acc,
        [opt.orderBy === 'id' ? '_id' : opt.orderBy]:
          opt.order.toUpperCase() === 'ASC' ? 1 : -1,
      }),
      {},
    ) || { createdAt: -1 };

    const result = await this.affiliateModel.paginate(where, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => AffiliateMapper.toDomain(doc)),
    };
  }

  async findById(id: Affiliate['id']): Promise<NullableType<Affiliate>> {
    const doc = await this.affiliateModel.findOne({
      _id: id,
      deletedAt: null,
    });
    return doc ? AffiliateMapper.toDomain(doc) : null;
  }

  async findByPhone(phone: string): Promise<NullableType<Affiliate>> {
    const doc = await this.affiliateModel.findOne({ phone, deletedAt: null });
    return doc ? AffiliateMapper.toDomain(doc) : null;
  }

  async findByAffiliateCode(code: string): Promise<NullableType<Affiliate>> {
    const doc = await this.affiliateModel.findOne({
      affiliateCode: code,
      deletedAt: null,
    });
    return doc ? AffiliateMapper.toDomain(doc) : null;
  }

  async findAutoUpdate(): Promise<Affiliate[]> {
    const docs = await this.affiliateModel
      .find({
        autoUpdateProducts: true,
        status: AffiliateStatus.ACTIVE,
        deletedAt: null,
      })
      .lean();
    return docs.map((doc) => AffiliateMapper.toDomain(doc));
  }

  async update(
    id: Affiliate['id'],
    payload: Partial<Affiliate>,
  ): Promise<Affiliate | null> {
    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { _id: id.toString(), deletedAt: null };
    const existing = await this.affiliateModel.findOne(filter);

    if (!existing) {
      return null;
    }

    const updated = await this.affiliateModel.findOneAndUpdate(
      filter,
      AffiliateMapper.toDocument({
        ...AffiliateMapper.toDomain(existing),
        ...clonedPayload,
      }),
      { new: true },
    );

    return updated ? AffiliateMapper.toDomain(updated) : null;
  }

  async softDelete(id: Affiliate['id']): Promise<boolean> {
    const result = await this.affiliateModel.updateOne(
      { _id: id.toString(), deletedAt: null },
      { $set: { deletedAt: new Date() } },
    );
    return result.modifiedCount > 0;
  }

  async updateBalance(
    affiliateId: string,
    balance: {
      totalEarned: number;
      totalWithdrawn: number;
      pendingAmount: number;
      availableBalance: number;
    },
  ): Promise<void> {
    await this.affiliateModel.updateOne(
      { _id: affiliateId, deletedAt: null },
      {
        $set: {
          totalEarned: balance.totalEarned,
          totalWithdrawn: balance.totalWithdrawn,
          pendingAmount: balance.pendingAmount,
          availableBalance: balance.availableBalance,
          balanceUpdatedAt: new Date(),
        },
      },
    );
  }

  async findAllActiveIds(): Promise<string[]> {
    const docs = await this.affiliateModel
      .find({ deletedAt: null }, { _id: 1 })
      .lean();
    return docs.map((d) => d._id.toString());
  }
}
