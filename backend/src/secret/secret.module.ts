import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SecretSchema, SecretSchemaClass } from './secret.schema';
import { SecretRepository } from './secret.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SecretSchemaClass.name,
        schema: SecretSchema,
      },
    ]),
  ],
  providers: [SecretRepository],
  exports: [SecretRepository],
})
export class SecretModule {}
