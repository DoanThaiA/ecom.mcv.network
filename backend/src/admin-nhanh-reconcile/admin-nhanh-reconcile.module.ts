import { Module, Injectable, INestApplication, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import basicAuth from 'express-basic-auth';
import express from 'express';
import { AllConfigType } from '../config/config.type';
import { NhanhModule } from '../nhanh/nhanh.module';
import { ProductDocumentModule } from '../products/model/product-document.module';
import { OrderDocumentModule } from '../shop/order/model/order-document.module';
import { NhanhReconcileService } from './nhanh-reconcile.service';
import {
  DEFAULT_SAMPLE,
  MAX_SAMPLE,
  OrderRow,
  ProductRow,
} from './nhanh-reconcile.service';
import {
  BatchSummary,
  PRODUCT_STATUS_LABEL,
} from './nhanh-reconcile.view-model';

function esc(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const money = (n: number) => (Number(n) || 0).toLocaleString('vi-VN');
const pStatus = (s: number | null) =>
  s === null ? '—' : `${s} — ${PRODUCT_STATUS_LABEL[s] ?? '?'}`;

const PAGE_HEAD = `<!DOCTYPE html><html lang="vi"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Đối soát Nhanh.vn</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:1100px;margin:40px auto;padding:0 20px;color:#212529;">`;

const PAGE_FOOT = `<hr style="margin-top:32px;">
<p style="color:#999;font-size:12px;">
  <a href="/admin/webhook-health" style="color:#007bff;">Webhook Health</a> &middot;
  <a href="/admin/sync-retry" style="color:#007bff;">Sync Retry</a> &middot;
  <a href="/admin/queues" style="color:#007bff;">Bull Board</a> &middot;
  <a href="/admin/config" style="color:#007bff;">Admin Config</a>
</p></body></html>`;

function alertBox(kind: 'ok' | 'warn' | 'err' | 'info', html: string): string {
  const c = {
    ok: ['#d4edda', '#155724'],
    warn: ['#fff3cd', '#856404'],
    err: ['#f8d7da', '#721c24'],
    info: ['#e2e3e5', '#383d41'],
  }[kind];
  return `<div style="background:${c[0]};color:${c[1]};padding:14px 16px;border-radius:6px;margin:16px 0;">${html}</div>`;
}

function forms(defaults: {
  code?: string;
  orderNumber?: string;
  limit?: number;
}) {
  const limit = defaults.limit ?? DEFAULT_SAMPLE;
  const input =
    'padding:8px 10px;border:1px solid #ced4da;border-radius:4px;font-size:14px;';
  const btn =
    'padding:8px 16px;border:0;border-radius:4px;background:#007bff;color:#fff;font-size:14px;cursor:pointer;';

  return `
<h2 style="font-size:17px;margin-top:28px;">Tra cứu một mục</h2>
<form method="post" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px;">
  <input type="hidden" name="action" value="lookup_product">
  <input name="code" value="${esc(defaults.code ?? '')}" placeholder="Mã sản phẩm, vd 15FNT2022ST" style="${input}width:280px;">
  <button type="submit" style="${btn}">Tra sản phẩm</button>
</form>
<form method="post" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
  <input type="hidden" name="action" value="lookup_order">
  <input name="orderNumber" value="${esc(defaults.orderNumber ?? '')}" placeholder="Mã đơn, vd ORD-20260807-0005" style="${input}width:280px;">
  <button type="submit" style="${btn}">Tra đơn hàng</button>
</form>

<h2 style="font-size:17px;margin-top:32px;">Đối soát theo lô (chỉ đọc)</h2>
<form method="post" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
  <input name="limit" type="number" min="1" max="${MAX_SAMPLE}" value="${limit}" style="${input}width:110px;">
  <button type="submit" name="action" value="sample_products" style="${btn}">Lấy mẫu sản phẩm</button>
  <button type="submit" name="action" value="sample_orders" style="${btn}background:#6c757d;">Lấy mẫu đơn hàng</button>
</form>`;
}

function summaryBox(summary: BatchSummary, kind: 'product' | 'order'): string {
  const clean = summary.statusDiverged === 0 && summary.stockDiverged === 0;
  const lines = [
    `Đã kiểm tra: <strong>${summary.checked}</strong>`,
    `Lệch trạng thái: <strong>${summary.statusDiverged}</strong>`,
  ];
  if (kind === 'product') {
    lines.push(`Lệch tồn kho: <strong>${summary.stockDiverged}</strong>`);
    lines.push(
      `Đang hiện sai trên web: <strong>${summary.showingWronglyOnWeb}</strong>`,
    );
  }
  lines.push(
    `Nhanh không trả về: <strong>${summary.notReturnedByNhanh}</strong>`,
  );
  lines.push(`Tỷ lệ lệch: <strong>${summary.divergenceRatePercent}%</strong>`);

  return alertBox(
    clean ? 'ok' : 'warn',
    `${lines.join(' &middot; ')}
     <div style="margin-top:10px;font-size:13px;">
       Đây là <strong>mẫu</strong>, không phải kiểm toán toàn bộ — quét hết cần vài trăm lần gọi Nhanh nên không đặt trong một request web.
       ${
         clean
           ? 'Mẫu sạch, nhưng vẫn nên chạy script khi nghi ngờ.'
           : '<strong>Tỷ lệ khác 0 nghĩa là cần chạy script local để có con số thật và để sửa hàng loạt.</strong>'
       }
     </div>`,
  );
}

const BULK_FIX_NOTE = alertBox(
  'info',
  `<strong>Muốn đồng bộ hoặc sửa hàng loạt thì phải chạy script ở máy local.</strong>
   <div style="margin-top:8px;font-size:13px;line-height:1.7;">
     Trang này cố ý <strong>không có nút sửa hàng loạt</strong>. Sửa hàng loạt cần sao lưu trước khi ghi, nhật ký từng dòng,
     bước canary vài bản ghi, và đường khôi phục — những thứ một request HTTP không làm tử tế được.
     Script kèm đầy đủ các bước đó nằm ở <code>.local/nhanh-migration/</code>:
     <code>reconcile-dryrun.js</code> để đo, <code>fix-product-status.js</code> / <code>fix-order-status.js</code> để sửa,
     <code>rollback-from-backup.js</code> để quay lại.
     Ở đây chỉ sửa được <strong>từng mục một</strong>, qua trang xác nhận.
   </div>`,
);

function productRowsTable(rows: ProductRow[]): string {
  const bad = rows.filter(
    (r) => r.comparison.statusDiverged || r.comparison.stockDiverged,
  );
  if (bad.length === 0)
    return '<p style="color:#155724;">Không có mục nào lệch trong mẫu này.</p>';

  const body = bad
    .slice(0, 200)
    .map(
      (r) => `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee;"><code>${esc(r.code)}</code><br><span style="color:#6c757d;font-size:12px;">${esc(r.name)}</span></td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${esc(pStatus(r.comparison.dbStatus))}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${esc(pStatus(r.comparison.nhanhStatus))}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${r.comparison.dbAvailable ?? '—'}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${r.comparison.stockComparable ? (r.comparison.nhanhAvailable ?? '—') : '—'}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${r.comparison.showingWronglyOnWeb ? '<span style="color:#721c24;">hiện sai trên web</span>' : ''}</td>
    </tr>`,
    )
    .join('');

  return `<table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px;">
    <thead><tr style="background:#f8f9fa;">
      <th style="padding:8px;text-align:left;border-bottom:2px solid #dee2e6;">Sản phẩm</th>
      <th style="padding:8px;text-align:left;border-bottom:2px solid #dee2e6;">Trạng thái web</th>
      <th style="padding:8px;text-align:left;border-bottom:2px solid #dee2e6;">Trạng thái Nhanh</th>
      <th style="padding:8px;text-align:right;border-bottom:2px solid #dee2e6;">Tồn web</th>
      <th style="padding:8px;text-align:right;border-bottom:2px solid #dee2e6;">Tồn Nhanh</th>
      <th style="padding:8px;text-align:left;border-bottom:2px solid #dee2e6;"></th>
    </tr></thead><tbody>${body}</tbody></table>
    ${bad.length > 200 ? `<p style="color:#6c757d;font-size:13px;">Hiển thị 200/${bad.length} mục lệch.</p>` : ''}`;
}

function orderRowsTable(rows: OrderRow[]): string {
  const bad = rows.filter((r) => r.comparison.diverged);
  if (bad.length === 0)
    return '<p style="color:#155724;">Không có đơn nào lệch trong mẫu này.</p>';

  const body = bad
    .slice(0, 200)
    .map(
      (r) => `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee;"><code>${esc(r.orderNumber)}</code></td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${esc(r.createdAt ? r.createdAt.toISOString().slice(0, 10) : '—')}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${money(r.total)} đ</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${esc(r.comparison.dbStatus)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${esc(r.comparison.shouldBe)} <span style="color:#6c757d;font-size:12px;">(${esc(r.comparison.nhanhStatusLabel)})</span></td>
    </tr>`,
    )
    .join('');

  return `<table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px;">
    <thead><tr style="background:#f8f9fa;">
      <th style="padding:8px;text-align:left;border-bottom:2px solid #dee2e6;">Đơn</th>
      <th style="padding:8px;text-align:left;border-bottom:2px solid #dee2e6;">Ngày</th>
      <th style="padding:8px;text-align:right;border-bottom:2px solid #dee2e6;">Giá trị</th>
      <th style="padding:8px;text-align:left;border-bottom:2px solid #dee2e6;">Web</th>
      <th style="padding:8px;text-align:left;border-bottom:2px solid #dee2e6;">Nên là</th>
    </tr></thead><tbody>${body}</tbody></table>
    ${bad.length > 200 ? `<p style="color:#6c757d;font-size:13px;">Hiển thị 200/${bad.length} đơn lệch.</p>` : ''}`;
}

function productDetail(row: ProductRow): string {
  const c = row.comparison;
  const notes = c.notes.length
    ? alertBox('info', c.notes.map((n) => esc(n)).join('<br>'))
    : '';

  const fixForm =
    c.statusDiverged && c.dbStatus !== null && c.nhanhStatus !== null
      ? `<form method="post" style="margin-top:12px;">
           <input type="hidden" name="action" value="confirm_fix_product">
           <input type="hidden" name="id" value="${esc(row.id)}">
           <input type="hidden" name="from" value="${c.dbStatus}">
           <input type="hidden" name="to" value="${c.nhanhStatus}">
           <input type="hidden" name="code" value="${esc(row.code)}">
           <button type="submit" style="padding:8px 16px;border:0;border-radius:4px;background:#dc3545;color:#fff;font-size:14px;cursor:pointer;">
             Sửa trạng thái web cho khớp Nhanh
           </button>
         </form>`
      : '';

  return `<h2 style="font-size:17px;margin-top:28px;">${esc(row.code)}</h2>
  <p style="color:#6c757d;margin-top:0;">${esc(row.name)}</p>
  <table style="border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:6px 16px 6px 0;color:#6c757d;">Trạng thái web</td><td style="padding:6px 0;">${esc(pStatus(c.dbStatus))}</td></tr>
    <tr><td style="padding:6px 16px 6px 0;color:#6c757d;">Trạng thái Nhanh</td><td style="padding:6px 0;">${esc(pStatus(c.nhanhStatus))}</td></tr>
    <tr><td style="padding:6px 16px 6px 0;color:#6c757d;">Tồn web</td><td style="padding:6px 0;">${c.dbAvailable ?? '—'}</td></tr>
    <tr><td style="padding:6px 16px 6px 0;color:#6c757d;">Tồn Nhanh</td><td style="padding:6px 0;">${c.stockComparable ? (c.nhanhAvailable ?? '—') : 'không so được'}</td></tr>
  </table>
  ${
    c.statusDiverged
      ? alertBox('warn', 'Trạng thái hai bên đang lệch.')
      : alertBox('ok', 'Trạng thái hai bên khớp nhau.')
  }
  ${c.stockDiverged ? alertBox('warn', 'Tồn kho hai bên đang lệch.') : ''}
  ${notes}${fixForm}`;
}

function orderDetail(row: OrderRow): string {
  const c = row.comparison;
  const notes = c.notes.length
    ? alertBox('info', c.notes.map((n) => esc(n)).join('<br>'))
    : '';

  const fixForm =
    c.diverged && c.dbStatus && c.shouldBe
      ? `<form method="post" style="margin-top:12px;">
           <input type="hidden" name="action" value="confirm_fix_order">
           <input type="hidden" name="id" value="${esc(row.id)}">
           <input type="hidden" name="from" value="${esc(c.dbStatus)}">
           <input type="hidden" name="to" value="${esc(c.shouldBe)}">
           <input type="hidden" name="orderNumber" value="${esc(row.orderNumber)}">
           <button type="submit" style="padding:8px 16px;border:0;border-radius:4px;background:#dc3545;color:#fff;font-size:14px;cursor:pointer;">
             Sửa trạng thái đơn cho khớp Nhanh
           </button>
         </form>`
      : '';

  return `<h2 style="font-size:17px;margin-top:28px;">${esc(row.orderNumber)}</h2>
  <table style="border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:6px 16px 6px 0;color:#6c757d;">Giá trị</td><td style="padding:6px 0;">${money(row.total)} đ</td></tr>
    <tr><td style="padding:6px 16px 6px 0;color:#6c757d;">Trạng thái web</td><td style="padding:6px 0;">${esc(c.dbStatus)}</td></tr>
    <tr><td style="padding:6px 16px 6px 0;color:#6c757d;">Trạng thái Nhanh</td><td style="padding:6px 0;">${esc(c.nhanhStatus)} — ${esc(c.nhanhStatusLabel)}</td></tr>
    <tr><td style="padding:6px 16px 6px 0;color:#6c757d;">Nên là</td><td style="padding:6px 0;">${esc(c.shouldBe)}</td></tr>
  </table>
  ${
    c.diverged
      ? alertBox('warn', 'Trạng thái hai bên đang lệch.')
      : alertBox('ok', 'Trạng thái hai bên khớp nhau.')
  }
  ${notes}${fixForm}`;
}

function confirmPage(opts: {
  action: string;
  id: string;
  from: string;
  to: string;
  label: string;
  what: string;
  warning: string;
}): string {
  return `${PAGE_HEAD}
<h1 style="font-size:22px;">Xác nhận sửa</h1>
${alertBox(
  'warn',
  `Sắp đổi trạng thái ${esc(opts.what)} <strong>${esc(opts.label)}</strong>
   từ <strong>${esc(opts.from)}</strong> sang <strong>${esc(opts.to)}</strong>.<br><br>
   ${opts.warning}`,
)}
<form method="post" style="display:flex;gap:8px;">
  <input type="hidden" name="action" value="${esc(opts.action)}">
  <input type="hidden" name="id" value="${esc(opts.id)}">
  <input type="hidden" name="from" value="${esc(opts.from)}">
  <input type="hidden" name="to" value="${esc(opts.to)}">
  <button type="submit" style="padding:8px 16px;border:0;border-radius:4px;background:#dc3545;color:#fff;font-size:14px;cursor:pointer;">Xác nhận sửa</button>
  <a href="/admin/nhanh-reconcile" style="padding:8px 16px;border-radius:4px;background:#6c757d;color:#fff;font-size:14px;text-decoration:none;">Huỷ</a>
</form>
${PAGE_FOOT}`;
}

/**
 * Serves `/admin/nhanh-reconcile` behind the same Basic Auth as the other admin
 * pages.
 *
 * Batch mode is strictly read-only. Single-item repair writes one status field
 * on one document, guarded by the value shown on screen, behind a confirmation
 * step — the same shape as `/admin/sync-retry`.
 */
@Injectable()
export class AdminNhanhReconcileSetupService {
  private readonly logger = new Logger(AdminNhanhReconcileSetupService.name);

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly reconcile: NhanhReconcileService,
  ) {}

  setupAdminNhanhReconcile(app: INestApplication) {
    const expressApp = app.getHttpAdapter().getInstance();

    const username =
      this.configService.get('app.adminUsername', { infer: true }) ?? 'admin';
    const password =
      this.configService.get('app.adminPassword', { infer: true }) ??
      'admin123';

    expressApp.use(
      '/admin/nhanh-reconcile',
      express.urlencoded({ extended: true }),
    );
    expressApp.use(
      '/admin/nhanh-reconcile',
      basicAuth({
        users: { [username]: password },
        challenge: true,
        realm: 'Admin Nhanh Reconcile',
      }),
    );

    const shell = (inner: string) =>
      `${PAGE_HEAD}
       <h1 style="font-size:24px;margin-bottom:4px;">Đối soát Nhanh.vn</h1>
       <p style="color:#6c757d;font-size:13px;margin-top:0;">So dữ liệu website với Nhanh.vn. Đối soát theo lô chỉ đọc; sửa chỉ được từng mục một.</p>
       ${BULK_FIX_NOTE}${inner}${PAGE_FOOT}`;

    expressApp.get('/admin/nhanh-reconcile', (_req: any, res: any) => {
      res.type('html').send(shell(forms({})));
    });

    expressApp.post('/admin/nhanh-reconcile', async (req: any, res: any) => {
      const action = String(req.body?.action ?? '');
      const send = (inner: string) => res.type('html').send(shell(inner));

      try {
        switch (action) {
          case 'lookup_product': {
            const code = String(req.body?.code ?? '').trim();
            if (!code)
              return send(alertBox('err', 'Nhập mã sản phẩm.') + forms({}));
            const row = await this.reconcile.lookupProduct(code);
            return send(
              (row
                ? productDetail(row)
                : alertBox('err', `Không tìm thấy sản phẩm: ${esc(code)}`)) +
                forms({ code }),
            );
          }

          case 'lookup_order': {
            const orderNumber = String(req.body?.orderNumber ?? '').trim();
            if (!orderNumber)
              return send(alertBox('err', 'Nhập mã đơn hàng.') + forms({}));
            const row = await this.reconcile.lookupOrder(orderNumber);
            return send(
              (row
                ? orderDetail(row)
                : alertBox('err', `Không tìm thấy đơn: ${esc(orderNumber)}`)) +
                forms({ orderNumber }),
            );
          }

          case 'sample_products': {
            const limit = Number(req.body?.limit) || DEFAULT_SAMPLE;
            const { rows, summary } =
              await this.reconcile.sampleProducts(limit);
            return send(
              `<h2 style="font-size:17px;margin-top:28px;">Mẫu sản phẩm</h2>` +
                summaryBox(summary, 'product') +
                productRowsTable(rows) +
                forms({ limit }),
            );
          }

          case 'sample_orders': {
            const limit = Number(req.body?.limit) || DEFAULT_SAMPLE;
            const { rows, summary } = await this.reconcile.sampleOrders(limit);
            return send(
              `<h2 style="font-size:17px;margin-top:28px;">Mẫu đơn hàng</h2>` +
                summaryBox(summary, 'order') +
                orderRowsTable(rows) +
                forms({ limit }),
            );
          }

          case 'confirm_fix_product':
            return res.type('html').send(
              confirmPage({
                action: 'apply_fix_product',
                id: String(req.body?.id ?? ''),
                from: String(req.body?.from ?? ''),
                to: String(req.body?.to ?? ''),
                label: String(req.body?.code ?? ''),
                what: 'sản phẩm',
                warning:
                  'Nếu đây là sản phẩm độc lập hoặc sản phẩm cha bị hạ khỏi trạng thái Đang bán, nó sẽ <strong>biến mất khỏi website</strong>. Với biến thể, cần chạy thêm job <code>nhanh_product_embed_sync</code> thì bản nhúng trên sản phẩm cha mới đổi theo.',
              }),
            );

          case 'confirm_fix_order':
            return res.type('html').send(
              confirmPage({
                action: 'apply_fix_order',
                id: String(req.body?.id ?? ''),
                from: String(req.body?.from ?? ''),
                to: String(req.body?.to ?? ''),
                label: String(req.body?.orderNumber ?? ''),
                what: 'đơn hàng',
                warning:
                  'Chỉ đổi trạng thái đơn. <strong>Không</strong> đẩy CDP và <strong>không</strong> đụng hoa hồng affiliate — nếu cần thì dùng script local.',
              }),
            );

          case 'apply_fix_product': {
            const out = await this.reconcile.fixProductStatus(
              String(req.body?.id ?? ''),
              Number(req.body?.from),
              Number(req.body?.to),
            );
            return send(
              alertBox(out.applied ? 'ok' : 'err', esc(out.reason)) + forms({}),
            );
          }

          case 'apply_fix_order': {
            const out = await this.reconcile.fixOrderStatus(
              String(req.body?.id ?? ''),
              String(req.body?.from ?? ''),
              String(req.body?.to ?? ''),
            );
            return send(
              alertBox(out.applied ? 'ok' : 'err', esc(out.reason)) + forms({}),
            );
          }

          default:
            return send(alertBox('err', 'Hành động không hợp lệ.') + forms({}));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Nhanh reconcile action "${action}" failed: ${message}`,
        );
        return send(alertBox('err', esc(message)) + forms({}));
      }
    });

    this.logger.log(
      'Admin Nhanh reconcile page mounted at /admin/nhanh-reconcile',
    );
  }
}

@Module({
  imports: [
    ConfigModule,
    NhanhModule,
    ProductDocumentModule,
    OrderDocumentModule,
  ],
  providers: [NhanhReconcileService, AdminNhanhReconcileSetupService],
  exports: [AdminNhanhReconcileSetupService],
})
export class AdminNhanhReconcileModule {}
