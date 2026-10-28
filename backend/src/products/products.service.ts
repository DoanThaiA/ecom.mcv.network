import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaginateResult } from 'mongoose';
import * as XLSX from 'xlsx';
import { ProductRepository } from './domain/product.repository';
import { Product } from './domain/product';
import { ProductBadge } from './domain/product-badge.enum';
import type { ProductDescriptionMedia } from './domain/product-description-media';
import { ProductStatus } from './domain/product-status.enum';
import { QueryProductDto } from './dto/query-product.dto';
import { throwException } from '../utils/errors/throw-exception';
import { sanitizeRichText } from '../utils/sanitize';
import { NhanhAuthService } from '../nhanh/services/nhanh-auth.service';

/**
 * Service for managing products (our business domain)
 * Regular products are synced from external sources (Nhanh)
 */
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly i18n: I18nService,
    private readonly nhanhAuthService: NhanhAuthService,
  ) {}

  /**
   * Find products with filtering and pagination
   * @param query - Query parameters including filters, pagination, and variant options
   * @returns Paginated result with products (optionally with variants)
   */
  async findAll(query: QueryProductDto): Promise<PaginateResult<Product>> {
    this.logger.debug(`Finding products with query: ${JSON.stringify(query)}`);

    // Get businessId from cached token if not provided in filters
    let businessId = query.filters?.businessId;
    if (!businessId) {
      const tokenData = await this.nhanhAuthService.getAccessToken();
      businessId = tokenData?.businessId.toString();
    }

    // Add businessId to filter options
    const filterOptions = {
      ...query.filters,
      ...(businessId && { businessId }),
    };

    const result = await this.productRepository.findManyWithPagination({
      filterOptions,
      sortOptions: query.sort,
      paginationOptions: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
      },
    });

    // Products already have embedded variants and variantOptions from sync
    return result;
  }

  /**
   * Find a product by ID
   */
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product.notFound'),
      });
    }

    return product;
  }

  /**
   * Find a product by code
   */
  async findByCode(code: string): Promise<Product> {
    const product = await this.productRepository.findByCode(code);

    if (!product) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product.notFound'),
      });
    }

    return product;
  }

  /**
   * Get product statistics
   */
  getStatistics(): {
    total: number;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
  } {
    // TODO: Implement aggregation queries
    this.logger.debug('Getting product statistics');

    return {
      total: 0,
      byStatus: {},
      bySource: {},
    };
  }

  /**
   * Find a product by ID with variants
   * Variants and variantOptions are embedded during sync
   * @param id - Product ID
   */
  async findOneWithVariants(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product.notFound'),
      });
    }

    // Variants and variantOptions are already embedded from sync
    return product;
  }

  /**
   * Update product details (CMS-only data)
   * @param id - Product ID
   * @param data - Product data to update (description, content, details, badge, sizeGuide, and their localizations)
   * @returns Updated product
   */
  async updateDetails(
    id: string,
    data: {
      nameLocalization?: { vi?: string; en?: string };
      description?: string;
      descriptionLocalization?: { vi?: string; en?: string };
      content?: string;
      details?: {
        material?: string;
        style?: string;
        highlights?: string;
        suitableFor?: string;
        careInstructions?: string;
      };
      detailsLocalization?: {
        material?: { vi?: string; en?: string };
        style?: { vi?: string; en?: string };
        highlights?: { vi?: string; en?: string };
        suitableFor?: { vi?: string; en?: string };
        careInstructions?: { vi?: string; en?: string };
      };
      badge?: ProductBadge | null;
      sizeGuide?: string | null;
      descriptionMedia?: Partial<ProductDescriptionMedia>;
    },
  ): Promise<Product> {
    this.logger.debug(`Updating details for product ${id}`);

    // Verify product exists
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product.notFound'),
      });
    }

    // Sanitize HTML content to prevent XSS
    if (data.description) {
      data.description = sanitizeRichText(data.description);
    }
    if (data.content) {
      data.content = sanitizeRichText(data.content);
    }
    if (data.descriptionLocalization) {
      if (data.descriptionLocalization.vi) {
        data.descriptionLocalization.vi = sanitizeRichText(
          data.descriptionLocalization.vi,
        );
      }
      if (data.descriptionLocalization.en) {
        data.descriptionLocalization.en = sanitizeRichText(
          data.descriptionLocalization.en,
        );
      }
    }

    const updatedProduct = await this.productRepository.updateDetails(id, data);

    if (!updatedProduct) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product.notFound'),
      });
    }

    return updatedProduct;
  }

  /**
   * Export all variant products to an Excel buffer (61-column format)
   * Uses cursor streaming to avoid loading all documents into memory
   */
  async exportToExcel(filters: {
    search?: string;
    status?: ProductStatus;
    categoryIds?: string[];
  }): Promise<Buffer> {
    const businessId = await this.nhanhAuthService
      .getAccessToken()
      .then((t) => t?.businessId?.toString());

    const HEADERS = [
      'ID sản phẩm',
      'Id sản phẩm cha',
      'Mã sản phẩm cha',
      'Tên sản phẩm cha',
      'Mã vạch',
      'Loại sản phẩm',
      'Mã sản phẩm',
      'Tên sản phẩm',
      'Tên khác',
      'Đơn vị tính',
      'Link ảnh sản phẩm',
      'Số tháng bảo hành',
      'Cân nặng cả vỏ hộp',
      'Giá nhập',
      'VAT nhập',
      'Giá nhập + VAT',
      'Vat Mode giá nhập',
      'Giá bán',
      'Giá bán + VAT',
      'Giá bán chi nhánh',
      'Giá bán chi nhánh có VAT',
      'Vat mode giá bán',
      'Giá cũ',
      'VAT',
      '% Lợi nhuận',
      'Giá vốn',
      'Giá sỉ',
      'Giá sỉ + VAT',
      'Giá sỉ chi nhánh',
      'Giá sỉ chi nhánh có VAT',
      'Tổng tồn',
      'Đang chuyển kho',
      'Tồn',
      'Đang Giao hàng',
      'Tồn trong kho',
      'Lỗi',
      'Tạm giữ',
      'Có thể bán',
      'Bảo hành',
      'Tạm giữ linh kiện',
      'Chờ nhập hàng',
      'Đặt trước',
      'Trạng thái',
      'Mã danh mục',
      'Danh mục',
      'Mã danh mục nội bộ',
      'Thương hiệu',
      'Nhà cung cấp',
      'Địa chỉ bảo hành',
      'Link trên website',
      'Chiều dài',
      'Chiều rộng',
      'Chiều cao',
      'Thứ tự trên Website',
      'Ngày tạo',
      'Nhãn sản phẩm',
      'Giá bán chi nhánh',
      'Giá sỉ chi nhánh',
      'Màu sắc & hoạ tiết',
      'Kích Thước',
      'Xuất xứ',
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([HEADERS]);
    ws['!cols'] = HEADERS.map((h) => ({ wch: Math.max(h.length + 4, 12) }));
    XLSX.utils.book_append_sheet(wb, ws, 'Sản phẩm');

    let rowIndex = 1;
    for await (const batch of this.productRepository.streamVariantsForExport({
      ...filters,
      businessId,
    })) {
      const rows = batch.map((v) => mapVariantToRow(v));
      XLSX.utils.sheet_add_aoa(ws, rows, { origin: rowIndex });
      rowIndex += rows.length;
    }

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  /**
   * Bulk update hide status for multiple products
   * @param items - Array of product IDs and their hide status
   * @returns Number of products updated
   */
  async bulkUpdateHide(
    items: Array<{ productId: string; hide: boolean }>,
  ): Promise<number> {
    this.logger.debug(`Bulk updating hide for ${items.length} products`);

    const updatedCount = await this.productRepository.bulkUpdateHide(items);

    this.logger.log(`Updated hide status for ${updatedCount} products`);
    return updatedCount;
  }
}

// ─── Excel export helpers ──────────────────────────────────────────────────

const STATUS_LABEL: Record<number, string> = {
  1: 'Mới',
  2: 'Đang bán',
  3: 'Ngừng bán',
  4: 'Hết hàng',
  5: 'Tạm ngưng',
};

function formatExcelDate(value: any): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function priceWithVat(
  price: number | undefined,
  vat: number | undefined,
): number | '' {
  if (!price) return '';
  if (!vat) return price;
  return Math.round(price * (1 + vat / 100));
}

function getProductUrl(variant: Record<string, any>): string {
  const parent = variant.parent;
  const id = parent?.id ? String(parent.id) : String(variant._id);
  const slug = parent?.slug ?? variant.slug;
  if (slug) return `https://cchat.vn/products/${slug}-${id}`;
  return `https://cchat.vn/products/${id}`;
}

function getAttributeValue(
  attributes: Array<{ name: string; value: string }> | undefined,
  pattern: RegExp,
): string {
  if (!attributes?.length) return '';
  return attributes.find((a) => pattern.test(a.name))?.value ?? '';
}

function mapVariantToRow(v: Record<string, any>): unknown[] {
  const p = v.parent ?? {};
  const inv = v.inventory ?? {};
  const prices = v.prices ?? {};
  const vat: number | undefined = v.vat ?? undefined;

  return [
    /* A  */ v.snapshot?.id ? String(v.snapshot.id) : '',
    /* B  */ v.snapshot?.parentId ? String(v.snapshot.parentId) : '',
    /* C  */ p.code ?? '',
    /* D  */ p.name ?? '',
    /* E  */ v.barcode ?? '',
    /* F  */ 'Sản phẩm',
    /* G  */ v.code ?? '',
    /* H  */ v.name ?? '',
    /* I  */ '',
    /* J  */ '',
    /* K  */ v.images?.avatar ?? '',
    /* L  */ '',
    /* M  */ '',
    /* N  */ prices.import || '',
    /* O  */ vat ?? '',
    /* P  */ priceWithVat(prices.import, vat),
    /* Q  */ '',
    /* R  */ prices.retail || '',
    /* S  */ priceWithVat(prices.retail, vat),
    /* T  */ '',
    /* U  */ '',
    /* V  */ '',
    /* W  */ prices.old || '',
    /* X  */ vat ?? '',
    /* Y  */ '',
    /* Z  */ prices.avgCost || '',
    /* AA */ prices.wholesale || '',
    /* AB */ priceWithVat(prices.wholesale, vat),
    /* AC */ '',
    /* AD */ '',
    /* AE */ inv.remain ?? '',
    /* AF */ '',
    /* AG */ inv.remain ?? '',
    /* AH */ inv.shipping ?? '',
    /* AI */ inv.remain ?? '',
    /* AJ */ inv.damaged ?? '',
    /* AK */ inv.holding ?? '',
    /* AL */ inv.available ?? '',
    /* AM */ inv.warranty ?? '',
    /* AN */ inv.warrantyHolding ?? '',
    /* AO */ inv.holdingNew ?? '',
    /* AP */ inv.shippingExport ?? '',
    /* AQ */ STATUS_LABEL[v.status] ?? '',
    /* AR */ v.category?.id ? String(v.category.id) : '',
    /* AS */ v.category?.name ?? '',
    /* AT */ '',
    /* AU */ 'CCHAT',
    /* AV */ '',
    /* AW */ '',
    /* AX */ getProductUrl(v),
    /* AY */ '',
    /* AZ */ '',
    /* BA */ '',
    /* BB */ '',
    /* BC */ formatExcelDate(v.createdAt),
    /* BD */ '',
    /* BE */ '',
    /* BF */ '',
    /* BG */ getAttributeValue(v.attributes, /màu/i),
    /* BH */ getAttributeValue(v.attributes, /kích |size/i),
    /* BI */ '',
  ];
}
