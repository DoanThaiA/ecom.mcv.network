import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { Transform } from 'class-transformer';
import fileConfig from '../config/file.config';
import { FileConfig, FileDriver } from '../config/file-config.type';

import { AppConfig } from '../../config/app-config.type';
import appConfig from '../../config/app.config';

export class File {
  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  @Allow()
  id: string;

  @ApiProperty({
    type: String,
    example: 'https://example.com/path/to/file.jpg',
  })
  @Transform(
    ({ value }) => {
      if ((fileConfig() as FileConfig).driver === FileDriver.LOCAL) {
        return (appConfig() as AppConfig).backendDomain + value;
      } else if (
        [FileDriver.S3_PRESIGNED, FileDriver.S3].includes(
          (fileConfig() as FileConfig).driver,
        )
      ) {
        const config = fileConfig() as FileConfig;
        const region = config.awsS3Region;
        const bucket = config.awsDefaultS3Bucket;

        // Return direct S3 URL for public-read files
        return `https://${bucket}.s3.${region}.amazonaws.com/${value}`;
      }

      return value;
    },
    {
      toPlainOnly: true,
    },
  )
  path: string;
}
