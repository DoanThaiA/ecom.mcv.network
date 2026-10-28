import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewSchemaClass, ReviewSchema } from './review.schema';
import { ReviewRepositoryImpl } from './review.repository';
import { ReviewRepository } from '../domain/review.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReviewSchemaClass.name, schema: ReviewSchema },
    ]),
  ],
  providers: [
    {
      provide: ReviewRepository,
      useClass: ReviewRepositoryImpl,
    },
  ],
  exports: [ReviewRepository],
})
export class ReviewDocumentModule {}
