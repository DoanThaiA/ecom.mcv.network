import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './database/config/database.config';
import authConfig from './auth/config/auth.config';
import appConfig from './config/app.config';
import mailConfig from './mail/config/mail.config';
import fileConfig from './files/config/file.config';
import facebookConfig from './auth-facebook/config/facebook.config';
import googleConfig from './auth-google/config/google.config';
import zaloConfig from './zalo/config/zalo.config';
import esmsConfig from './sms/esms/config/esms.config';
import nhanhConfig from './nhanh/config/nhanh.config';
import cacheConfig from './cache/config/cache.config';
import cdpConfig from './cdp/config/cdp.config';
import onepayConfig from './payment/onepay/config/onepay.config';
import infocmsConfig from './payment/infocms/config/infocms.config';
import openaiConfig from './ai/config/openai.config';
import telegramConfig from './telegram/config/telegram.config';
import path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthFacebookModule } from './auth-facebook/auth-facebook.module';
import { AuthGoogleModule } from './auth-google/auth-google.module';
import { ZaloUserAuthModule } from './zalo/user-auth/zalo-user-auth.module';
import { ZaloOaAuthModule } from './zalo/oa-auth/zalo-oa-auth.module';
import { ZaloZnsModule } from './zalo/zns/zalo-zns.module';
import { NhanhModule } from './nhanh/nhanh.module';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { MailModule } from './mail/mail.module';
import { SmsModule } from './sms/sms.module';
import { HomeModule } from './home/home.module';
import { AllConfigType } from './config/config.type';
import { SessionModule } from './session/session.module';
import { MailerModule } from './mailer/mailer.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './database/mongoose-config.service';
import { CacheModule } from './cache/cache.module';
import { ProductsModule } from './products/products.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { ProductInventoriesModule } from './product-inventories/product-inventories.module';
import { ProductBrandsModule } from './product-brands/product-brands.module';
import { DepotsModule } from './depots/depots.module';
import { CdpModule } from './cdp/cdp.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { JobsModule } from './jobs/jobs.module';
import { ShopModule } from './shop/shop.module';
import { CombosModule } from './combos/combos.module';
import { FlashSalesModule } from './flash-sales/flash-sales.module';
import { ImportSessionsModule } from './import-sessions/import-sessions.module';
import { TopicsModule } from './topics/topics.module';
import { MenusModule } from './menus/menus.module';
import { ReturnsModule } from './returns/returns.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AddressesModule } from './addresses/addresses.module';
import { OnepayModule } from './payment/onepay/onepay.module';
import { InfocmsModule } from './payment/infocms/infocms.module';
import { PromotionsModule } from './promotions/promotions.module';
import { SocketModule } from './socket/socket.module';
import { BannersModule } from './banners/banners.module';
import { PopupAdsModule } from './popup-ads/popup-ads.module';
import { AiModule } from './ai/ai.module';
import { ProductBannersModule } from './product-banners/product-banners.module';
import { ColorVariantsModule } from './color-variants/color-variants.module';
import { BullBoardModule } from './bull-board/bull-board.module';
import { AdminConfigModule } from './admin-config/admin-config.module';
import { AdminSyncRetryModule } from './admin-sync-retry/admin-sync-retry.module';
import { AdminWebhookHealthModule } from './admin-webhook-health/admin-webhook-health.module';
import { AdminNhanhReconcileModule } from './admin-nhanh-reconcile/admin-nhanh-reconcile.module';
import { ArticlesModule } from './articles/articles.module';
import { AffiliatesModule } from './affiliates/affiliates.module';
import { CommissionSettingsModule } from './commission-settings/commission-settings.module';
import { ProductCommissionsModule } from './product-commissions/product-commissions.module';
import { ShippingSettingsModule } from './shipping-settings/shipping-settings.module';
import { ShippingPromotionsModule } from './shipping-promotions/shipping-promotions.module';
import { PushNotificationsModule } from './push-notifications/push-notifications.module';
import { AffiliateTrackingModule } from './affiliate-tracking/affiliate-tracking.module';
import { AffiliateOrderCommissionsModule } from './affiliate-order-commissions/affiliate-order-commissions.module';
import { WithdrawalRequestsModule } from './withdrawal-requests/withdrawal-requests.module';
import { AffiliatePortalModule } from './affiliate-portal/affiliate-portal.module';
import { ProductViewsModule } from './product-views/product-views.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { TelegramModule } from './telegram/telegram.module';

const infrastructureDatabaseModule = MongooseModule.forRootAsync({
  useClass: MongooseConfigService,
});

@Module({
  imports: [
    // ScheduleModule removed - cron jobs run in worker only
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 60000,
          limit: 10,
        },
        {
          name: 'long',
          ttl: 600000,
          limit: 50,
        },
      ],
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public', 'static'),
      serveRoot: '/',
      exclude: ['/api*'],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig,
        fileConfig,
        facebookConfig,
        googleConfig,
        zaloConfig,
        esmsConfig,
        nhanhConfig,
        cacheConfig,
        cdpConfig,
        onepayConfig,
        infocmsConfig,
        openaiConfig,
        telegramConfig,
      ],
      envFilePath: ['.env'],
    }),
    infrastructureDatabaseModule,
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    CacheModule,
    UsersModule,
    FilesModule,
    AuthModule,
    AuthFacebookModule,
    AuthGoogleModule,
    ZaloUserAuthModule,
    ZaloOaAuthModule,
    ZaloZnsModule,
    NhanhModule,
    SessionModule,
    MailModule,
    SmsModule,
    MailerModule,
    HomeModule,
    ProductsModule,
    ProductCategoriesModule,
    ProductInventoriesModule,
    ProductBrandsModule,
    DepotsModule,
    CdpModule,
    AuditLogModule,
    JobsModule,
    ShopModule,
    CombosModule,
    FlashSalesModule,
    ImportSessionsModule,
    TopicsModule,
    MenusModule,
    ReturnsModule,
    ReviewsModule,
    AddressesModule,
    OnepayModule,
    InfocmsModule,
    PromotionsModule,
    SocketModule,
    BannersModule,
    PopupAdsModule,
    AiModule,
    ProductBannersModule,
    ColorVariantsModule,
    BullBoardModule,
    AdminConfigModule,
    AdminSyncRetryModule,
    AdminWebhookHealthModule,
    AdminNhanhReconcileModule,
    ArticlesModule,
    AffiliatesModule,
    CommissionSettingsModule,
    ProductCommissionsModule,
    ShippingSettingsModule,
    ShippingPromotionsModule,
    PushNotificationsModule,
    AffiliateTrackingModule,
    AffiliateOrderCommissionsModule,
    WithdrawalRequestsModule,
    AffiliatePortalModule,
    ProductViewsModule,
    RecommendationsModule,
    TelegramModule,
  ],
})
export class AppModule {}
