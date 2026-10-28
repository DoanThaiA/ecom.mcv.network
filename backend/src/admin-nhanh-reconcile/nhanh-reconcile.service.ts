import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { AllConfigType } from '../config/config.type';
import { NhanhApiClient } from '../nhanh/utils/nhanh-api-client';
import { NhanhAuthService } from '../nhanh/services/nhanh-auth.service';
import {
  ProductSchemaClass,
  ProductDocument,
} from '../products/model/product.schema';
import {
  OrderSchemaClass,
  OrderDocument,
} from '../shop/order/model/order.schema';
import {
  compareOrder,
  compareProduct,
  OrderComparison,
  ProductComparison,
  summariseOrders,
  summariseProducts,
  BatchSummary,
} from './nhanh-reconcile.view-model';

/** Nhanh accepts at most 100 ids per `filters.ids` call. */
const NHANH_ID_BATCH = 100;
const NHANH_ORDER_BATCH = 50;

/** Upper bound on a batch sample, to keep the page a bounded HTTP request. */
export const MAX_SAMPLE = 1000;
export const DEFAULT_SAMPLE = 300;

export interface ProductRow {
  id: string;
  code: string;
  name: string;
  parentId: number;
  comparison: ProductComparison;
}

export interface OrderRow {
  id: string;
  orderNumber: string;
  total: number;
  createdAt: Date | null;
  comparison: OrderComparison;
}

export interface FixOutcome {
  applied: boolean;
  reason: string;
}

/**
 * Read-mostly reconciliation between our database and Nhanh.vn.
 *
 * Writes are limited to a single status field on a single document, always
 * guarded by the value the caller saw, and never in bulk. Bulk repair stays in
 * the reviewed local scripts, which carry backups, journals and a canary step
 * that an HTTP request cannot reasonably provide.
 */
