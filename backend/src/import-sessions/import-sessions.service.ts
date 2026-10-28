import { Injectable, HttpStatus, Logger, Optional } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { ImportSessionRepository } from './domain/import-session.repository';
import { ImportSessionRowRepository } from './domain/import-session-row.repository';
import { ImportSessionStatus } from './domain/import-session-status.enum';
import { ProductRepository } from '../products/domain/product.repository';
import { FlashSaleRepository } from '../flash-sales/domain/flash-sale.repository';
import { FlashSaleProductRepository } from '../flash-sale-products/domain/flash-sale-product.repository';
import { PromotionRepository } from '../promotions/domain/promotion.repository';
import { PromotionProductRepository } from '../promotion-products/domain/promotion-product.repository';
import { TopicRepository } from '../topics/domain/topic.repository';
import { TopicType } from '../topics/domain/topic-type.enum';
import {
  TopicExcelRow,
  TopicImportValidationErrorCode,
} from '../topics/dto/validate-excel-products.dto';
import { AffiliateRepository } from '../affiliates/domain/affiliate.repository';
import {
  AffiliateProductCommissionExcelRow,
  AffiliateProductCommissionValidationErrorCode,
} from '../product-commissions/dto/validate-excel-products.dto';
import { PromotionType } from '../promotions/domain/promotion-type.enum';
import { DiscountType } from '../combos/domain/discount-type.enum';
import {
  ExcelProductRow,
  ValidationErrorCode,
} from '../flash-sales/dto/validate-excel-products.dto';
import {
  ProductDiscountExcelRow,
  ProductDiscountValidationErrorCode,
} from '../promotions/dto/validate-excel-products.dto';
import {
  CreateImportSessionDto,
  CreateProductDiscountImportSessionDto,
} from './dto/create-import-session.dto';
import { UpdateImportSessionRowDto } from './dto/update-import-session-row.dto';
import {
  ImportSessionResponseDto,
  ImportSessionRowResponseDto,
  ConfirmImportSessionResponseDto,
} from './dto/import-session-response.dto';
import { QueryImportSessionRowsDto } from './dto/query-import-session-rows.dto';
import { JobsService } from '../jobs/jobs.service';
import { JobType } from '../jobs/domain/job-type.enum';
import { throwException } from '../utils/errors/throw-exception';
import { calculateRoundedDiscountAmount } from '../utils/helpers/round-price';
import { PaginateResult } from 'mongoose';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Service for managing import sessions (flash sale and product discount)
 */
@Injectable()
export class ImportSessionsService {
  private readonly logger = new Logger(ImportSessionsService.name);

  constructor(
    private readonly importSessionRepository: ImportSessionRepository,
    private readonly importSessionRowRepository: ImportSessionRowRepository,
    private readonly productRepository: ProductRepository,
    private readonly flashSaleRepository: FlashSaleRepository,
    private readonly flashSaleProductRepository: FlashSaleProductRepository,
    private readonly jobsService: JobsService,
    private readonly i18n: I18nService,
    @Optional() private readonly promotionRepository?: PromotionRepository,
    @Optional()
    private readonly promotionProductRepository?: PromotionProductRepository,
    @Optional() private readonly topicRepository?: TopicRepository,
    @Optional() private readonly affiliateRepository?: AffiliateRepository,
  ) {}

