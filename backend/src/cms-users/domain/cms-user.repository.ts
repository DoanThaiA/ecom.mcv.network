import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { CmsUser } from './cms-user';
import { PaginateResult } from 'mongoose';

import { FilterCmsUserDto, SortCmsUserDto } from '../dto/query-cms-user.dto';

export abstract class CmsUserRepository {
  abstract create(
    data: Omit<CmsUser, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<CmsUser>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterCmsUserDto | null;
    sortOptions?: SortCmsUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<CmsUser>>;

  abstract findById(id: CmsUser['id']): Promise<NullableType<CmsUser>>;
  abstract findByIds(ids: CmsUser['id'][]): Promise<CmsUser[]>;
  abstract findByEmail(email: CmsUser['email']): Promise<NullableType<CmsUser>>;
  abstract findByEmailAll(
    email: CmsUser['email'],
  ): Promise<NullableType<CmsUser>>;
  abstract freeEmail(id: CmsUser['id']): Promise<void>;
  abstract findByAffiliateId(
    affiliateId: string,
  ): Promise<NullableType<CmsUser>>;

  abstract update(
    id: CmsUser['id'],
    payload: DeepPartial<CmsUser>,
  ): Promise<CmsUser | null>;

  abstract remove(id: CmsUser['id']): Promise<void>;
}
