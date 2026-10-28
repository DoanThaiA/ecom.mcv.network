import { NullableType } from '../../utils/types/nullable.type';
import { ImportSession } from './import-session';
import { ImportSessionStatus } from './import-session-status.enum';

/**
 * Abstract repository interface for ImportSession entity
 */
export abstract class ImportSessionRepository {
  /**
   * Create a new import session
   */
  abstract create(
    data: Omit<ImportSession, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ImportSession>;

  /**
   * Find an import session by ID
   */
  abstract findById(id: string): Promise<NullableType<ImportSession>>;

  /**
   * Update session status and optional fields
   */
  abstract updateStatus(
    id: string,
    status: ImportSessionStatus,
    additionalFields?: Partial<
      Pick<ImportSession, 'jobId' | 'validCount' | 'invalidCount' | 'totalRows'>
    >,
  ): Promise<NullableType<ImportSession>>;
}
