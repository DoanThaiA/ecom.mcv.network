import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { ALL_MODULE_PERMISSIONS } from '../../../cms-users/permissions/module-permission.enum';
import { StatusEnum } from '../../../statuses/statuses.enum';
import { CmsUserSchemaClass } from '../../../cms-users/model/cms-user.schema';

@Injectable()
export class CmsUserSeedService {
  constructor(
    @InjectModel(CmsUserSchemaClass.name)
    private readonly model: Model<CmsUserSchemaClass>,
  ) {}

  async run() {
    const owner = await this.model.findOne({
      email: 'owner@example.com',
    });

    if (!owner) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      const data = new this.model({
        email: 'owner@example.com',
        password: password,
        firstName: 'System',
        lastName: 'Owner',
        permissions: ALL_MODULE_PERMISSIONS,
        status: StatusEnum.active,
      });
      await data.save();
    }

    const manager = await this.model.findOne({
      email: 'manager@example.com',
    });

    if (!manager) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      const data = new this.model({
        email: 'manager@example.com',
        password: password,
        firstName: 'System',
        lastName: 'Manager',
        permissions: ALL_MODULE_PERMISSIONS,
        status: StatusEnum.active,
      });
      await data.save();
    }
  }
}
