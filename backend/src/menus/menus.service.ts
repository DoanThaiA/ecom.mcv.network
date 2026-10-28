import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { MenuRepository } from './domain/menu.repository';
import { Menu } from './domain/menu';
import { MenuStatus } from './domain/menu-status.enum';
import { MenuType } from './domain/menu-type.enum';
import { ProductCategoryRepository } from '../product-categories/domain/product-category.repository';
import { TopicRepository } from '../topics/domain/topic.repository';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { MenuResponseDto } from './dto/menu-response.dto';
import { ReorderMenusDto } from './dto/reorder-menus.dto';
import { ShopMenuItemDto, ShopMenuListResponseDto } from './dto/shop-menu.dto';
import { throwException } from '../utils/errors/throw-exception';
import { generateSlug } from '../utils/slugify';

/**
 * Service for managing menus
 */
@Injectable()
export class MenusService {
  private readonly logger = new Logger(MenusService.name);

  constructor(
    private readonly menuRepository: MenuRepository,
    private readonly categoryRepository: ProductCategoryRepository,
    private readonly topicRepository: TopicRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Build URL for a menu based on its type and linked entity
   * Called during create/update to store the resolved URL
   */
  private async buildUrl(
    type: MenuType,
    categoryId?: string | null,
    topicId?: string | null,
    customUrl?: string | null,
  ): Promise<string> {
    switch (type) {
      case MenuType.CATEGORY:
        if (categoryId) {
          const category = await this.categoryRepository.findById(categoryId);
          if (category) {
            const slug = category.slug || generateSlug(category.name);
            return `/category/${slug}-${category.id}`;
          }
        }
        return '#';

      case MenuType.TOPIC:
        if (topicId) {
          const topic = await this.topicRepository.findById(topicId);
          if (topic) {
            return `/topic/${topic.slug}-${topic.id}`;
          }
        }
        return '#';

      case MenuType.URL:
      default:
        return customUrl || '#';
    }
  }

  /**
   * Validate menu type constraints
   */
  private async validateTypeConstraints(
    dto: CreateMenuDto | UpdateMenuDto,
    existingMenu?: Menu,
  ): Promise<void> {
    const type = dto.type ?? existingMenu?.type;

    if (type === MenuType.CATEGORY) {
      const categoryId = dto.categoryId ?? existingMenu?.categoryId;
      if (!categoryId) {
        throwException({
          status: HttpStatus.BAD_REQUEST,
          message: this.i18n.t('menu.categoryIdRequired'),
        });
      }
      // Validate category exists
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        throwException({
          status: HttpStatus.BAD_REQUEST,
          message: this.i18n.t('menu.categoryNotFound'),
        });
      }
    }

    if (type === MenuType.TOPIC) {
      const topicId = dto.topicId ?? existingMenu?.topicId;
      if (!topicId) {
        throwException({
          status: HttpStatus.BAD_REQUEST,
          message: this.i18n.t('menu.topicIdRequired'),
        });
      }
      // Validate topic exists
      const topic = await this.topicRepository.findById(topicId);
      if (!topic) {
        throwException({
          status: HttpStatus.BAD_REQUEST,
          message: this.i18n.t('menu.topicNotFound'),
        });
      }
    }

    if (type === MenuType.URL) {
      const url = dto.url ?? existingMenu?.url;
      if (!url) {
        throwException({
          status: HttpStatus.BAD_REQUEST,
          message: this.i18n.t('menu.urlRequired'),
        });
      }
    }
  }

  /**
   * Create a new menu
   */
  async create(dto: CreateMenuDto): Promise<MenuResponseDto> {
    this.logger.debug(`Creating menu: ${dto.name}`);

    await this.validateTypeConstraints(dto);

    // Validate parent exists if provided
    if (dto.parentId) {
      const parent = await this.menuRepository.findById(dto.parentId);
      if (!parent) {
        throwException({
          status: HttpStatus.BAD_REQUEST,
          message: this.i18n.t('menu.parentNotFound'),
        });
      }
    }

    // Build URL based on menu type
    const url = await this.buildUrl(
      dto.type,
      dto.categoryId,
      dto.topicId,
      dto.url,
    );

    const menu = await this.menuRepository.create({
      name: dto.name,
      localization: dto.localization
        ? { vi: dto.localization.vi, en: dto.localization.en }
        : null,
      parentId: dto.parentId ?? null,
      type: dto.type,
      categoryId: dto.categoryId ?? null,
      topicId: dto.topicId ?? null,
      url,
      order: dto.order ?? 0,
      status: dto.status ?? MenuStatus.ACTIVE,
      deletedAt: null,
    });

    return this.toResponseDto(menu);
  }

