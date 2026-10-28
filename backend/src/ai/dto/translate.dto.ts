import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Enum defining supported languages for translation
 */
export enum SupportedLanguage {
  VIETNAMESE = 'vi',
  ENGLISH = 'en',
}

/**
 * DTO for translation request
 */
export class TranslateRequestDto {
  @ApiProperty({
    description: 'Text to translate',
    example: 'Hello, how are you?',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  text: string;

  @ApiProperty({
    description: 'Source language',
    enum: SupportedLanguage,
    example: SupportedLanguage.ENGLISH,
  })
  @IsEnum(SupportedLanguage)
  @IsNotEmpty()
  sourceLanguage: SupportedLanguage;

  @ApiProperty({
    description: 'Target language',
    enum: SupportedLanguage,
    example: SupportedLanguage.VIETNAMESE,
  })
  @IsEnum(SupportedLanguage)
  @IsNotEmpty()
  targetLanguage: SupportedLanguage;
}

/**
 * DTO for translation response
 */
export class TranslateResponseDto {
  @ApiProperty({
    description: 'Original text',
    example: 'Hello, how are you?',
  })
  originalText: string;

  @ApiProperty({
    description: 'Translated text',
    example: 'Xin chao, ban khoe khong?',
  })
  translatedText: string;

  @ApiProperty({
    description: 'Source language',
    enum: SupportedLanguage,
    example: SupportedLanguage.ENGLISH,
  })
  sourceLanguage: SupportedLanguage;

  @ApiProperty({
    description: 'Target language',
    enum: SupportedLanguage,
    example: SupportedLanguage.VIETNAMESE,
  })
  targetLanguage: SupportedLanguage;
}
