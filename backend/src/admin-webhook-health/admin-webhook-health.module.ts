import { Module, Injectable, INestApplication, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import basicAuth from 'express-basic-auth';
import { AllConfigType } from '../config/config.type';
import { WebhookHealthModule } from '../webhook-health/webhook-health.module';
import { WebhookHealthRepository } from '../webhook-health/webhook-health.repository';
import {
  buildRows,
  overallVerdict,
  HealthLevel,
  HealthRow,
} from './webhook-health.view-model';

/** Escape HTML special characters to prevent XSS. */
function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const LEVEL_STYLE: Record<
  HealthLevel,
  { bg: string; fg: string; label: string }
> = {
  ok: { bg: '#d4edda', fg: '#155724', label: 'Bình thường' },
  warn: { bg: '#fff3cd', fg: '#856404', label: 'Im lâu bất thường' },
  stale: { bg: '#f8d7da', fg: '#721c24', label: 'Đã ngừng nhận' },
  never: { bg: '#e2e3e5', fg: '#383d41', label: 'Chưa từng nhận' },
};

function badge(level: HealthLevel): string {
  const s = LEVEL_STYLE[level];
  return `<span style="padding:2px 8px;border-radius:4px;font-size:13px;background:${s.bg};color:${s.fg};white-space:nowrap;">${escapeHtml(s.label)}</span>`;
}

function renderRow(row: HealthRow): string {
  const invalid =
    row.invalidCount > 0
      ? `<div style="color:#721c24;font-size:12px;margin-top:4px;">
           ${row.invalidCount} payload không qua validate${
             row.lastInvalidReason
               ? ` — <code>${escapeHtml(row.lastInvalidReason)}</code>`
               : ''
           }
         </div>`
      : '';

  return `<tr>
    <td style="padding:10px 8px;border-bottom:1px solid #eee;">
      <code>${escapeHtml(row.event)}</code>${invalid}
    </td>
    <td style="padding:10px 8px;border-bottom:1px solid #eee;">${badge(row.level)}</td>
    <td style="padding:10px 8px;border-bottom:1px solid #eee;">${escapeHtml(row.lastSeenText)}</td>
    <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${row.last24h.toLocaleString('vi-VN')}</td>
    <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${row.last7d.toLocaleString('vi-VN')}</td>
    <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${row.totalCount.toLocaleString('vi-VN')}</td>
  </tr>`;
}

function renderPage(rows: HealthRow[], now: Date): string {
  const verdict = overallVerdict(rows);
  const s = LEVEL_STYLE[verdict.level];
  const businessIds = [
    ...new Set(rows.map((r) => r.lastBusinessId).filter(Boolean)),
  ];

  return `<!DOCTYPE html><html lang="vi"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Webhook Health</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:1000px;margin:40px auto;padding:0 20px;color:#212529;">

<h1 style="font-size:24px;margin-bottom:4px;">Tình trạng Webhook</h1>
<p style="color:#6c757d;font-size:13px;margin-top:0;">
  Ghi nhận mỗi webhook nhận được từ Nhanh.vn. Trang này chỉ đọc, không sửa gì.
</p>

<div style="background:${s.bg};color:${s.fg};padding:14px 16px;border-radius:6px;margin:20px 0;">
  <strong>${escapeHtml(s.label)}</strong><br>
  ${escapeHtml(verdict.message)}
</div>

<table style="width:100%;border-collapse:collapse;font-size:14px;">
  <thead><tr style="background:#f8f9fa;">
    <th style="padding:10px 8px;text-align:left;border-bottom:2px solid #dee2e6;">Sự kiện</th>
    <th style="padding:10px 8px;text-align:left;border-bottom:2px solid #dee2e6;">Trạng thái</th>
    <th style="padding:10px 8px;text-align:left;border-bottom:2px solid #dee2e6;">Nhận gần nhất</th>
    <th style="padding:10px 8px;text-align:right;border-bottom:2px solid #dee2e6;">24h</th>
    <th style="padding:10px 8px;text-align:right;border-bottom:2px solid #dee2e6;">7 ngày</th>
    <th style="padding:10px 8px;text-align:right;border-bottom:2px solid #dee2e6;">Tổng</th>
  </tr></thead>
  <tbody>${rows.map(renderRow).join('')}</tbody>
</table>

<div style="margin-top:24px;padding:14px 16px;background:#f8f9fa;border-radius:6px;font-size:13px;color:#495057;">
  <strong>Đọc trang này thế nào</strong>
  <ul style="margin:8px 0 0;padding-left:20px;line-height:1.7;">
    <li><strong>Đã ngừng nhận</strong> — Nhanh không gửi nữa. Nhiều khả năng webhook đã bị tắt phía Nhanh; kiểm tra tại <code>open.nhanh.vn/apps</code>.</li>
    <li><strong>Chưa từng nhận</strong> — chưa từng có payload nào. Nếu tính năng vừa triển khai thì chờ vài phút; nếu không, sự kiện đó chưa được tick khi cấu hình app.</li>
    <li><strong>payload không qua validate</strong> — Nhanh có gửi nhưng mình không hiểu cấu trúc. Vẫn trả HTTP 200 (cố ý, để Nhanh không tắt webhook), nhưng dữ liệu bị bỏ qua.</li>
    <li>Bộ đếm chỉ tính từ lúc tính năng này được triển khai, không có dữ liệu quá khứ.</li>
  </ul>
</div>

<p style="color:#6c757d;font-size:12px;margin-top:16px;">
  businessId gần nhất: ${businessIds.length ? escapeHtml(businessIds.join(', ')) : '(chưa có)'} &middot;
  Thời điểm xem: ${escapeHtml(now.toISOString())}
</p>

<hr style="margin-top:32px;">
<p style="color:#999;font-size:12px;">
  <a href="/admin/sync-retry" style="color:#007bff;">Sync Retry</a> &middot;
  <a href="/admin/queues" style="color:#007bff;">Bull Board</a> &middot;
  <a href="/admin/config" style="color:#007bff;">Admin Config</a>
</p>
</body></html>`;
}

/**
 * Serves `/admin/webhook-health` behind the same Basic Auth as the other admin
 * pages. Read-only by design: it renders counters and never mutates business
 * data. The one write it performs is pruning its own per-day counters, which
 * touches nothing outside the `webhook_health` collection.
 */
@Injectable()
export class AdminWebhookHealthSetupService {
  private readonly logger = new Logger(AdminWebhookHealthSetupService.name);

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly webhookHealthRepository: WebhookHealthRepository,
  ) {}

  setupAdminWebhookHealth(app: INestApplication) {
    const expressApp = app.getHttpAdapter().getInstance();

    const username =
      this.configService.get('app.adminUsername', { infer: true }) ?? 'admin';
    const password =
      this.configService.get('app.adminPassword', { infer: true }) ??
      'admin123';

    expressApp.use(
      '/admin/webhook-health',
      basicAuth({
        users: { [username]: password },
        challenge: true,
        realm: 'Admin Webhook Health',
      }),
    );

    expressApp.get('/admin/webhook-health', async (_req: any, res: any) => {
      try {
        // Best-effort housekeeping of our own counters; never blocks the page.
        await this.webhookHealthRepository.prune().catch(() => undefined);

        const records = await this.webhookHealthRepository.findAll();
        const now = new Date();
        res.type('html').send(renderPage(buildRows(records as any, now), now));
      } catch (error) {
        this.logger.error(
          `Failed to render webhook health page: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        res
          .status(500)
          .type('html')
          .send(
            `<!DOCTYPE html><html lang="vi"><body style="font-family:sans-serif;max-width:700px;margin:40px auto;">
             <h1>Webhook Health</h1>
             <p style="color:#721c24;">Không đọc được dữ liệu. Xem log server để biết chi tiết.</p>
             </body></html>`,
          );
      }
    });

    this.logger.log(
      'Admin webhook health page mounted at /admin/webhook-health',
    );
  }
}

@Module({
  imports: [ConfigModule, WebhookHealthModule],
  providers: [AdminWebhookHealthSetupService],
  exports: [AdminWebhookHealthSetupService],
})
export class AdminWebhookHealthModule {}
