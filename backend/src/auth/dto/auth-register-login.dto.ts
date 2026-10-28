import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';

export class AuthRegisterLoginDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  email: string;

  @ApiProperty()
  @MinLength(6, { message: i18nValidationMessage('validation.minLength') })
  password: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  firstName: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  lastName?: string;
}
