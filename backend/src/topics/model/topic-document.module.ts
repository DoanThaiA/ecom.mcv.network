import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TopicSchemaClass, TopicSchema } from './topic.schema';
import { TopicRepository } from '../domain/topic.repository';
import { TopicDocumentRepository } from './topic.repository';

/**
 * Mongoose document module for Topic entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TopicSchemaClass.name, schema: TopicSchema },
    ]),
  ],
  providers: [
    {
      provide: TopicRepository,
      useClass: TopicDocumentRepository,
    },
  ],
  exports: [TopicRepository, MongooseModule],
})
export class TopicDocumentModule {}
