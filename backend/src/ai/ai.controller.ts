import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { TranslateRequestDto, TranslateResponseDto } from './dto/translate.dto';

@ApiTags('CMS - AI')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'))
@Controller({ path: 'ai', version: '1' })
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Translate text between Vietnamese and English
   *
   * @param dto - Request body containing text and language info
   * @returns Translation result with original and translated text
   */
  @Post('translate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Translate text',
    description:
      'Translate text between Vietnamese and English using AI (OpenAI)',
  })
  @ApiOkResponse({
    type: TranslateResponseDto,
    description: 'Translation successful',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Translation failed due to processing error',
  })
  async translate(
    @Body() dto: TranslateRequestDto,
  ): Promise<TranslateResponseDto> {
    return this.aiService.translate(dto);
  }
}
