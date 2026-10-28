import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ImportSessionsService } from './import-sessions.service';
import { QueryImportSessionRowsDto } from './dto/query-import-session-rows.dto';
import {
  ImportSessionResponseDto,
  ConfirmImportSessionResponseDto,
} from './dto/import-session-response.dto';

/**
 * Controller for topic product import sessions
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'))
@ApiTags('Topic Import Sessions')
@Controller({ path: 'topics', version: '1' })
export class TopicImportSessionsController {
  constructor(private readonly importSessionsService: ImportSessionsService) {}

  /**
   * Upload Excel file and create an import session for topic products
   */
  @Post(':topicId/import-session')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create topic product import session',
    description:
      'Upload Excel file (Mã sản phẩm + Tên sản phẩm), validate products, and persist results in an import session for paginated preview.',
  })
  @ApiParam({
    name: 'topicId',
    description: 'Topic ID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel file (.xlsx)',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    description: 'Import session created',
    type: ImportSessionResponseDto,
  })
  async createSession(
    @Param('topicId') topicId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImportSessionResponseDto> {
    return this.importSessionsService.createTopicSession(file, topicId);
  }

  /**
   * Get import session summary
   */
  @Get('import-session/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get topic import session summary' })
  @ApiParam({ name: 'sessionId', description: 'Import session ID' })
  @ApiOkResponse({
    description: 'Session summary',
    type: ImportSessionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Session not found' })
  async getSession(
    @Param('sessionId') sessionId: string,
  ): Promise<ImportSessionResponseDto> {
    return this.importSessionsService.getSession(sessionId);
  }

  /**
   * Get paginated session rows
   */
  @Get('import-session/:sessionId/rows')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get paginated topic import session rows' })
  @ApiParam({ name: 'sessionId', description: 'Import session ID' })
  @ApiOkResponse({ description: 'Paginated rows' })
  async getSessionRows(
    @Param('sessionId') sessionId: string,
    @Query() query: QueryImportSessionRowsDto,
  ) {
    return this.importSessionsService.getSessionRows(sessionId, query);
  }

  /**
   * Delete a session row
   */
  @Delete('import-session/:sessionId/rows/:rowId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete topic import session row' })
  @ApiParam({ name: 'sessionId', description: 'Import session ID' })
  @ApiParam({ name: 'rowId', description: 'Row ID' })
  @ApiOkResponse({
    description: 'Updated session summary after deletion',
    type: ImportSessionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Row not found' })
  async deleteSessionRow(
    @Param('sessionId') sessionId: string,
    @Param('rowId') rowId: string,
  ): Promise<ImportSessionResponseDto> {
    return this.importSessionsService.deleteSessionRow(sessionId, rowId);
  }

  /**
   * Confirm import session and start background processing job
   */
  @Post('import-session/:sessionId/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm topic product import session',
    description:
      'Starts a background job to add valid rows into the topic. Returns job ID for progress tracking.',
  })
  @ApiParam({ name: 'sessionId', description: 'Import session ID' })
  @ApiOkResponse({
    description: 'Job created',
    type: ConfirmImportSessionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Session not found' })
  async confirmSession(
    @Param('sessionId') sessionId: string,
  ): Promise<ConfirmImportSessionResponseDto> {
    return this.importSessionsService.confirmTopicSession(sessionId);
  }
}
