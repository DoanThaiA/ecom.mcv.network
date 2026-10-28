import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';

import { NullableType } from '../../utils/types/nullable.type';
import { FilterCmsUserDto, SortCmsUserDto } from '../dto/query-cms-user.dto';
import { CmsUser } from '../domain/cms-user';
import { CmsUserRepository } from '../domain/cms-user.repository';
import { CmsUserSchemaClass } from './cms-user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery } from 'mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import { CmsUserMapper } from './cms-user.mapper';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { buildAccentInsensitivePattern } from '../../utils/search';

@Injectable()
export class CmsUsersDocumentRepository implements CmsUserRepository {
  constructor(
    @InjectModel(CmsUserSchemaClass.name)
    private readonly cmsUsersModel: PaginateModel<CmsUserSchemaClass>,
  ) {}

  async create(data: CmsUser): Promise<CmsUser> {
    const cmsUserDocument = CmsUserMapper.toDocument(data);
    const createdCmsUser = new this.cmsUsersModel(cmsUserDocument);
    try {
      const cmsUserObject = await createdCmsUser.save();
      return CmsUserMapper.toDomain(cmsUserObject);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: number }).code === 11000
      ) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterCmsUserDto | null;
    sortOptions?: SortCmsUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<CmsUser>> {
    const where: FilterQuery<CmsUserSchemaClass> = { deletedAt: null };
    if (filterOptions?.permissionGroups?.length) {
      where['permissionGroup'] = {
        $in: filterOptions.permissionGroups,
      };
    }

    if (filterOptions?.search) {
      const pattern = buildAccentInsensitivePattern(filterOptions.search);
      const searchRegex = new RegExp(pattern, 'i');
      where['$or'] = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    if (filterOptions?.statuses?.length) {
      where['status'] = { $in: filterOptions.statuses };
    }

    if (filterOptions?.accountTypes?.length) {
      where['accountType'] = { $in: filterOptions.accountTypes };
    }

    const sort = sortOptions?.reduce(
      (accumulator, sortOption) => ({
        ...accumulator,
        [sortOption.orderBy === 'id' ? '_id' : sortOption.orderBy]:
          sortOption.order.toUpperCase() === 'ASC' ? 1 : -1,
      }),
      {},
    ) || { createdAt: -1 };

    const result = await this.cmsUsersModel.paginate(where, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => CmsUserMapper.toDomain(doc)),
    };
  }

  async findById(id: CmsUser['id']): Promise<NullableType<CmsUser>> {
    const cmsUserObject = await this.cmsUsersModel.findOne({
      _id: id,
      deletedAt: null,
    });
    return cmsUserObject ? CmsUserMapper.toDomain(cmsUserObject) : null;
  }

  async findByIds(ids: CmsUser['id'][]): Promise<CmsUser[]> {
    const cmsUserObjects = await this.cmsUsersModel.find({
      _id: { $in: ids },
      deletedAt: null,
    });
    return cmsUserObjects.map((cmsUserObject) =>
      CmsUserMapper.toDomain(cmsUserObject),
    );
  }

  async findByEmail(email: CmsUser['email']): Promise<NullableType<CmsUser>> {
    if (!email) return null;

    const cmsUserObject = await this.cmsUsersModel.findOne({
      email,
      deletedAt: null,
    });
    return cmsUserObject ? CmsUserMapper.toDomain(cmsUserObject) : null;
  }

  async findByEmailAll(
    email: CmsUser['email'],
  ): Promise<NullableType<CmsUser>> {
    if (!email) return null;

    const cmsUserObject = await this.cmsUsersModel.findOne({ email });
    return cmsUserObject ? CmsUserMapper.toDomain(cmsUserObject) : null;
  }

  async freeEmail(id: CmsUser['id']): Promise<void> {
    await this.cmsUsersModel.findByIdAndUpdate(id, {
      email: `deleted_${id}`,
    });
  }

  async findByAffiliateId(affiliateId: string): Promise<NullableType<CmsUser>> {
    const cmsUserObject = await this.cmsUsersModel.findOne({
      affiliateId,
      deletedAt: null,
    });
    return cmsUserObject ? CmsUserMapper.toDomain(cmsUserObject) : null;
  }

  async update(
    id: CmsUser['id'],
    payload: Partial<CmsUser>,
  ): Promise<CmsUser | null> {
    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { _id: id.toString() };
    const cmsUser = await this.cmsUsersModel.findOne(filter);

    if (!cmsUser) {
      return null;
    }

    const cmsUserObject = await this.cmsUsersModel.findOneAndUpdate(
      filter,
      CmsUserMapper.toDocument({
        ...CmsUserMapper.toDomain(cmsUser),
        ...clonedPayload,
      }),
      { new: true },
    );

    return cmsUserObject ? CmsUserMapper.toDomain(cmsUserObject) : null;
  }

  async remove(id: CmsUser['id']): Promise<void> {
    await this.cmsUsersModel
      .findByIdAndUpdate(id, { deletedAt: new Date() })
      .exec();
  }
}