  /**
   * Find all menus with filtering and sorting
   */
  async findAll(query: QueryMenuDto): Promise<MenuResponseDto[]> {
    const menus = await this.menuRepository.findMany({
      filterOptions: query.filters,
      sortOptions: query.sort,
    });

    return menus.map((menu) => this.toResponseDto(menu));
  }

  /**
   * Find menu by ID
   */
  async findOne(id: string): Promise<MenuResponseDto> {
    const menu = await this.menuRepository.findById(id);

    if (!menu) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('menu.notFound'),
      });
    }

    return this.toResponseDto(menu);
  }

  /**
   * Update an existing menu
   */
  async update(id: string, dto: UpdateMenuDto): Promise<MenuResponseDto> {
    this.logger.debug(`Updating menu ${id}`);

    const existingMenu = await this.menuRepository.findById(id);
    if (!existingMenu) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('menu.notFound'),
      });
    }

    // Validate type constraints if type is changing or relevant fields are updated
    if (
      dto.type ||
      dto.categoryId !== undefined ||
      dto.topicId !== undefined ||
      dto.url !== undefined
    ) {
      await this.validateTypeConstraints(dto, existingMenu);
    }

    // Validate parent if changing
    if (dto.parentId !== undefined && dto.parentId !== null) {
      // Prevent circular reference
      if (dto.parentId === id) {
        throwException({
          status: HttpStatus.BAD_REQUEST,
          message: this.i18n.t('menu.circularReference'),
        });
      }
      const parent = await this.menuRepository.findById(dto.parentId);
      if (!parent) {
        throwException({
          status: HttpStatus.BAD_REQUEST,
          message: this.i18n.t('menu.parentNotFound'),
        });
      }
    }

    // Rebuild URL if type or linked entity changed
    let url: string | undefined;
    if (
      dto.type !== undefined ||
      dto.categoryId !== undefined ||
      dto.topicId !== undefined ||
      dto.url !== undefined
    ) {
      url = await this.buildUrl(
        dto.type ?? existingMenu.type,
        dto.categoryId !== undefined ? dto.categoryId : existingMenu.categoryId,
        dto.topicId !== undefined ? dto.topicId : existingMenu.topicId,
        dto.url !== undefined ? dto.url : existingMenu.url,
      );
    }

    const updatedMenu = await this.menuRepository.update(id, {
      ...dto,
      ...(url !== undefined && { url }),
    });

    if (!updatedMenu) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('menu.notFound'),
      });
    }

    return this.toResponseDto(updatedMenu);
  }

  /**
   * Soft delete a menu
   */
  async remove(id: string): Promise<void> {
    const menu = await this.menuRepository.findById(id);

    if (!menu) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('menu.notFound'),
      });
    }

    await this.menuRepository.remove(id);
    this.logger.debug(`Deleted menu ${id}`);
  }

  /**
   * Bulk reorder menus
   */
  async reorderMenus(dto: ReorderMenusDto): Promise<void> {
    this.logger.debug(`Reordering ${dto.menus.length} menus`);
    await this.menuRepository.bulkUpdateOrder(dto.menus);
  }

  /**
   * Get active menus for public API (flat list)
   * URLs are pre-computed at create/update time - no additional queries needed
   */
  async getActiveMenus(): Promise<ShopMenuListResponseDto> {
    const menus = await this.menuRepository.findAllActive();

    const shopMenus: ShopMenuItemDto[] = menus.map((menu) => ({
      id: menu.id,
      name: menu.name,
      localization: menu.localization
        ? { vi: menu.localization.vi, en: menu.localization.en }
        : null,
      parentId: menu.parentId ?? null,
      type: menu.type,
      categoryId: menu.categoryId ?? null,
      topicId: menu.topicId ?? null,
      url: menu.url || '#',
      order: menu.order,
    }));

    return { menus: shopMenus };
  }

  /**
   * Convert Menu to MenuResponseDto
   */
  private toResponseDto(menu: Menu): MenuResponseDto {
    return {
      id: menu.id,
      name: menu.name,
      localization: menu.localization
        ? { vi: menu.localization.vi, en: menu.localization.en }
        : null,
      parentId: menu.parentId,
      type: menu.type,
      categoryId: menu.categoryId,
      topicId: menu.topicId,
      url: menu.url,
      order: menu.order,
      status: menu.status,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
    };
  }
}
