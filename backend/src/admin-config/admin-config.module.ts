import { Module, Injectable, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import basicAuth from 'express-basic-auth';
import express from 'express';
import {
  AdminConfigService,
  ADMIN_CONFIG_FIELDS,
} from './admin-config.service';
import { AdminConfigRepository } from './admin-config.repository';
import {
  AdminConfigSchema,
  AdminConfigSchemaClass,
} from './admin-config.schema';
import { AllConfigType } from '../config/config.type';

/**
 * Render the admin config HTML page
 */
function renderConfigPage(
  configs: Record<string, string>,
  saved?: boolean,
  error?: string,
): string {
  const configRows = ADMIN_CONFIG_FIELDS.map(
    (field) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${field.label}</td>
      <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace; word-break: break-all;">
        ${configs[field.key] ? escapeHtml(configs[field.key]) : '<span style="color: #999;">Not set</span>'}
      </td>
    </tr>`,
  ).join('');

  const fields = ADMIN_CONFIG_FIELDS.map(
    (field) => `
    <div style="margin-bottom: 16px;">
      <label for="${field.key}" style="display: block; font-weight: bold; margin-bottom: 4px;">
        ${field.label}
      </label>
      <p style="margin: 0 0 4px; color: #666; font-size: 13px;">${field.description}</p>
      <input type="text" id="${field.key}" name="${field.key}" value="${escapeHtml(configs[field.key] || '')}"
        style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;" />
    </div>`,
  ).join('');

  const successMsg = saved
    ? '<div style="color: green; margin-bottom: 16px; padding: 8px; background: #e8f5e9; border-radius: 4px;">Configuration saved successfully.</div>'
    : '';

  const errorMsg = error
    ? `<div style="color: #721c24; margin-bottom: 16px; padding: 8px; background: #f8d7da; border-radius: 4px;">Error saving configuration: ${escapeHtml(error)}</div>`
    : '';

  return `<!DOCTYPE html>
<html><head><title>Admin Config</title></head>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px;">
  <h1 style="color: #333;">Admin Configuration</h1>
  ${successMsg}${errorMsg}
  <h2 style="color: #555; font-size: 16px;">Current Values</h2>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <thead>
      <tr style="background: #f5f5f5;">
        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Setting</th>
        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Value</th>
      </tr>
    </thead>
    <tbody>${configRows}</tbody>
  </table>
  <h2 style="color: #555; font-size: 16px;">Edit Configuration</h2>
  <form method="POST" action="/admin/config">
    ${fields}
    <button type="submit" style="padding: 10px 24px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
      Save
    </button>
  </form>
  <hr style="margin-top: 32px;">
  <p style="color: #999; font-size: 12px;"><a href="/admin/queues" style="color: #007bff;">Bull Board</a></p>
</body></html>`;
}

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

/**
 * Service for setting up admin config Express routes with Basic Auth
 */
@Injectable()
export class AdminConfigSetupService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly adminConfigService: AdminConfigService,
  ) {}

  /**
   * Setup admin config routes on the Express app with Basic Auth
   * Call this from main.ts after NestFactory.create()
   */
  setupAdminConfig(app: INestApplication) {
    const expressApp = app.getHttpAdapter().getInstance();

    const username =
      this.configService.get('app.adminUsername', { infer: true }) ?? 'admin';
    const password =
      this.configService.get('app.adminPassword', { infer: true }) ??
      'admin123';

    // URL-encoded body parser for HTML form submissions
    expressApp.use('/admin/config', express.urlencoded({ extended: true }));

    // Basic Auth middleware
    expressApp.use(
      '/admin/config',
      basicAuth({
        users: { [username]: password },
        challenge: true,
        realm: 'Admin Config',
      }),
    );

    // GET - show config form
    expressApp.get('/admin/config', async (_req: any, res: any) => {
      const configs = await this.adminConfigService.getAll();
      const saved = _req.query.saved === '1';
      res.type('html').send(renderConfigPage(configs, saved));
    });

    // POST - update configs
    expressApp.post('/admin/config', async (req: any, res: any) => {
      try {
        const body = req.body || {};
        for (const field of ADMIN_CONFIG_FIELDS) {
          const value = body[field.key];
          if (typeof value === 'string') {
            await this.adminConfigService.set(field.key, value.trim());
          }
        }
        res.redirect('/admin/config?saved=1');
      } catch (err) {
        const configs = await this.adminConfigService.getAll();
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.type('html').send(renderConfigPage(configs, false, message));
      }
    });
  }
}

/**
 * Admin config module for managing runtime configuration
 * Protected by HTTP Basic Auth (same credentials as Bull Board)
 */
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: AdminConfigSchemaClass.name,
        schema: AdminConfigSchema,
      },
    ]),
  ],
  providers: [
    AdminConfigRepository,
    AdminConfigService,
    AdminConfigSetupService,
  ],
  exports: [AdminConfigService, AdminConfigSetupService],
})
export class AdminConfigModule {}
