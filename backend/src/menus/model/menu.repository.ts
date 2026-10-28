import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';
import {
  MenuRepository,
  FilterMenuDto,
  SortMenuDto,
} from '../domain/menu.repository';
import { Menu } from '../domain/menu';
import { MenuSchemaClass } from './menu.schema';
import { MenuMapper } from './menu.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { MenuStatus } from '../domain/menu-status.enum';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { escapeRegex } from '../../utils/search';

/**
 * Mongoose implementation of MenuRepository
 */
@Injectable()
export class MenuDocumentRepository implements MenuRepository {
  constructor(
    @InjectModel(MenuSchemaClass.name)
    private readonly menuModel: PaginateModel<MenuSchemaClass>,
  ) {}

  /**
   * Create a new menu
   */
  async create(
    data: Omit<Menu, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Menu> {
    const now = new Date();
    const persistenceModel = MenuMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as unknown as Menu);

    const createdMenu = new this.menuModel(persistenceModel);
    const menuDocument = await createdMenu.save();
    const leanMenu = menuDocument.toObject();
    return MenuMapper.toDomain(leanMenu);
  }

  /**
   * Find menus with filtering and pagination
   */
  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterMenuDto | null;
    sortOptions?: SortMenuDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Menu>> {
    const filter: FilterQuery<MenuSchemaClass> = { deletedAt: null };

    if (filterOptions) {
      // Filter by status
      if (filterOptions.status !== undefined) {
        filter.status = filterOptions.status;
      }

      // Search by name
      if (filterOptions.search) {
        filter.name = { $regex: escapeRegex(filterOptions.search), $options: 'i' };
      }

      // Filter by parentId
      if (filterOptions.parentId !== undefined) {
        filter.parentId = filterOptions.parentId
          ? new mongoose.Types.ObjectId(filterOptions.parentId)
          : null;
      }
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    if (sortOptions && sortOptions.length > 0) {
      sortOptions.forEach((sortOption) => {
        sort[sortOption.orderBy] = sortOption.order === 'asc' ? 1 : -1;
      });
    } else {
      // Default sort by order ascending
      sort.order = 1;
    }

    const result = await this.menuModel.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => MenuMapper.toDomain(doc)),
    };
  }

  /**
   * Find menu by ID
   */
  async findById(id: Menu['id']): Promise<NullableType<Menu>> {
    const menuDocument = await this.menuModel
      .findOne({ _id: id, deletedAt: null })
      .lean();

    return menuDocument ? MenuMapper.toDomain(menuDocument) : null;
  }

  /**
   * Find all active menus (for public API)
   */
  async findAllActive(): Promise<Menu[]> {
    const menuDocuments = await this.menuModel
      .find({
        status: MenuStatus.ACTIVE,
        deletedAt: null,
      })
      .sort({ order: 1 })
      .lean();

    return menuDocuments.map((doc) => MenuMapper.toDomain(doc));
  }

  /**
   * Find all menus (for tree building)
   */
  async findAll(): Promise<Menu[]> {
    const menuDocuments = await this.menuModel
      .find({ deletedAt: null })
      .sort({ order: 1 })
      .lean();

    return menuDocuments.map((doc) => MenuMapper.toDomain(doc));
  }

  /**
   * Find all menus with filtering and sorting (no pagination)
   */
  async findMany({
    filterOptions,
    sortOptions,
  }: {
    filterOptions?: FilterMenuDto | null;
    sortOptions?: SortMenuDto[] | null;
  }): Promise<Menu[]> {
    const filter: FilterQuery<MenuSchemaClass> = { deletedAt: null };

    if (filterOptions) {
      if (filterOptions.status !== undefined) {
        filter.status = filterOptions.status;
      }
      if (filterOptions.search) {
        filter.name = { $regex: escapeRegex(filterOptions.search), $options: 'i' };
      }
      if (filterOptions.parentId !== undefined) {
        filter.parentId = filterOptions.parentId
          ? new mongoose.Types.ObjectId(filterOptions.parentId)
          : null;
      }
    }

    const sort: Record<string, 1 | -1> = {};
    if (sortOptions && sortOptions.length > 0) {
      sortOptions.forEach((sortOption) => {
        sort[sortOption.orderBy] = sortOption.order === 'asc' ? 1 : -1;
      });
    } else {
      sort.order = 1;
    }

    const menuDocuments = await this.menuModel.find(filter).sort(sort).lean();

    return menuDocuments.map((doc) => MenuMapper.toDomain(doc));
  }

  /**
   * Find child menus by parent ID
   */
  async findByParentId(parentId: string | null): Promise<Menu[]> {
    const filter: FilterQuery<MenuSchemaClass> = { deletedAt: null };
    filter.parentId = parentId ? new mongoose.Types.ObjectId(parentId) : null;

    const menuDocuments = await this.menuModel
      .find(filter)
      .sort({ order: 1 })
      .lean();

    return menuDocuments.map((doc) => MenuMapper.toDomain(doc));
  }

  /**
   * Update existing menu
   */
  async update(
    id: Menu['id'],
    payload: DeepPartial<Menu>,
  ): Promise<NullableType<Menu>> {
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    // Copy allowed fields
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.localization !== undefined) {
      updateData.localization = payload.localization
        ? { vi: payload.localization.vi, en: payload.localization.en }
        : null;
    }
    if (payload.parentId !== undefined) {
      updateData.parentId = payload.parentId
        ? new mongoose.Types.ObjectId(payload.parentId)
        : null;
    }
    if (payload.type !== undefined) updateData.type = payload.type;
    if (payload.categoryId !== undefined) {
      updateData.categoryId = payload.categoryId
        ? new mongoose.Types.ObjectId(payload.categoryId)
        : null;
    }
    if (payload.topicId !== undefined) {
      updateData.topicId = payload.topicId
        ? new mongoose.Types.ObjectId(payload.topicId)
        : null;
    }
    if (payload.url !== undefined) updateData.url = payload.url;
    if (payload.order !== undefined) updateData.order = payload.order;
    if (payload.status !== undefined) updateData.status = payload.status;

    const updatedMenu = await this.menuModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { $set: updateData },
        { new: true },
      )
      .lean();

    return updatedMenu ? MenuMapper.toDomain(updatedMenu) : null;
  }

  /**
   * Bulk update menu orders
   */
  async bulkUpdateOrder(
    updates: Array<{ id: string; order: number }>,
  ): Promise<void> {
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: {
          _id: new mongoose.Types.ObjectId(update.id),
          deletedAt: null,
        },
        update: { $set: { order: update.order, updatedAt: new Date() } },
      },
    }));

    await this.menuModel.bulkWrite(bulkOps);
  }

  /**
   * Soft delete menu
   */
  async remove(id: Menu['id']): Promise<void> {
    await this.menuModel
      .findByIdAndUpdate(id, { deletedAt: new Date() })
      .exec();
  }
}
