import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class FileUploadDto {
  @ApiProperty({ example: 'image.jpg' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  fileName: string;

  @ApiProperty({ example: 138723 })
  @IsNumber({}, { message: i18nValidationMessage('validation.isNumber') })
  fileSize: number;
}
