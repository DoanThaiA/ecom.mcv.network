/**
 * Migration: Convert withdrawal_requests.status from string to number enum
 * Old values: 'pending' | 'approved' | 'paid' | 'rejected'
 * New values: 1 | 2 | 3 | 4
 * Run with: npx ts-node -r tsconfig-paths/register src/database/migrations/migrate-withdrawal-request-status.ts
 */
import { NestFactory } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  WithdrawalRequestSchemaClass,
  WithdrawalRequestSchema,
} from '../../withdrawal-requests/model/withdrawal-request.schema';
import { WithdrawalRequestStatus } from '../../withdrawal-requests/domain/withdrawal-request';
import databaseConfig from '../config/database.config';
import appConfig from '../../config/app.config';
import { MongooseConfigService } from '../mongoose-config.service';

const STRING_TO_NUMBER: Record<string, WithdrawalRequestStatus> = {
  pending: WithdrawalRequestStatus.pending,
  approved: WithdrawalRequestStatus.approved,
  paid: WithdrawalRequestStatus.paid,
  rejected: WithdrawalRequestStatus.rejected,
};

class MigrationService {
  constructor(
    @InjectModel(WithdrawalRequestSchemaClass.name)
    private readonly model: Model<WithdrawalRequestSchemaClass>,
  ) {}

  async run() {
    console.log(
      'Starting migration: withdrawal_requests.status string -> number\n',
    );

    for (const [strVal, numVal] of Object.entries(STRING_TO_NUMBER)) {
      const result = await this.model.updateMany(
        { status: strVal as any },
        { $set: { status: numVal } },
      );
      if (result.modifiedCount > 0) {
        console.log(
          `  "${strVal}" -> ${numVal}: updated ${result.modifiedCount} documents`,
        );
      }
    }

    console.log('\nMigration complete!');
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env'],
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    MongooseModule.forFeature([
      {
        name: WithdrawalRequestSchemaClass.name,
        schema: WithdrawalRequestSchema,
      },
    ]),
  ],
  providers: [MigrationService],
})
class MigrationModule {}

const runMigration = async () => {
  const app = await NestFactory.create(MigrationModule);
  await app.get(MigrationService).run();
  await app.close();
};

void runMigration();
