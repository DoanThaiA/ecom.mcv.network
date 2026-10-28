import { Injectable } from '@nestjs/common';

import { FileRepository } from '../../file.repository';
import { FileSchemaClass } from '../entities/file.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from '../../../../domain/file';

import { FileMapper } from '../mappers/file.mapper';
import { NullableType } from '../../../../../utils/types/nullable.type';

@Injectable()
export class FileDocumentRepository implements FileRepository {
  constructor(
    @InjectModel(FileSchemaClass.name)
    private fileModel: Model<FileSchemaClass>,
  ) {}

  async create(data: Omit<File, 'id'>): Promise<File> {
    const createdFile = new this.fileModel(data);
    const fileObject = await createdFile.save();
    return FileMapper.toDomain(fileObject);
  }

  async findById(id: File['id']): Promise<NullableType<File>> {
    const fileObject = await this.fileModel.findById(id);
    return fileObject ? FileMapper.toDomain(fileObject) : null;
  }

  async findByIds(ids: File['id'][]): Promise<File[]> {
    const fileObjects = await this.fileModel.find({ _id: { $in: ids } });
    return fileObjects.map((fileObject) => FileMapper.toDomain(fileObject));
  }
}