  /**
   * Create an import session by uploading and validating an Excel file
   */
  async createSession(
    file: Express.Multer.File,
    flashSaleId: string,
    dto: CreateImportSessionDto,
    createdBy?: string,
  ): Promise<ImportSessionResponseDto> {
    // Validate file
    if (!file) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('flash-sale.fileRequired'),
        errors: { file: 'Excel file is required' },
      });
    }

    // Parse Excel file from disk, then clean up temp file
    let parsedRows: ExcelProductRow[];
    try {
      parsedRows = this.parseExcelFile(file);
    } finally {
      this.cleanupTempFile(file);
    }
    this.logger.debug(`Parsed ${parsedRows.length} rows from Excel file`);

    if (parsedRows.length === 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('flash-sale.emptyExcelFile'),
        errors: { file: 'Excel file has no valid data rows' },
      });
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    // Validate products (reuses the same logic as FlashSalesService.validateExcelProducts)
    const validatedRows = await this.validateRows(
      parsedRows,
      startTime,
      endTime,
      flashSaleId,
    );

    // Create session
    const session = await this.importSessionRepository.create({
      type: 'flash_sale',
      flashSaleId,
      status: ImportSessionStatus.PENDING,
      totalRows: validatedRows.length,
      validCount: validatedRows.filter((r) => r.isValid).length,
      invalidCount: validatedRows.filter((r) => !r.isValid).length,
      createdBy,
    });

    // Bulk insert all rows
    const rowsToInsert = validatedRows.map((row) => ({
      sessionId: session.id,
      rowNumber: row.rowNumber,
      productId: row.productId,
      code: row.code,
      name: row.name,
      actualName: row.actualName,
      image: row.image,
      originalPrice: row.originalPrice,
      discountType: row.discountType,
      discountValue: row.discountValue,
      flashSalePrice: row.flashSalePrice,
      promotionalQuantity: row.promotionalQuantity,
      stock: row.stock,
      isValid: row.isValid,
      errors: row.errors,
    }));

    await this.importSessionRowRepository.insertMany(rowsToInsert);

    return ImportSessionResponseDto.fromDomain(session);
  }

  /**
   * Get import session summary
   */
  async getSession(sessionId: string): Promise<ImportSessionResponseDto> {
    const session = await this.importSessionRepository.findById(sessionId);
    if (!session) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('import-session.notFound'),
      });
    }
    return ImportSessionResponseDto.fromDomain(session);
  }

  /**
   * Get paginated session rows
   */
  async getSessionRows(
    sessionId: string,
    query: QueryImportSessionRowsDto,
  ): Promise<PaginateResult<ImportSessionRowResponseDto>> {
    // Verify session exists
    const session = await this.importSessionRepository.findById(sessionId);
    if (!session) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('import-session.notFound'),
      });
    }

    const page = query.page && query.page > 0 ? query.page : DEFAULT_PAGE;
    const requestedLimit =
      query.limit && query.limit > 0 ? query.limit : DEFAULT_LIMIT;
    const limit = Math.min(requestedLimit, MAX_LIMIT);

    const result =
      await this.importSessionRowRepository.findBySessionIdWithPagination({
        sessionId,
        isValid: query.isValid,
        search: query.search,
        paginationOptions: { page, limit },
      });

    return {
      ...result,
      docs: result.docs.map((row) =>
        ImportSessionRowResponseDto.fromDomain(row),
      ),
    };
  }

  /**
   * Update a session row (inline edit) with re-validation
   */
  async updateSessionRow(
    sessionId: string,
    rowId: string,
    dto: UpdateImportSessionRowDto,
  ): Promise<ImportSessionRowResponseDto> {
    // Load the row
    const row = await this.importSessionRowRepository.findById(rowId);
    if (!row || row.sessionId !== sessionId) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('import-session.rowNotFound'),
      });
    }

    // Determine final values
    const finalDiscountType = dto.discountType ?? row.discountType;
    const finalDiscountValue = dto.discountValue ?? row.discountValue;
    const finalPromotionalQuantity =
      dto.promotionalQuantity ?? row.promotionalQuantity;

    // Re-validate
    const errors: string[] = [];
    let flashSalePrice = row.flashSalePrice;
    let isValid = false;

    // If product was not found originally, it stays invalid
    if (!row.productId) {
      errors.push(ValidationErrorCode.PRODUCT_NOT_FOUND);
    } else {
      // Re-fetch product to get current price
      const product = await this.productRepository.findById(row.productId);
      if (!product) {
        errors.push(ValidationErrorCode.PRODUCT_NOT_FOUND);
      } else {
        const retail = product.prices.retail;

        // Validate discount
        if (
          finalDiscountType === DiscountType.PERCENTAGE &&
          finalDiscountValue > 100
        ) {
          errors.push(ValidationErrorCode.INVALID_DISCOUNT);
        }
        if (
          finalDiscountType === DiscountType.FIXED &&
          finalDiscountValue > retail
        ) {
          errors.push(ValidationErrorCode.INVALID_DISCOUNT);
        }

        // Recalculate price
        if (!errors.includes(ValidationErrorCode.INVALID_DISCOUNT)) {
          const discountAmount = calculateRoundedDiscountAmount(
            retail,
            finalDiscountType,
            finalDiscountValue,
          );
          flashSalePrice = retail - discountAmount;
        }

        // Check stock
        const availableStock = product.inventory?.available ?? 0;
        if (availableStock <= 0) {
          errors.push(ValidationErrorCode.NO_STOCK);
        }

        // Check image
        if (!product.images?.avatar && !product.images?.others?.length) {
          errors.push(ValidationErrorCode.NO_IMAGE);
        }
      }
    }

    // Preserve existing non-editable errors (like DUPLICATE_IN_EXCEL, CONFLICT_FLASH_SALE)
    const preservedErrors = row.errors.filter(
      (e) =>
        e === ValidationErrorCode.DUPLICATE_IN_EXCEL ||
        e === ValidationErrorCode.CONFLICT_FLASH_SALE,
    );
    const allErrors = [...new Set([...errors, ...preservedErrors])];
    isValid = allErrors.length === 0;

    const wasValid = row.isValid;

    // Update the row
    const updatedRow = await this.importSessionRowRepository.updateOne(rowId, {
      discountType: finalDiscountType,
      discountValue: finalDiscountValue,
      promotionalQuantity: finalPromotionalQuantity,
      flashSalePrice,
      isValid,
      errors: allErrors,
    });

    // Update session counts if validity changed
    if (wasValid !== isValid) {
      const session = await this.importSessionRepository.findById(sessionId);
      if (session) {
        const validDelta = isValid ? 1 : -1;
        await this.importSessionRepository.updateStatus(
          sessionId,
          session.status,
          {
            validCount: session.validCount + validDelta,
            invalidCount: session.invalidCount - validDelta,
          },
        );
      }
    }

    return ImportSessionRowResponseDto.fromDomain(updatedRow!);
  }

  /**
   * Delete a session row
   */
  async deleteSessionRow(
    sessionId: string,
    rowId: string,
  ): Promise<ImportSessionResponseDto> {
    // Load the row to check validity
    const row = await this.importSessionRowRepository.findById(rowId);
    if (!row || row.sessionId !== sessionId) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('import-session.rowNotFound'),
      });
    }

    await this.importSessionRowRepository.deleteOne(rowId);

    // Update session counts
    const session = await this.importSessionRepository.findById(sessionId);
    if (session) {
      await this.importSessionRepository.updateStatus(
        sessionId,
        session.status,
        {
          totalRows: session.totalRows - 1,
          validCount: row.isValid ? session.validCount - 1 : session.validCount,
          invalidCount: row.isValid
            ? session.invalidCount
            : session.invalidCount - 1,
        },
      );
    }

    // Return updated session
    const updatedSession =
      await this.importSessionRepository.findById(sessionId);
    return ImportSessionResponseDto.fromDomain(updatedSession!);
  }

  /**
   * Confirm import session - creates a background job for processing
   */
  async confirmSession(
    sessionId: string,
    triggeredBy?: string,
  ): Promise<ConfirmImportSessionResponseDto> {
    const session = await this.importSessionRepository.findById(sessionId);
    if (!session) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('import-session.notFound'),
      });
    }

    if (session.status !== ImportSessionStatus.PENDING) {
      throwException({
        status: HttpStatus.CONFLICT,
        message: this.i18n.t('import-session.alreadyProcessed'),
      });
    }

    if (session.validCount === 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('import-session.noValidProducts'),
      });
    }

    // Update session status
    await this.importSessionRepository.updateStatus(
      sessionId,
      ImportSessionStatus.PROCESSING,
    );

    // Create a background job
    const jobResult = await this.jobsService.startJob(
      JobType.FLASH_SALE_IMPORT,
      {
        sessionId,
        flashSaleId: session.flashSaleId,
      },
      triggeredBy,
    );

    // Store job ID on session
    await this.importSessionRepository.updateStatus(
      sessionId,
      ImportSessionStatus.PROCESSING,
      { jobId: jobResult.jobId },
    );

    return { jobId: jobResult.jobId };
  }

  // ─── Product Discount Import Session Methods ─────────────────────────────

  /**
   * Create a product discount import session by uploading and validating an Excel file
   */
  async createProductDiscountSession(
    file: Express.Multer.File,
    promotionId: string,
    dto: CreateProductDiscountImportSessionDto,
    createdBy?: string,
  ): Promise<ImportSessionResponseDto> {
    if (!file) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('promotion.fileRequired'),
        errors: { file: 'Excel file is required' },
      });
    }

    let parsedRows: ProductDiscountExcelRow[];
    try {
      parsedRows = this.parseProductDiscountExcelFile(file);
    } finally {
      this.cleanupTempFile(file);
    }
    this.logger.debug(
      `Parsed ${parsedRows.length} rows from product discount Excel file`,
    );

    if (parsedRows.length === 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('promotion.emptyExcelFile'),
        errors: { file: 'Excel file has no valid data rows' },
      });
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    const validatedRows = await this.validateProductDiscountRows(
      parsedRows,
      startTime,
      endTime,
      dto.promotionId || promotionId,
    );

    const session = await this.importSessionRepository.create({
      type: 'product_discount',
      promotionId,
      status: ImportSessionStatus.PENDING,
      totalRows: validatedRows.length,
      validCount: validatedRows.filter((r) => r.isValid).length,
      invalidCount: validatedRows.filter((r) => !r.isValid).length,
      createdBy,
    });

    const rowsToInsert = validatedRows.map((row) => ({
      sessionId: session.id,
      rowNumber: row.rowNumber,
      productId: row.productId,
      code: row.code,
      name: row.name,
      actualName: row.actualName,
      image: row.image,
      originalPrice: row.originalPrice,
      discountType: row.discountType,
      discountValue: row.discountValue,
      flashSalePrice: 0,
      promotionalQuantity: 0,
      stock: 0,
      isValid: row.isValid,
      errors: row.errors,
    }));

    await this.importSessionRowRepository.insertMany(rowsToInsert);

    return ImportSessionResponseDto.fromDomain(session);
  }

  /**
   * Confirm product discount import session - creates a background job
   */
  async confirmProductDiscountSession(
    sessionId: string,
    triggeredBy?: string,
  ): Promise<ConfirmImportSessionResponseDto> {
    const session = await this.importSessionRepository.findById(sessionId);
    if (!session) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('import-session.notFound'),
      });
    }

    if (session.type !== 'product_discount') {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Session is not a product discount import session',
      });
    }

    if (session.status !== ImportSessionStatus.PENDING) {
      throwException({
        status: HttpStatus.CONFLICT,
        message: this.i18n.t('import-session.alreadyProcessed'),
      });
    }

    if (session.validCount === 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('import-session.noValidProducts'),
      });
    }

    await this.importSessionRepository.updateStatus(
      sessionId,
      ImportSessionStatus.PROCESSING,
    );

    const jobResult = await this.jobsService.startJob(
      JobType.PRODUCT_DISCOUNT_IMPORT,
      {
        sessionId,
        promotionId: session.promotionId,
      },
      triggeredBy,
    );

    await this.importSessionRepository.updateStatus(
      sessionId,
      ImportSessionStatus.PROCESSING,
      { jobId: jobResult.jobId },
    );

    return { jobId: jobResult.jobId };
  }

  // ─── Private Methods ─────────────────────────────────────────────────────

  /**
   * Remove uploaded temp file from disk
   */
  private cleanupTempFile(file: Express.Multer.File): void {
    if (file.path) {
      fs.unlink(file.path, (err) => {
        if (err) {
          this.logger.warn(
            `Failed to remove temp file ${file.path}: ${err.message}`,
          );
        }
      });
    }
  }

  /**
   * Parse product discount Excel file (code, name, discountType, discountValue)
   */
  private parseProductDiscountExcelFile(
    file: Express.Multer.File,
  ): ProductDiscountExcelRow[] {
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      { defval: '' },
    );

    const parsedRows: ProductDiscountExcelRow[] = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2;

      const code = String(
        row['Mã sản phẩm'] ?? row['Product Code'] ?? row['code'] ?? '',
      ).trim();
      const name = String(
        row['Tên sản phẩm'] ?? row['Product Name'] ?? row['name'] ?? '',
      ).trim();
      const discountTypeRaw = String(
        row['Loại giảm giá'] ??
          row['Discount Type'] ??
          row['discountType'] ??
          '',
      ).trim();
      const discountValueRaw =
        row['Mức giảm'] ?? row['Discount Value'] ?? row['discountValue'] ?? 0;

      if (!code) continue;

      let discountType = DiscountType.FIXED;
      if (
        discountTypeRaw === '%' ||
        discountTypeRaw.toLowerCase() === 'percentage' ||
        discountTypeRaw.toLowerCase() === 'phần trăm'
      ) {
        discountType = DiscountType.PERCENTAGE;
      }

      const discountValue = Math.round(Number(discountValueRaw) || 0);

      parsedRows.push({ code, name, rowNumber, discountType, discountValue });
    }

    return parsedRows;
  }

  /**
   * Validate product discount rows against database
   */
  private async validateProductDiscountRows(
    parsedRows: ProductDiscountExcelRow[],
    startTime: Date,
    endTime: Date,
    promotionId?: string,
  ): Promise<
    Array<{
      rowNumber: number;
      productId: string;
      code: string;
      name: string;
      actualName?: string;
      image?: string;
      originalPrice: number;
      discountType: DiscountType;
      discountValue: number;
      isValid: boolean;
      errors: string[];
    }>
  > {
    const codeSet = new Set<string>();
    const duplicateCodes = new Set<string>();
    for (const item of parsedRows) {
      if (codeSet.has(item.code)) {
        duplicateCodes.add(item.code);
      }
      codeSet.add(item.code);
    }

    const codes = parsedRows.map((p) => p.code);
    const products = await this.productRepository.findByCodes(codes);
    const productMap = new Map(products.map((p) => [p.code, p]));
    const productIds = products.map((p) => p.id);

    // Check for flash sale conflicts
    let conflictFlashSaleProductIds = new Set<string>();
    const overlappingFlashSale = await this.flashSaleRepository.findOverlapping(
      startTime,
      endTime,
    );

    if (overlappingFlashSale) {
      const conflictProductsPage =
        await this.flashSaleProductRepository.findByFlashSaleIdWithPagination({
          flashSaleId: overlappingFlashSale.id,
          filterOptions: null,
          sortOptions: null,
          paginationOptions: { page: 1, limit: 10000 },
        });
      conflictFlashSaleProductIds = new Set(
        conflictProductsPage.docs.map((p) => p.productId),
      );
    }

    // Check for product discount conflicts
    const conflictPromotionProductIds = new Set<string>();
    if (this.promotionRepository && this.promotionProductRepository) {
      const activeProductDiscounts =
        await this.promotionRepository.findActiveByType(
          PromotionType.PRODUCT_DISCOUNT,
        );
      const activePromotionIds = activeProductDiscounts
        .filter((p) => !promotionId || p.id !== promotionId)
        .map((p) => p.id);

      if (activePromotionIds.length > 0 && productIds.length > 0) {
        const existingPromoProducts =
          await this.promotionProductRepository.findActiveForProducts(
            activePromotionIds,
            productIds,
          );
        for (const [pid] of existingPromoProducts) {
          conflictPromotionProductIds.add(pid);
        }
      }
    }

    const results: Array<{
      rowNumber: number;
      productId: string;
      code: string;
      name: string;
      actualName?: string;
      image?: string;
      originalPrice: number;
      discountType: DiscountType;
      discountValue: number;
      isValid: boolean;
      errors: string[];
    }> = [];

    for (const item of parsedRows) {
      const errors: string[] = [];
      const product = productMap.get(item.code);

      if (!item.code || item.discountValue < 0) {
        errors.push(ProductDiscountValidationErrorCode.INVALID_ROW_FORMAT);
      }

      if (duplicateCodes.has(item.code)) {
        errors.push(ProductDiscountValidationErrorCode.DUPLICATE_IN_EXCEL);
      }

      const row = {
        rowNumber: item.rowNumber,
        productId: product?.id ?? '',
        code: item.code,
        name: item.name,
        actualName: product?.name,
        image: product?.images?.avatar ?? undefined,
        originalPrice: product?.prices?.retail ?? 0,
        discountType: item.discountType,
        discountValue: item.discountValue,
        isValid: false,
        errors: [] as string[],
      };

      if (!product) {
        errors.push(ProductDiscountValidationErrorCode.PRODUCT_NOT_FOUND);
      } else {
        if (!product.images?.avatar && !product.images?.others?.length) {
          errors.push(ProductDiscountValidationErrorCode.NO_IMAGE);
        }

        if (conflictFlashSaleProductIds.has(product.id)) {
          errors.push(ProductDiscountValidationErrorCode.CONFLICT_FLASH_SALE);
        }

        if (conflictPromotionProductIds.has(product.id)) {
          errors.push(ProductDiscountValidationErrorCode.CONFLICT_PROMOTION);
        }

        if (
          item.discountType === DiscountType.PERCENTAGE &&
          item.discountValue > 100
        ) {
          errors.push(ProductDiscountValidationErrorCode.INVALID_ROW_FORMAT);
        }
        if (
          item.discountType === DiscountType.FIXED &&
          item.discountValue > product.prices.retail
        ) {
          errors.push(ProductDiscountValidationErrorCode.INVALID_ROW_FORMAT);
        }
      }

      row.errors = errors;
      row.isValid = errors.length === 0;
      results.push(row);
    }

    return results;
  }

  /**
   * Parse Excel file buffer to product rows (flash sale format)
   * Replicates the logic from FlashSalesService.parseExcelFile
   */
  private parseExcelFile(file: Express.Multer.File): ExcelProductRow[] {
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      { defval: '' },
    );

    const parsedRows: ExcelProductRow[] = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // Excel rows start at 1, plus header row

      const code = String(
        row['Mã sản phẩm'] ?? row['Product Code'] ?? row['code'] ?? '',
      ).trim();
      const name = String(
        row['Tên sản phẩm'] ?? row['Product Name'] ?? row['name'] ?? '',
      ).trim();
      const discountTypeRaw = String(
        row['Loại giảm giá'] ??
          row['Discount Type'] ??
          row['discountType'] ??
          '',
      ).trim();
      const discountValueRaw =
        row['Mức giảm'] ?? row['Discount Value'] ?? row['discountValue'] ?? 0;
      const promotionalQuantityRaw =
        row['Số lượng khuyến mãi'] ??
        row['Promotional Quantity'] ??
        row['promotionalQuantity'] ??
        1;

      // Skip empty rows
      if (!code) continue;

      // Parse discount type
      let discountType = DiscountType.FIXED;
      if (
        discountTypeRaw === '%' ||
        discountTypeRaw.toLowerCase() === 'percentage' ||
        discountTypeRaw.toLowerCase() === 'phần trăm'
      ) {
        discountType = DiscountType.PERCENTAGE;
      }

      // Parse numeric values - round to avoid Excel floating point artifacts
      const discountValue = Math.round(Number(discountValueRaw) || 0);
      const promotionalQuantity =
        Math.floor(Number(promotionalQuantityRaw)) || 1;

      parsedRows.push({
        code,
        name,
        discountType,
        discountValue,
        promotionalQuantity,
        rowNumber,
      });
    }

    return parsedRows;
  }

  /**
   * Validate parsed Excel rows against database
   * Replicates the logic from FlashSalesService.validateExcelProducts
   */
  private async validateRows(
    parsedRows: ExcelProductRow[],
    startTime: Date,
    endTime: Date,
    flashSaleId?: string,
  ): Promise<
    Array<{
      rowNumber: number;
      productId: string;
      code: string;
      name: string;
      actualName?: string;
      image?: string;
      originalPrice: number;
      discountType: DiscountType;
      discountValue: number;
      flashSalePrice: number;
      promotionalQuantity: number;
      stock: number;
      isValid: boolean;
      errors: string[];
    }>
  > {
    // Check for duplicates in Excel
    const codeSet = new Set<string>();
    const duplicateCodes = new Set<string>();
    for (const item of parsedRows) {
      if (codeSet.has(item.code)) {
        duplicateCodes.add(item.code);
      }
      codeSet.add(item.code);
    }

    // Batch fetch products by codes
    const codes = parsedRows.map((p) => p.code);
    const products = await this.productRepository.findByCodes(codes);
    const productMap = new Map(products.map((p) => [p.code, p]));

    // Check for flash sale conflicts
    let conflictProductIds = new Set<string>();
    const overlappingFlashSale = await this.flashSaleRepository.findOverlapping(
      startTime,
      endTime,
      flashSaleId,
    );

    if (overlappingFlashSale) {
      const conflictProductsPage =
        await this.flashSaleProductRepository.findByFlashSaleIdWithPagination({
          flashSaleId: overlappingFlashSale.id,
          filterOptions: null,
          sortOptions: null,
          paginationOptions: { page: 1, limit: 10000 },
        });
      conflictProductIds = new Set(
        conflictProductsPage.docs.map((p) => p.productId),
      );
    }

    const results: Array<{
      rowNumber: number;
      productId: string;
      code: string;
      name: string;
      actualName?: string;
      image?: string;
      originalPrice: number;
      discountType: DiscountType;
      discountValue: number;
      flashSalePrice: number;
      promotionalQuantity: number;
      stock: number;
      isValid: boolean;
      errors: string[];
    }> = [];

    for (const item of parsedRows) {
      const errors: string[] = [];
      const product = productMap.get(item.code);

      // Check for invalid row format
      if (
        !item.code ||
        item.discountValue < 0 ||
        item.promotionalQuantity < 1
      ) {
        errors.push(ValidationErrorCode.INVALID_ROW_FORMAT);
      }

      // Check for duplicate in Excel
      if (duplicateCodes.has(item.code)) {
        errors.push(ValidationErrorCode.DUPLICATE_IN_EXCEL);
      }

      const row = {
        rowNumber: item.rowNumber,
        productId: product?.id ?? '',
        code: item.code,
        name: item.name,
        actualName: product?.name,
        image: product?.images?.avatar ?? undefined,
        originalPrice: product?.prices?.retail ?? 0,
        discountType: item.discountType,
        discountValue: item.discountValue,
        flashSalePrice: 0,
        promotionalQuantity: item.promotionalQuantity,
        stock: product?.inventory?.available ?? 0,
        isValid: false,
        errors: [] as string[],
      };

      // Validation checks
      if (!product) {
        errors.push(ValidationErrorCode.PRODUCT_NOT_FOUND);
      } else {
        // Check stock
        const availableStock = product.inventory?.available ?? 0;
        if (availableStock <= 0) {
          errors.push(ValidationErrorCode.NO_STOCK);
        }

        // Check image
        if (!product.images?.avatar && !product.images?.others?.length) {
          errors.push(ValidationErrorCode.NO_IMAGE);
        }

        // Check flash sale conflict
        if (conflictProductIds.has(product.id)) {
          errors.push(ValidationErrorCode.CONFLICT_FLASH_SALE);
        }

        // Validate discount
        if (
          item.discountType === DiscountType.PERCENTAGE &&
          item.discountValue > 100
        ) {
          errors.push(ValidationErrorCode.INVALID_DISCOUNT);
        }
        if (
          item.discountType === DiscountType.FIXED &&
          item.discountValue > product.prices.retail
        ) {
          errors.push(ValidationErrorCode.INVALID_DISCOUNT);
        }

        // Calculate flash sale price
        if (!errors.includes(ValidationErrorCode.INVALID_DISCOUNT)) {
          const discountAmount = calculateRoundedDiscountAmount(
            product.prices.retail,
            item.discountType,
            item.discountValue,
          );
          row.flashSalePrice = product.prices.retail - discountAmount;
        }
      }

      row.errors = errors;
      row.isValid = errors.length === 0;
      results.push(row);
    }

    return results;
  }

  // ─── Topic Import Session Methods ────────────────────────────────────────

  /**
   * Create a topic product import session by uploading and validating an Excel file
   */
  async createTopicSession(
    file: Express.Multer.File,
    topicId: string,
    createdBy?: string,
  ): Promise<ImportSessionResponseDto> {
    if (!file) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('topic.fileRequired'),
        errors: { file: 'Excel file is required' },
      });
    }

    if (!this.topicRepository) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Topic repository not available',
      });
    }

    const topic = await this.topicRepository.findById(topicId);
    if (!topic) {
      this.cleanupTempFile(file);
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('topic.notFound'),
      });
    }

    if (topic.type !== TopicType.PRODUCT) {
      this.cleanupTempFile(file);
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('topic.invalidTypeForProductImport'),
      });
    }

    let parsedRows: TopicExcelRow[];
    try {
      parsedRows = this.parseTopicExcelFile(file);
    } finally {
      this.cleanupTempFile(file);
    }
    this.logger.debug(`Parsed ${parsedRows.length} rows from topic Excel file`);

    if (parsedRows.length === 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('topic.emptyExcelFile'),
        errors: { file: 'Excel file has no valid data rows' },
      });
    }

    const existingProductIds = new Set(
      topic.products.map((p) => p.productId.toString()),
    );

    const validatedRows = await this.validateTopicRows(
      parsedRows,
      existingProductIds,
    );

    const session = await this.importSessionRepository.create({
      type: 'topic',
      topicId,
      status: ImportSessionStatus.PENDING,
      totalRows: validatedRows.length,
      validCount: validatedRows.filter((r) => r.isValid).length,
      invalidCount: validatedRows.filter((r) => !r.isValid).length,
      createdBy,
    });

    const rowsToInsert = validatedRows.map((row) => ({
      sessionId: session.id,
      rowNumber: row.rowNumber,
      productId: row.productId,
      code: row.code,
      name: row.name,
      actualName: row.actualName,
      image: row.image,
      originalPrice: row.originalPrice,
      discountType: DiscountType.FIXED,
      discountValue: 0,
      flashSalePrice: 0,
      promotionalQuantity: 0,
      stock: 0,
      isValid: row.isValid,
      errors: row.errors,
    }));

    await this.importSessionRowRepository.insertMany(rowsToInsert);

    return ImportSessionResponseDto.fromDomain(session);
  }

  /**
   * Confirm topic import session - creates a background job for processing
   */
  async confirmTopicSession(
    sessionId: string,
    triggeredBy?: string,
  ): Promise<ConfirmImportSessionResponseDto> {
    const session = await this.importSessionRepository.findById(sessionId);
    if (!session) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('import-session.notFound'),
      });
    }

    if (session.type !== 'topic') {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Session is not a topic import session',
      });
    }

    if (session.status !== ImportSessionStatus.PENDING) {
      throwException({
        status: HttpStatus.CONFLICT,
        message: this.i18n.t('import-session.alreadyProcessed'),
      });
    }

    if (session.validCount === 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('import-session.noValidProducts'),
      });
    }

    await this.importSessionRepository.updateStatus(
      sessionId,
      ImportSessionStatus.PROCESSING,
    );

    const jobResult = await this.jobsService.startJob(
      JobType.TOPIC_PRODUCT_IMPORT,
      {
        sessionId,
        topicId: session.topicId,
      },
      triggeredBy,
    );

    await this.importSessionRepository.updateStatus(
      sessionId,
      ImportSessionStatus.PROCESSING,
      { jobId: jobResult.jobId },
    );

    return { jobId: jobResult.jobId };
  }

  /**
   * Parse topic products Excel file (code + name only)
   */
  private parseTopicExcelFile(file: Express.Multer.File): TopicExcelRow[] {
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      { defval: '' },
    );

    const parsedRows: TopicExcelRow[] = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // header is row 1

      const code = String(
        row['Mã sản phẩm'] ?? row['Product Code'] ?? row['code'] ?? '',
      ).trim();
      const name = String(
        row['Tên sản phẩm'] ?? row['Product Name'] ?? row['name'] ?? '',
      ).trim();

      if (!code) continue;

      parsedRows.push({ code, name, rowNumber });
    }

    return parsedRows;
  }

  /**
   * Validate parsed topic rows against database and existing topic products
   */
  private async validateTopicRows(
    parsedRows: TopicExcelRow[],
    existingProductIds: Set<string>,
  ): Promise<
    Array<{
      rowNumber: number;
      productId: string;
      code: string;
      name: string;
      actualName?: string;
      image?: string;
      originalPrice: number;
      isValid: boolean;
      errors: string[];
    }>
  > {
    const codeSet = new Set<string>();
    const duplicateCodes = new Set<string>();
    for (const item of parsedRows) {
      if (codeSet.has(item.code)) {
        duplicateCodes.add(item.code);
      }
      codeSet.add(item.code);
    }

    const codes = parsedRows.map((p) => p.code);
    const products = await this.productRepository.findByCodes(codes);
    const productMap = new Map(products.map((p) => [p.code, p]));

    return parsedRows.map((item) => {
      const errors: string[] = [];
      const product = productMap.get(item.code);

      if (!item.code) {
        errors.push(TopicImportValidationErrorCode.INVALID_ROW_FORMAT);
      }

      if (duplicateCodes.has(item.code)) {
        errors.push(TopicImportValidationErrorCode.DUPLICATE_IN_EXCEL);
      }

      if (!product) {
        errors.push(TopicImportValidationErrorCode.PRODUCT_NOT_FOUND);
      } else if (existingProductIds.has(product.id)) {
        errors.push(TopicImportValidationErrorCode.ALREADY_IN_TOPIC);
      }

      return {
        rowNumber: item.rowNumber,
        productId: product?.id ?? '',
        code: item.code,
        name: item.name,
        actualName: product?.name,
        image: product?.images?.avatar ?? undefined,
        originalPrice: product?.prices?.retail ?? 0,
        isValid: errors.length === 0,
        errors,
      };
    });
  }

  // ─── Affiliate Product Commission Import Session Methods ─────────────────

  /**
   * Create an affiliate product commission import session.
   * `affiliateId = null` means import for global Cài đặt hoa hồng.
   */
  async createAffiliateProductCommissionSession(
    file: Express.Multer.File,
    affiliateId: string | null,
    createdBy?: string,
  ): Promise<ImportSessionResponseDto> {
    if (!file) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('import-session.fileRequired'),
        errors: { file: 'Excel file is required' },
      });
    }

    if (affiliateId) {
      if (!this.affiliateRepository) {
        this.cleanupTempFile(file);
        throwException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Affiliate repository not available',
        });
      }

      const affiliate = await this.affiliateRepository.findById(affiliateId);
      if (!affiliate) {
        this.cleanupTempFile(file);
        throwException({
          status: HttpStatus.NOT_FOUND,
          message: this.i18n.t('import-session.affiliateNotFound'),
        });
      }
    }

    let parsedRows: AffiliateProductCommissionExcelRow[];
    try {
      parsedRows = this.parseAffiliateProductCommissionExcelFile(file);
    } finally {
      this.cleanupTempFile(file);
    }
    this.logger.debug(
      `Parsed ${parsedRows.length} rows from affiliate product commission Excel file`,
    );

    if (parsedRows.length === 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('import-session.emptyExcelFile'),
        errors: { file: 'Excel file has no valid data rows' },
      });
    }

    const validatedRows =
      await this.validateAffiliateProductCommissionRows(parsedRows);

    const session = await this.importSessionRepository.create({
      type: 'affiliate_product_commission',
      affiliateId: affiliateId ?? undefined,
      status: ImportSessionStatus.PENDING,
      totalRows: validatedRows.length,
      validCount: validatedRows.filter((r) => r.isValid).length,
      invalidCount: validatedRows.filter((r) => !r.isValid).length,
      createdBy,
    });

    const rowsToInsert = validatedRows.map((row) => ({
      sessionId: session.id,
      rowNumber: row.rowNumber,
      productId: row.productId,
      code: row.code,
      name: row.name,
      actualName: row.actualName,
      image: row.image,
      originalPrice: row.originalPrice,
      discountType: DiscountType.FIXED,
      discountValue: 0,
      flashSalePrice: 0,
      promotionalQuantity: 0,
      stock: 0,
      commissionRate: row.commissionRate,
      isValid: row.isValid,
      errors: row.errors,
    }));

    await this.importSessionRowRepository.insertMany(rowsToInsert);

    return ImportSessionResponseDto.fromDomain(session);
  }

  /**
   * Confirm affiliate product commission import session.
   * Starts a background job that upserts product commissions with the
   * commissionRate parsed from each row.
   */
  async confirmAffiliateProductCommissionSession(
    sessionId: string,
    triggeredBy?: string,
  ): Promise<ConfirmImportSessionResponseDto> {
    const session = await this.importSessionRepository.findById(sessionId);
    if (!session) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('import-session.notFound'),
      });
    }

    if (session.type !== 'affiliate_product_commission') {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message:
          'Session is not an affiliate product commission import session',
      });
    }

    if (session.status !== ImportSessionStatus.PENDING) {
      throwException({
        status: HttpStatus.CONFLICT,
        message: this.i18n.t('import-session.alreadyProcessed'),
      });
    }

    if (session.validCount === 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('import-session.noValidProducts'),
      });
    }

    await this.importSessionRepository.updateStatus(
      sessionId,
      ImportSessionStatus.PROCESSING,
    );

    const jobResult = await this.jobsService.startJob(
      JobType.AFFILIATE_PRODUCT_COMMISSION_IMPORT,
      {
        sessionId,
        affiliateId: session.affiliateId ?? null,
      },
      triggeredBy,
    );

    await this.importSessionRepository.updateStatus(
      sessionId,
      ImportSessionStatus.PROCESSING,
      { jobId: jobResult.jobId },
    );

    return { jobId: jobResult.jobId };
  }

  /**
   * Parse affiliate product commission Excel file (Mã SP + Tên SP + Tỷ lệ hoa hồng %)
   */
  private parseAffiliateProductCommissionExcelFile(
    file: Express.Multer.File,
  ): AffiliateProductCommissionExcelRow[] {
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      { defval: '' },
    );

    const parsedRows: AffiliateProductCommissionExcelRow[] = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2;

      const code = String(
        row['Mã sản phẩm'] ?? row['Product Code'] ?? row['code'] ?? '',
      ).trim();
      const name = String(
        row['Tên sản phẩm'] ?? row['Product Name'] ?? row['name'] ?? '',
      ).trim();
      const rateRaw =
        row['Tỷ lệ hoa hồng (%)'] ??
        row['Tỷ lệ hoa hồng'] ??
        row['Commission Rate'] ??
        row['commissionRate'] ??
        '';

      if (!code) continue;

      const commissionRate = Number(rateRaw);

      parsedRows.push({
        code,
        name,
        commissionRate: Number.isFinite(commissionRate) ? commissionRate : NaN,
        rowNumber,
      });
    }

    return parsedRows;
  }

  /**
   * Validate parsed rows against the product catalog.
   * Duplicate-with-existing-DB-row is NOT an error here — the worker will
   * upsert with the explicit rate from Excel.
   */
  private async validateAffiliateProductCommissionRows(
    parsedRows: AffiliateProductCommissionExcelRow[],
  ): Promise<
    Array<{
      rowNumber: number;
      productId: string;
      code: string;
      name: string;
      actualName?: string;
      image?: string;
      originalPrice: number;
      commissionRate: number;
      isValid: boolean;
      errors: string[];
    }>
  > {
    const codeSet = new Set<string>();
    const duplicateCodes = new Set<string>();
    for (const item of parsedRows) {
      if (codeSet.has(item.code)) {
        duplicateCodes.add(item.code);
      }
      codeSet.add(item.code);
    }

    const codes = parsedRows.map((p) => p.code);
    const products = await this.productRepository.findByCodes(codes);
    const productMap = new Map(products.map((p) => [p.code, p]));

    return parsedRows.map((item) => {
      const errors: string[] = [];
      const product = productMap.get(item.code);

      if (!item.code) {
        errors.push(
          AffiliateProductCommissionValidationErrorCode.INVALID_ROW_FORMAT,
        );
      }

      if (
        !Number.isFinite(item.commissionRate) ||
        item.commissionRate < 0 ||
        item.commissionRate > 100
      ) {
        errors.push(AffiliateProductCommissionValidationErrorCode.INVALID_RATE);
      }

      if (duplicateCodes.has(item.code)) {
        errors.push(
          AffiliateProductCommissionValidationErrorCode.DUPLICATE_IN_EXCEL,
        );
      }

      if (!product) {
        errors.push(
          AffiliateProductCommissionValidationErrorCode.PRODUCT_NOT_FOUND,
        );
      }

      return {
        rowNumber: item.rowNumber,
        productId: product?.id ?? '',
        code: item.code,
        name: item.name,
        actualName: product?.name,
        image: product?.images?.avatar ?? undefined,
        originalPrice: product?.prices?.retail ?? 0,
        commissionRate: Number.isFinite(item.commissionRate)
          ? item.commissionRate
          : 0,
        isValid: errors.length === 0,
        errors,
      };
    });
  }
}
