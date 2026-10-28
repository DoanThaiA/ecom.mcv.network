import { NullableType } from '../../../utils/types/nullable.type';
import { File } from '../../domain/file';

export abstract class FileRepository {
  abstract create(data: Omit<File, 'id'>): Promise<File>;

  abstract findById(id: File['id']): Promise<NullableType<File>>;

  abstract findByIds(ids: File['id'][]): Promise<File[]>;
}
