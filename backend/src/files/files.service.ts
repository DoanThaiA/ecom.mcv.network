import { Injectable } from '@nestjs/common';

import { FileRepository } from './infrastructure/persistence/file.repository';
import { File } from './domain/file';
import { NullableType } from '../utils/types/nullable.type';

@Injectable()
export class FilesService {
  constructor(private readonly fileRepository: FileRepository) {}

  findById(id: File['id']): Promise<NullableType<File>> {
    return this.fileRepository.findById(id);
  }

  findByIds(ids: File['id'][]): Promise<File[]> {
    return this.fileRepository.findByIds(ids);
  }
}
