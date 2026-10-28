import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ZaloUserAuthService } from './zalo-user-auth.service';
import { ConfigModule } from '@nestjs/config';
import { ZaloUserAuthController } from './zalo-user-auth.controller';
import { AuthModule } from '../../auth/auth.module';
import {
  OAuthStateSchemaClass,
  OAuthStateSchema,
} from '../../social/model/oauth-state.schema';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    MongooseModule.forFeature([
      {
        name: OAuthStateSchemaClass.name,
        schema: OAuthStateSchema,
      },
    ]),
  ],
  providers: [ZaloUserAuthService],
  exports: [ZaloUserAuthService],
  controllers: [ZaloUserAuthController],
})
export class ZaloUserAuthModule {}
