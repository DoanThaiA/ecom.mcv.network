import { Module } from '@nestjs/common';
import { AuthEmailController } from './controllers/auth-email.controller';
import { AuthPhoneController } from './controllers/auth-phone.controller';
import { AuthProfileController } from './controllers/auth-profile.controller';
import { AuthService } from './auth.service';
import { CmsAuthController } from './cms-auth.controller';
import { CmsAuthService } from './cms-auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtCmsStrategy } from './strategies/jwt-cms.strategy';
import { AnonymousStrategy } from './strategies/anonymous.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { MailModule } from '../mail/mail.module';
import { SmsModule } from '../sms/sms.module';
import { ZaloZnsModule } from '../zalo/zns/zalo-zns.module';
import { SessionModule } from '../session/session.module';
import { UsersModule } from '../users/users.module';
import { CmsUsersModule } from '../cms-users/cms-users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpSchemaClass, OtpSchema } from '../sms/model/otp.schema';
import { OtpService } from './services/otp.service';
import { TokenService } from './services/token.service';
import { EmailAuthService } from './services/email-auth.service';
import { PhoneAuthService } from './services/phone-auth.service';
import { SocialAuthService } from './services/social-auth.service';
import { ProfileService } from './services/profile.service';
import { AccountService } from './services/account.service';
import { PhoneLinkService } from './services/phone-link.service';
import { SocialLinkService } from './services/social-link.service';
import { OrderDocumentModule } from '../shop/order/model/order-document.module';

@Module({
  imports: [
    UsersModule,
    CmsUsersModule,
    SessionModule,
    PassportModule,
    MailModule,
    SmsModule,
    ZaloZnsModule,
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: OtpSchemaClass.name, schema: OtpSchema },
    ]),
    OrderDocumentModule,
  ],
  controllers: [
    AuthEmailController,
    AuthPhoneController,
    AuthProfileController,
    CmsAuthController,
  ],
  providers: [
    AuthService,
    CmsAuthService,
    OtpService,
    TokenService,
    EmailAuthService,
    PhoneAuthService,
    SocialAuthService,
    ProfileService,
    AccountService,
    PhoneLinkService,
    SocialLinkService,
    JwtStrategy,
    JwtCmsStrategy,
    JwtRefreshStrategy,
    AnonymousStrategy,
  ],
  exports: [
    AuthService,
    CmsAuthService,
    OtpService,
    TokenService,
    EmailAuthService,
    PhoneAuthService,
    SocialAuthService,
    ProfileService,
    AccountService,
    SocialLinkService,
  ],
})
export class AuthModule {}
