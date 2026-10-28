import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { FileRepository } from '../../persistence/file.repository';
import { File } from '../../../domain/file';

@Injectable()
export class FilesS3Service {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly i18n: I18nService,
  ) {}

  async create(file: Express.MulterS3.File): Promise<{ file: File }> {
    if (!file) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: this.i18n.t('file.selectFile'),
        },
      });
    }

    return {
      file: await this.fileRepository.create({
        path: file.key,
      }),
    };
  }
}
