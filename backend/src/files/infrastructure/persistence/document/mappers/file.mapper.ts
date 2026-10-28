import { File } from '../../../../domain/file';
import { FileSchemaClass } from '../entities/file.schema';

export class FileMapper {
  static toDomain(raw: FileSchemaClass): File {
    const domainEntity = new File();
    domainEntity.id = raw._id.toString();
    domainEntity.path = raw.path;
    return domainEntity;
  }
  static toDocument(domainEntity: File): FileSchemaClass {
    const persistenceSchema = new FileSchemaClass();
    if (domainEntity.id) {
      persistenceSchema._id = domainEntity.id;
    }
    persistenceSchema.path = domainEntity.path;
    return persistenceSchema;
  }
}
