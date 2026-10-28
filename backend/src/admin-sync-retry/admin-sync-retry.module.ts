import { Module, Injectable, INestApplication, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import basicAuth from 'express-basic-auth';
import express from 'express';
import { OrderRepository } from '../shop/order/domain/order.repository';
import { OrderDocumentModule } from '../shop/order/model/order-document.module';
import { OrderCdpSyncService } from '../cdp/order-cdp-sync.service';
import { OrderNhanhSyncService } from '../nhanh/services/order-nhanh-sync.service';
import { CdpModule } from '../cdp/cdp.module';
import { NhanhModule } from '../nhanh/nhanh.module';
import { AllConfigType } from '../config/config.type';
import { Order } from '../shop/order/domain/order';

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface SyncRetryResult {
  syncType: 'cdp' | 'nhanh';
  success: boolean;
  details?: string;
  error?: string;
}

/**
 * Build the status badge HTML
 */
function statusBadge(status: string): string {
  const bg =
    status === 'synced'
      ? '#d4edda'
      : status === 'failed'
        ? '#f8d7da'
        : '#fff3cd';
  const color =
    status === 'synced'
      ? '#155724'
      : status === 'failed'
        ? '#721c24'
        : '#856404';
  return `<span style="padding: 2px 8px; border-radius: 4px; font-size: 13px; background: ${bg}; color: ${color};">${escapeHtml(status)}</span>`;
}

/**
 * Build the order info HTML table
 */
function renderOrderInfo(order: Order): string {
  const cdpStatus = order.cdp?.syncStatus ?? 'N/A';
  const cdpError = order.cdp?.syncError ? escapeHtml(order.cdp.syncError) : '';
  const nhanhStatus = order.nhanh?.syncStatus ?? 'N/A';
  const nhanhError = order.nhanh?.syncError
    ? escapeHtml(order.nhanh.syncError)
    : '';
  const nhanhOrderId = order.nhanh?.orderId ?? 'N/A';
  const cdpCustomerId = order.cdp?.customerId ?? 'N/A';

  return `
  <div style="margin-bottom: 24px; padding: 16px; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
    <h2 style="margin: 0 0 12px; color: #333; font-size: 16px;">Order: ${escapeHtml(order.orderNumber)}</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 6px 8px; font-weight: bold; color: #555; width: 160px;">Order ID</td>
        <td style="padding: 6px 8px; font-family: monospace; font-size: 13px;">${escapeHtml(order.id)}</td>
      </tr>
      <tr>
        <td style="padding: 6px 8px; font-weight: bold; color: #555;">Status</td>
        <td style="padding: 6px 8px;">${escapeHtml(order.status)}</td>
      </tr>
      <tr>
        <td style="padding: 6px 8px; font-weight: bold; color: #555;">Payment</td>
        <td style="padding: 6px 8px;">${escapeHtml(order.paymentMethod)} (${escapeHtml(order.paymentStatus)})</td>
      </tr>
      <tr>
        <td style="padding: 6px 8px; font-weight: bold; color: #555;">CDP Sync Status</td>
        <td style="padding: 6px 8px;">${statusBadge(cdpStatus)}</td>
      </tr>
      ${cdpError ? `<tr><td style="padding: 6px 8px; font-weight: bold; color: #555;">CDP Error</td><td style="padding: 6px 8px; color: #721c24; font-size: 13px;">${cdpError}</td></tr>` : ''}
      <tr>
        <td style="padding: 6px 8px; font-weight: bold; color: #555;">CDP Customer ID</td>
        <td style="padding: 6px 8px; font-family: monospace; font-size: 13px;">${escapeHtml(String(cdpCustomerId))}</td>
      </tr>
      <tr>
        <td style="padding: 6px 8px; font-weight: bold; color: #555;">Nhanh Sync Status</td>
        <td style="padding: 6px 8px;">${statusBadge(nhanhStatus)}</td>
      </tr>
      ${nhanhError ? `<tr><td style="padding: 6px 8px; font-weight: bold; color: #555;">Nhanh Error</td><td style="padding: 6px 8px; color: #721c24; font-size: 13px;">${nhanhError}</td></tr>` : ''}
      <tr>
        <td style="padding: 6px 8px; font-weight: bold; color: #555;">Nhanh Order ID</td>
        <td style="padding: 6px 8px; font-family: monospace; font-size: 13px;">${escapeHtml(String(nhanhOrderId))}</td>
      </tr>
    </table>
  </div>`;
}

/**
 * Render the confirmation page before executing a retry
 */
function renderConfirmPage(
  order: Order,
  orderIdentifier: string,
  syncType: 'cdp' | 'nhanh',
): string {
  const label = syncType === 'cdp' ? 'CDP' : 'Nhanh';
  const currentStatus =
    syncType === 'cdp'
      ? (order.cdp?.syncStatus ?? 'N/A')
      : (order.nhanh?.syncStatus ?? 'N/A');
  const isAlreadySynced = currentStatus === 'synced';
  const confirmAction =
    syncType === 'cdp' ? 'confirm_retry_cdp' : 'confirm_retry_nhanh';

  let warningHtml = '';
  if (isAlreadySynced) {
    const extra =
      syncType === 'nhanh' && order.nhanh?.orderId
        ? ` Nhanh Order ID: ${escapeHtml(String(order.nhanh.orderId))}.`
        : syncType === 'cdp' && order.cdp?.customerId
          ? ` CDP Customer ID: ${escapeHtml(order.cdp.customerId)}.`
          : '';
    warningHtml = `
    <div style="padding: 12px 16px; margin-bottom: 16px; background: #fff3cd; color: #856404; border: 1px solid #ffc107; border-radius: 4px;">
      <strong>Warning:</strong> ${label} sync is already <strong>synced</strong>.${extra}
      Re-syncing may create duplicate data in the external system.
    </div>`;
  }

  return `<!DOCTYPE html>
<html><head><title>Confirm ${label} Sync Retry</title></head>
<body style="font-family: -apple-system, sans-serif; max-width: 700px; margin: 40px auto; padding: 0 20px;">
  <h1 style="color: #333;">Confirm ${label} Sync Retry</h1>
  ${warningHtml}
  ${renderOrderInfo(order)}
  <p style="color: #333; margin-bottom: 16px;">Are you sure you want to retry <strong>${label}</strong> sync for order <strong>${escapeHtml(order.orderNumber)}</strong>?</p>
  <form method="POST" action="/admin/sync-retry" style="display: flex; gap: 8px;">
    <input type="hidden" name="orderIdentifier" value="${escapeHtml(orderIdentifier)}" />
    <button type="submit" name="action" value="${confirmAction}"
      style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
      Yes, Retry ${label} Sync
    </button>
    <button type="submit" name="action" value="lookup"
      style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
      Cancel
    </button>
  </form>
  <hr style="margin-top: 32px;">
  <p style="color: #999; font-size: 12px;">
    <a href="/admin/queues" style="color: #007bff;">Bull Board</a> &middot;
    <a href="/admin/config" style="color: #007bff;">Admin Config</a>
  </p>
</body></html>`;
}

/**
 * Render the main admin sync retry HTML page
 */
function renderSyncRetryPage(options?: {
  order?: Order;
  orderIdentifier?: string;
  result?: SyncRetryResult;
  lookupError?: string;
}): string {
  const { order, orderIdentifier, result, lookupError } = options ?? {};

  const orderInfoHtml = order ? renderOrderInfo(order) : '';

  let resultHtml = '';
  if (result) {
    const bgColor = result.success ? '#d4edda' : '#f8d7da';
    const textColor = result.success ? '#155724' : '#721c24';
    const label = result.syncType === 'cdp' ? 'CDP' : 'Nhanh';
    const statusText = result.success ? 'SUCCESS' : 'FAILED';
    const detailText = result.details
      ? `<br/><span style="font-size: 13px;">${escapeHtml(result.details)}</span>`
      : '';
    const errorText = result.error
      ? `<br/><span style="font-size: 13px;">Error: ${escapeHtml(result.error)}</span>`
      : '';

    resultHtml = `
    <div style="padding: 12px 16px; margin-bottom: 16px; background: ${bgColor}; color: ${textColor}; border-radius: 4px;">
      <strong>${label} Sync Retry: ${statusText}</strong>${detailText}${errorText}
    </div>`;
  }

  let lookupErrorHtml = '';
  if (lookupError) {
    lookupErrorHtml = `
    <div style="padding: 12px 16px; margin-bottom: 16px; background: #f8d7da; color: #721c24; border-radius: 4px;">
      ${escapeHtml(lookupError)}
    </div>`;
  }

  return `<!DOCTYPE html>
<html><head><title>Admin - Sync Retry</title></head>
<body style="font-family: -apple-system, sans-serif; max-width: 700px; margin: 40px auto; padding: 0 20px;">
  <h1 style="color: #333;">Order Sync Retry</h1>
  <p style="color: #666; margin-bottom: 24px;">Manually retry CDP or Nhanh.vn sync for orders that failed to sync.</p>
  ${resultHtml}${lookupErrorHtml}

  <form method="POST" action="/admin/sync-retry" style="margin-bottom: 24px;">
    <div style="margin-bottom: 16px;">
      <label for="orderIdentifier" style="display: block; font-weight: bold; margin-bottom: 4px;">Order Number or ID</label>
      <input type="text" id="orderIdentifier" name="orderIdentifier" value="${escapeHtml(orderIdentifier ?? '')}"
        placeholder="e.g. ORD-20241204-0001 or 67abc..."
        style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;" required />
    </div>
    <div style="display: flex; gap: 8px;">
      <button type="submit" name="action" value="lookup"
        style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
        Lookup Order
      </button>
      <button type="submit" name="action" value="retry_cdp"
        style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
        Retry CDP Sync
      </button>
      <button type="submit" name="action" value="retry_nhanh"
        style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
        Retry Nhanh Sync
      </button>
    </div>
  </form>

  ${orderInfoHtml}

  <hr style="margin-top: 32px;">
  <p style="color: #999; font-size: 12px;">
    <a href="/admin/queues" style="color: #007bff;">Bull Board</a> &middot;
    <a href="/admin/config" style="color: #007bff;">Admin Config</a>
  </p>
</body></html>`;
}

/**
 * Service for setting up admin sync retry Express routes with Basic Auth
 */
@Injectable()
export class AdminSyncRetrySetupService {
  private readonly logger = new Logger(AdminSyncRetrySetupService.name);

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly orderRepository: OrderRepository,
    private readonly orderCdpSyncService: OrderCdpSyncService,
    private readonly orderNhanhSyncService: OrderNhanhSyncService,
  ) {}

  /**
   * Find order by order number or ID
   */
  private async findOrder(identifier: string): Promise<Order | null> {
    // Try by order number first
    const byOrderNumber =
      await this.orderRepository.findByOrderNumber(identifier);
    if (byOrderNumber) return byOrderNumber;

    // Fallback to ID
    const byId = await this.orderRepository.findById(identifier);
    return byId ?? null;
  }

  /**
   * Setup admin sync retry routes on the Express app with Basic Auth
   * Call this from main.ts after NestFactory.create()
   */
  setupAdminSyncRetry(app: INestApplication) {
    const expressApp = app.getHttpAdapter().getInstance();

    const username =
      this.configService.get('app.adminUsername', { infer: true }) ?? 'admin';
    const password =
      this.configService.get('app.adminPassword', { infer: true }) ??
      'admin123';

    // URL-encoded body parser for HTML form submissions
    expressApp.use('/admin/sync-retry', express.urlencoded({ extended: true }));

    // Basic Auth middleware
    expressApp.use(
      '/admin/sync-retry',
      basicAuth({
        users: { [username]: password },
        challenge: true,
        realm: 'Admin Sync Retry',
      }),
    );

    // GET - show sync retry form
    expressApp.get('/admin/sync-retry', (_req: any, res: any) => {
      res.type('html').send(renderSyncRetryPage());
    });

    // POST - lookup or retry sync
    expressApp.post('/admin/sync-retry', async (req: any, res: any) => {
      const orderIdentifier = (req.body?.orderIdentifier ?? '').trim();
      const action: string = req.body?.action ?? '';

      if (!orderIdentifier) {
        res.type('html').send(
          renderSyncRetryPage({
            lookupError: 'Please enter an order number or ID.',
          }),
        );
        return;
      }

      const order = await this.findOrder(orderIdentifier);
      if (!order) {
        res.type('html').send(
          renderSyncRetryPage({
            orderIdentifier,
            lookupError: `Order not found: ${orderIdentifier}`,
          }),
        );
        return;
      }

      // Lookup only — show order info
      if (action === 'lookup') {
        res.type('html').send(renderSyncRetryPage({ order, orderIdentifier }));
        return;
      }

      // Show confirmation page before CDP retry
      if (action === 'retry_cdp') {
        res.type('html').send(renderConfirmPage(order, orderIdentifier, 'cdp'));
        return;
      }

      // Show confirmation page before Nhanh retry
      if (action === 'retry_nhanh') {
        res
          .type('html')
          .send(renderConfirmPage(order, orderIdentifier, 'nhanh'));
        return;
      }

      // Execute CDP sync after confirmation
      if (action === 'confirm_retry_cdp') {
        try {
          this.logger.log(
            `Admin retry CDP sync for order ${order.orderNumber}`,
          );
          const cdpResult = await this.orderCdpSyncService.syncOrder(order);
          const refreshedOrder = await this.findOrder(orderIdentifier);
          res.type('html').send(
            renderSyncRetryPage({
              order: refreshedOrder ?? order,
              orderIdentifier,
              result: {
                syncType: 'cdp',
                success: cdpResult.success,
                details: cdpResult.cdpCustomerId
                  ? `CDP Customer ID: ${cdpResult.cdpCustomerId}`
                  : undefined,
              },
            }),
          );
        } catch (err) {
          this.logger.error(
            `Admin retry CDP sync failed for order ${order.orderNumber}`,
            err,
          );
          const refreshedOrder = await this.findOrder(orderIdentifier);
          res.type('html').send(
            renderSyncRetryPage({
              order: refreshedOrder ?? order,
              orderIdentifier,
              result: {
                syncType: 'cdp',
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
              },
            }),
          );
        }
        return;
      }

      // Execute Nhanh sync after confirmation
      if (action === 'confirm_retry_nhanh') {
        try {
          this.logger.log(
            `Admin retry Nhanh sync for order ${order.orderNumber}`,
          );
          const nhanhResult = await this.orderNhanhSyncService.syncOrder(order);
          const refreshedOrder = await this.findOrder(orderIdentifier);
          res.type('html').send(
            renderSyncRetryPage({
              order: refreshedOrder ?? order,
              orderIdentifier,
              result: {
                syncType: 'nhanh',
                success: nhanhResult.success,
                details: nhanhResult.nhanhOrderId
                  ? `Nhanh Order ID: ${nhanhResult.nhanhOrderId}`
                  : undefined,
              },
            }),
          );
        } catch (err) {
          this.logger.error(
            `Admin retry Nhanh sync failed for order ${order.orderNumber}`,
            err,
          );
          const refreshedOrder = await this.findOrder(orderIdentifier);
          res.type('html').send(
            renderSyncRetryPage({
              order: refreshedOrder ?? order,
              orderIdentifier,
              result: {
                syncType: 'nhanh',
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
              },
            }),
          );
        }
        return;
      }

      // Unknown action — just show order
      res.type('html').send(renderSyncRetryPage({ order, orderIdentifier }));
    });
  }
}

/**
 * Admin sync retry module for manually retrying CDP/Nhanh order sync
 * Protected by HTTP Basic Auth (same credentials as Bull Board)
 */
@Module({
  imports: [ConfigModule, OrderDocumentModule, CdpModule, NhanhModule],
  providers: [AdminSyncRetrySetupService],
  exports: [AdminSyncRetrySetupService],
})
export class AdminSyncRetryModule {}
