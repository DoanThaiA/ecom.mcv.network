import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuSchemaClass, MenuSchema } from './menu.schema';
import { MenuRepository } from '../domain/menu.repository';
import { MenuDocumentRepository } from './menu.repository';

/**
 * Mongoose document module for Menu entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuSchemaClass.name, schema: MenuSchema },
    ]),
  ],
  providers: [
    {
      provide: MenuRepository,
      useClass: MenuDocumentRepository,
    },
  ],
  exports: [MenuRepository, MongooseModule],
})
export class MenuDocumentModule {}
