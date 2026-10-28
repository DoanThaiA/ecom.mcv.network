import 'dotenv/config';
import { ClassSerializerInterceptor, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { AllConfigType } from './config/config.type';
import { ResolvePromisesInterceptor } from './utils/serializer.interceptor';
import { i18nValidationPipe } from './utils/validation/i18n-validation-pipe';
import { AllExceptionsFilter } from './utils/errors/exception-filter';
import { AuditLogInterceptor } from './audit-log/interceptors/audit-log.interceptor';
import { env } from './utils/env';
import { BullBoardService } from './bull-board/bull-board.module';
import { AdminConfigSetupService } from './admin-config/admin-config.module';
import { AdminSyncRetrySetupService } from './admin-sync-retry/admin-sync-retry.module';
import { AdminWebhookHealthSetupService } from './admin-webhook-health/admin-webhook-health.module';
import { AdminNhanhReconcileSetupService } from './admin-nhanh-reconcile/admin-nhanh-reconcile.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    rawBody: true,
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);

  // Increase body size limit for large webhook payloads (e.g., Nhanh.vn)
  app.useBodyParser('json', { limit: '5mb' });
  app.useBodyParser('urlencoded', { limit: '5mb', extended: true });

  // Configure WebSocket adapter for Socket.io
  app.useWebSocketAdapter(new IoAdapter(app));

  // Enable cookie parsing (used for affiliate tracking aff_code cookie)
  app.use(cookieParser());

  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(i18nValidationPipe);
  app.useGlobalFilters(new AllExceptionsFilter());
  // Get AuditLogInterceptor from DI container (needs dependencies injected)
  const auditLogInterceptor = app.get(AuditLogInterceptor);

  app.useGlobalInterceptors(
    // AuditLogInterceptor for audit trail logging via @AuditLog decorator
    auditLogInterceptor,
    // ResolvePromisesInterceptor is used to resolve promises in responses because class-transformer can't do it
    // https://github.com/typestack/class-transformer/issues/549
    new ResolvePromisesInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .addGlobalParameters({
      in: 'header',
      required: false,
      name: env.APP_HEADER_LANGUAGE,
      schema: {
        example: 'en',
      },
    })
    // Define tag order for logical grouping
    .addTag('Auth - Email', 'Email-based authentication')
    .addTag('Auth - Phone', 'Phone-based authentication')
    .addTag('Auth - Social', 'Social login (Google, Facebook, Zalo)')
    .addTag('Auth - Profile', 'User profile and session management')
    .addTag('CMS Auth', 'CMS admin authentication')
    .addTag('CMS Users', 'CMS user management')
    .addTag('Files', 'File uploads')
    .addTag('Products', 'Product management (CMS)')
    .addTag('Product Categories', 'Product category management')
    .addTag('Product Brands', 'Product brand management')
    .addTag('Product Inventories', 'Product inventory management')
    .addTag('Depots', 'Depot/warehouse management')
    .addTag('Combos', 'Product combo management (CMS)')
    .addTag('Flash Sales', 'Flash sale campaigns (CMS)')
    .addTag('Topics', 'Marketing topics/collections (CMS)')
    .addTag('Menus', 'Navigation menu management (CMS)')
    .addTag('Orders', 'Order management (CMS)')
    .addTag('Jobs', 'Background job management')
    .addTag('Nhanh.vn', 'Nhanh.vn integration')
    .addTag('Zalo OA', 'Zalo Official Account integration')
    .addTag('Zalo ZNS', 'Zalo Notification Service')
    .addTag('Shop - Products', 'Shop product browsing')
    .addTag('Shop - Cart', 'Shopping cart operations')
    .addTag('Shop - Orders', 'Shop order operations')
    .addTag('Shop - Combos', 'Shop combo browsing')
    .addTag('Shop - Topics', 'Shop topic browsing')
    .addTag('Shop - Menus', 'Shop navigation menus')
    .addTag('Shop - Shipping', 'Shipping locations')
    .addTag('Shop - Reviews', 'Shop review operations')
    .addTag('Shop - Returns', 'Shop return operations')
    .addTag('CMS - Reviews', 'CMS review management')
    .addTag('CMS - Returns', 'CMS return management')
    .addTag('CMS - Promotions', 'CMS promotion management')
    .addTag('CMS - Color Variants', 'CMS color variant management')
    .addTag('Shop - Color Variants', 'Shop color variant browsing')
    .addTag('Users', 'User management')
    .addTag('Audit Logs', 'System audit logs')
    .addTag('Home', 'App info and health check')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  // Setup Bull Board for job queue monitoring (dev/owner only)
  const bullBoardService = app.get(BullBoardService);
  bullBoardService.setupBullBoard(app);

  // Setup Admin Config page
  const adminConfigSetupService = app.get(AdminConfigSetupService);
  adminConfigSetupService.setupAdminConfig(app);

  // Setup Admin Sync Retry page
  const adminSyncRetrySetupService = app.get(AdminSyncRetrySetupService);
  adminSyncRetrySetupService.setupAdminSyncRetry(app);

  // Setup Admin Webhook Health page
  const adminWebhookHealthSetupService = app.get(
    AdminWebhookHealthSetupService,
  );
  adminWebhookHealthSetupService.setupAdminWebhookHealth(app);

  // Setup Admin Nhanh Reconcile page
  const adminNhanhReconcileSetupService = app.get(
    AdminNhanhReconcileSetupService,
  );
  adminNhanhReconcileSetupService.setupAdminNhanhReconcile(app);

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}
void bootstrap();