@Injectable()
export class NhanhReconcileService {
  private readonly logger = new Logger(NhanhReconcileService.name);

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly i18n: I18nService,
    private readonly nhanhAuthService: NhanhAuthService,
    @InjectModel(ProductSchemaClass.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(OrderSchemaClass.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  private async token() {
    const tokenData = await this.nhanhAuthService.getAccessToken();
    if (!tokenData) {
      throw new Error(
        'Chưa có access token Nhanh.vn. Kết nối lại tại CMS trước khi đối soát.',
      );
    }
    return tokenData;
  }

  /**
   * Fetch products from Nhanh by id.
   *
   * Uses `product/list` with `filters.ids`, not `product/detail`: only the list
   * endpoint accepts a list of ids, and — critically — filtering by ids bypasses
   * the status filter, so products demoted to "Mới"/"Ngừng bán" are still
   * returned. Those are exactly the ones that fall out of the normal sync feed
   * and can never self-correct.
   */
  private async fetchNhanhProducts(
    ids: number[],
  ): Promise<Map<number, { status?: number; available?: number }>> {
    const tokenData = await this.token();
    const out = new Map<number, { status?: number; available?: number }>();

    for (let i = 0; i < ids.length; i += NHANH_ID_BATCH) {
      const slice = ids.slice(i, i + NHANH_ID_BATCH);
      const res = await NhanhApiClient.call<any>(
        '/v3.0/product/list',
        { filters: { ids: slice }, paginator: { size: NHANH_ID_BATCH } },
        tokenData,
        this.configService,
        this.i18n,
      );
      for (const p of (res.data as any[]) ?? []) {
        if (p?.id == null) continue;
        out.set(Number(p.id), {
          status: Number(p.status),
          available: p?.inventory?.available,
        });
      }
    }

    return out;
  }

  private async fetchNhanhOrders(ids: number[]): Promise<Map<number, number>> {
    const tokenData = await this.token();
    const out = new Map<number, number>();

    for (let i = 0; i < ids.length; i += NHANH_ORDER_BATCH) {
      const slice = ids.slice(i, i + NHANH_ORDER_BATCH);
      const res = await NhanhApiClient.call<any>(
        '/v3.0/order/list',
        { filters: { ids: slice }, paginator: { size: NHANH_ORDER_BATCH } },
        tokenData,
        this.configService,
        this.i18n,
      );
      for (const row of (res.data as any[]) ?? []) {
        if (row?.info?.id == null) continue;
        out.set(Number(row.info.id), Number(row.info.status));
      }
    }

    return out;
  }

  /** Look up one product by its code and compare it with Nhanh. */
  async lookupProduct(code: string): Promise<ProductRow | null> {
    const doc = await this.productModel
      .findOne({ code: code.trim(), source: 'nhanh', deletedAt: null })
      .select(
        'code name status inventory.available snapshot.id snapshot.parentId',
      )
      .lean();

    if (!doc) return null;

    const nhanhId = Number((doc as any)?.snapshot?.id);
    const live = Number.isFinite(nhanhId)
      ? await this.fetchNhanhProducts([nhanhId])
      : new Map();

    return this.toProductRow(doc, live.get(nhanhId));
  }

  /** Look up one order by its order number and compare it with Nhanh. */
  async lookupOrder(orderNumber: string): Promise<OrderRow | null> {
    const doc = await this.orderModel
      .findOne({ orderNumber: orderNumber.trim() })
      .select('orderNumber status total createdAt nhanh.orderId')
      .lean();

    if (!doc) return null;

    const nhanhId = Number((doc as any)?.nhanh?.orderId);
    const live = Number.isFinite(nhanhId)
      ? await this.fetchNhanhOrders([nhanhId])
      : new Map<number, number>();

    return this.toOrderRow(doc, live.get(nhanhId) ?? null);
  }

  /**
   * Compare a bounded sample of the most recently touched products.
   *
   * A sample, not an audit: a full pass needs ~280 Nhanh calls and minutes of
   * wall clock, which does not belong in a page request. The rate it reports is
   * an early warning — anything above zero means running the local reconcile
   * script for the real number.
   */
  async sampleProducts(
    limit: number,
  ): Promise<{ rows: ProductRow[]; summary: BatchSummary }> {
    const capped = Math.min(Math.max(1, limit), MAX_SAMPLE);

    const docs = await this.productModel
      .find({
        source: 'nhanh',
        deletedAt: null,
        'snapshot.id': { $exists: true, $ne: null },
      })
      .select(
        'code name status inventory.available snapshot.id snapshot.parentId',
      )
      .sort({ updatedAt: -1 })
      .limit(capped)
      .lean();

    const ids = docs
      .map((d: any) => Number(d?.snapshot?.id))
      .filter((n) => Number.isFinite(n));
    const live = await this.fetchNhanhProducts(ids);

    const rows = docs.map((d: any) =>
      this.toProductRow(d, live.get(Number(d?.snapshot?.id))),
    );

    return { rows, summary: summariseProducts(rows.map((r) => r.comparison)) };
  }

  /** Compare a bounded sample of orders that have not reached a final state. */
  async sampleOrders(
    limit: number,
  ): Promise<{ rows: OrderRow[]; summary: BatchSummary }> {
    const capped = Math.min(Math.max(1, limit), MAX_SAMPLE);

    const docs = await this.orderModel
      .find({
        status: { $in: ['pending', 'processing', 'confirmed', 'shipped'] },
        'nhanh.orderId': { $exists: true, $ne: null },
      })
      .select('orderNumber status total createdAt nhanh.orderId')
      .sort({ createdAt: 1 })
      .limit(capped)
      .lean();

    const ids = docs
      .map((d: any) => Number(d?.nhanh?.orderId))
      .filter((n) => Number.isFinite(n));
    const live = await this.fetchNhanhOrders(ids);

    const rows = docs.map((d: any) =>
      this.toOrderRow(d, live.get(Number(d?.nhanh?.orderId)) ?? null),
    );

    return { rows, summary: summariseOrders(rows.map((r) => r.comparison)) };
  }

  /**
   * Set one product's status to what Nhanh reports.
   *
   * The filter pins `_id`, `source`, `deletedAt` and the status the caller saw,
   * so a value changed by a webhook between viewing and clicking is left alone
   * rather than overwritten. Only the two status fields are set; nothing else on
   * the document and no other document is touched.
   */
  async fixProductStatus(
    id: string,
    expectedFrom: number,
    to: number,
  ): Promise<FixOutcome> {
    if (!Types.ObjectId.isValid(id)) {
      return { applied: false, reason: 'ID sản phẩm không hợp lệ.' };
    }

    const res = await this.productModel.updateOne(
      {
        _id: new Types.ObjectId(id),
        source: 'nhanh',
        deletedAt: null,
        status: expectedFrom,
      },
      { $set: { status: to, 'snapshot.status': to } },
    );

    if (res.matchedCount === 0) {
      return {
        applied: false,
        reason:
          'Sản phẩm không còn ở trạng thái lúc bạn xem — nhiều khả năng webhook vừa cập nhật. Tải lại trang và kiểm tra lại.',
      };
    }

    this.logger.log(
      `Admin reconcile: product ${id} status ${expectedFrom} -> ${to}`,
    );
    return {
      applied: true,
      reason:
        'Đã cập nhật. Với biến thể, cần chạy job `nhanh_product_embed_sync` để đẩy sang bản nhúng trên sản phẩm cha — đó mới là thứ website đọc.',
    };
  }

  /**
   * Set one order's status to what Nhanh reports.
   *
   * Status only. The webhook handler additionally pushes to CDP and touches
   * affiliate commission; this page deliberately does neither, so a click here
   * can never create a financial obligation or send anything to an external
   * system. Use the local scripts when those side effects are wanted.
   */
  async fixOrderStatus(
    id: string,
    expectedFrom: string,
    to: string,
  ): Promise<FixOutcome> {
    if (!Types.ObjectId.isValid(id)) {
      return { applied: false, reason: 'ID đơn hàng không hợp lệ.' };
    }

    const res = await this.orderModel.updateOne(
      { _id: new Types.ObjectId(id), status: expectedFrom },
      { $set: { status: to } },
    );

    if (res.matchedCount === 0) {
      return {
        applied: false,
        reason:
          'Đơn không còn ở trạng thái lúc bạn xem — nhiều khả năng webhook vừa cập nhật. Tải lại trang và kiểm tra lại.',
      };
    }

    this.logger.log(
      `Admin reconcile: order ${id} status ${expectedFrom} -> ${to}`,
    );
    return {
      applied: true,
      reason:
        'Đã cập nhật trạng thái đơn. KHÔNG đẩy CDP và KHÔNG đụng hoa hồng affiliate — nếu cần thì dùng script local.',
    };
  }

  private toProductRow(doc: any, nhanh: any): ProductRow {
    return {
      id: String(doc._id),
      code: doc.code ?? '',
      name: doc.name ?? '',
      parentId: Number(doc?.snapshot?.parentId),
      comparison: compareProduct(
        {
          code: doc.code,
          name: doc.name,
          status: doc.status,
          available: doc?.inventory?.available,
          parentId: Number(doc?.snapshot?.parentId),
        },
        nhanh ? { status: nhanh.status, available: nhanh.available } : null,
      ),
    };
  }

  private toOrderRow(doc: any, nhanhStatus: number | null): OrderRow {
    return {
      id: String(doc._id),
      orderNumber: doc.orderNumber ?? '',
      total: Number(doc.total) || 0,
      createdAt: doc.createdAt ? new Date(doc.createdAt) : null,
      comparison: compareOrder(doc.status, nhanhStatus),
    };
  }
}
