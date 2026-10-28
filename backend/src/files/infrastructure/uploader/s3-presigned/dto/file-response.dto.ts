import { ApiProperty } from '@nestjs/swagger';
import { File } from '../../../../domain/file';

export class FileResponseDto {
  @ApiProperty({
    type: () => File,
  })
  file: File;

  @ApiProperty({
    type: String,
  })
  uploadSignedUrl: string;
}
