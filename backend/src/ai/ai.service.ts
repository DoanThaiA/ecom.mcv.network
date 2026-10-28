import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AllConfigType } from '../config/config.type';
import {
  SupportedLanguage,
  TranslateRequestDto,
  TranslateResponseDto,
} from './dto/translate.dto';
import { throwException } from '../utils/errors/throw-exception';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AiService {
  private readonly logger: Logger = new Logger(AiService.name);
  private readonly openai: OpenAI;
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly i18n: I18nService,
  ) {
    const apiKey: string = this.configService.getOrThrow('openai.apiKey', {
      infer: true,
    });
    this.model = this.configService.getOrThrow('openai.model', { infer: true });

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Get full language name from language code
   *
   * @param language - Language code (vi or en)
   * @returns Full language name in English
   */
  private _getLanguageName(language: SupportedLanguage): string {
    const languageMap: Record<SupportedLanguage, string> = {
      [SupportedLanguage.VIETNAMESE]: 'Vietnamese',
      [SupportedLanguage.ENGLISH]: 'English',
    };
    return languageMap[language];
  }

  /**
   * Translate text from source language to target language using OpenAI
   *
   * @param dto - Request data containing text and language info
   * @param dto.text - Text to translate (max 5000 characters)
   * @param dto.sourceLanguage - Source language (vi or en)
   * @param dto.targetLanguage - Target language (vi or en)
   *
   * @returns Object containing:
   * - originalText: Original text
   * - translatedText: Translated text
   * - sourceLanguage: Source language
   * - targetLanguage: Target language
   *
   * @throws HttpException if translation fails
   */
  async translate(dto: TranslateRequestDto): Promise<TranslateResponseDto> {
    const { text, sourceLanguage, targetLanguage } = dto;

    this.logger.debug(
      `Translating text from ${sourceLanguage} to ${targetLanguage}`,
    );

    if (sourceLanguage === targetLanguage) {
      return {
        originalText: text,
        translatedText: text,
        sourceLanguage,
        targetLanguage,
      };
    }

    const sourceLangName: string = this._getLanguageName(sourceLanguage);
    const targetLangName: string = this._getLanguageName(targetLanguage);

    const systemPrompt: string = `You are a professional translator. Translate the following text from ${sourceLangName} to ${targetLangName}.
Only respond with the translated text, nothing else. Do not add any explanations or notes.
Preserve the original formatting, including line breaks and punctuation.`;

    try {
      const response: OpenAI.Chat.Completions.ChatCompletion =
        await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text },
          ],
          temperature: 0.3,
          max_tokens: 4096,
        });

      const translatedText: string =
        response.choices[0]?.message?.content?.trim() || '';

      if (!translatedText) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('ai.translationFailed'),
        });
      }

      this.logger.debug('Translation completed successfully');

      return {
        originalText: text,
        translatedText,
        sourceLanguage,
        targetLanguage,
      };
    } catch (error) {
      this.logger.error('Translation failed', error);

      if (error instanceof OpenAI.APIError) {
        throwException({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          message: this.i18n.t('ai.openaiServiceError'),
        });
      }

      throw error;
    }
  }
}
