import { Injectable } from '@nestjs/common';

import { NullableType } from '../../utils/types/nullable.type';
import { FilterUserDto, SortUserDto } from '../dto/query-user.dto';
import { User } from '../domain/user';
import { UserRepository } from '../domain/user.repository';
import { UserSchemaClass } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery } from 'mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import { UserMapper } from './user.mapper';
import { IPaginationOptions } from '../../utils/types/pagination-options';

@Injectable()
export class UsersDocumentRepository implements UserRepository {
  constructor(
    @InjectModel(UserSchemaClass.name)
    private readonly usersModel: PaginateModel<UserSchemaClass>,
  ) {}

  async create(data: User): Promise<User> {
    const userDocument = UserMapper.toDocument(data);
    const createdUser = new this.usersModel(userDocument);
    const userObject = await createdUser.save();
    return UserMapper.toDomain(userObject);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<User>> {
    const where: FilterQuery<UserSchemaClass> = {};

    if (filterOptions?.createdAtFrom || filterOptions?.createdAtTo) {
      where['createdAt'] = {};
      if (filterOptions.createdAtFrom) {
        where['createdAt'].$gte = filterOptions.createdAtFrom;
      }
      if (filterOptions.createdAtTo) {
        where['createdAt'].$lte = filterOptions.createdAtTo;
      }
    }

    const sort = sortOptions?.reduce(
      (accumulator, sortOption) => ({
        ...accumulator,
        [sortOption.orderBy === 'id' ? '_id' : sortOption.orderBy]:
          sortOption.order.toUpperCase() === 'ASC' ? 1 : -1,
      }),
      {},
    ) || { createdAt: -1 };

    const result = await this.usersModel.paginate(where, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => UserMapper.toDomain(doc)),
    };
  }

  async findById(id: User['id']): Promise<NullableType<User>> {
    const userObject = await this.usersModel.findById(id);
    return userObject ? UserMapper.toDomain(userObject) : null;
  }

  async findByIds(ids: User['id'][]): Promise<User[]> {
    const userObjects = await this.usersModel.find({ _id: { $in: ids } });
    return userObjects.map((userObject) => UserMapper.toDomain(userObject));
  }

  async findByEmail(email: User['email']): Promise<NullableType<User>> {
    if (!email) return null;

    const userObject = await this.usersModel.findOne({ email });
    return userObject ? UserMapper.toDomain(userObject) : null;
  }

  async findByPhone(phone: User['phone']): Promise<NullableType<User>> {
    if (!phone) return null;

    const userObject = await this.usersModel.findOne({ phone });
    return userObject ? UserMapper.toDomain(userObject) : null;
  }

  async findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId'];
    provider: User['provider'];
  }): Promise<NullableType<User>> {
    if (!socialId || !provider) return null;

    const userObject = await this.usersModel.findOne({
      $or: [
        { socialId, provider },
        {
          'socialAccounts.socialId': socialId,
          'socialAccounts.provider': provider,
        },
      ],
    });

    return userObject ? UserMapper.toDomain(userObject) : null;
  }

  async findBySocialAccountExcludingUser({
    socialId,
    provider,
    excludeUserId,
  }: {
    socialId: string;
    provider: string;
    excludeUserId: User['id'];
  }): Promise<NullableType<User>> {
    const userObject = await this.usersModel.findOne({
      _id: { $ne: excludeUserId },
      $or: [
        { socialId, provider },
        {
          'socialAccounts.socialId': socialId,
          'socialAccounts.provider': provider,
        },
      ],
    });

    return userObject ? UserMapper.toDomain(userObject) : null;
  }

  async update(id: User['id'], payload: Partial<User>): Promise<User | null> {
    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { _id: id.toString() };
    const user = await this.usersModel.findOne(filter);

    if (!user) {
      return null;
    }

    const userObject = await this.usersModel.findOneAndUpdate(
      filter,
      UserMapper.toDocument({
        ...UserMapper.toDomain(user),
        ...clonedPayload,
      }),
      { new: true },
    );

    return userObject ? UserMapper.toDomain(userObject) : null;
  }

  async remove(id: User['id']): Promise<void> {
    await this.usersModel.deleteOne({
      _id: id.toString(),
    });
  }
}
