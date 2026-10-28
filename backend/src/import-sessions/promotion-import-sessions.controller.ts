import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
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
import { CreateProductDiscountImportSessionDto } from './dto/create-import-session.dto';
import { QueryImportSessionRowsDto } from './dto/query-import-session-rows.dto';
import { UpdateImportSessionRowDto } from './dto/update-import-session-row.dto';
import {
  ImportSessionResponseDto,
  ImportSessionRowResponseDto,
  ConfirmImportSessionResponseDto,
} from './dto/import-session-response.dto';

/**
 * Controller for product discount import sessions
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'))
@ApiTags('Product Discount Import Sessions')
@Controller({ path: 'promotions', version: '1' })
export class PromotionImportSessionsController {
  constructor(private readonly importSessionsService: ImportSessionsService) {}

  /**
   * Upload Excel file and create an import session for product discount
   */
  @Post(':promotionId/import-session')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create product discount import session',
    description:
      'Upload Excel file, validate products, and persist results in an import session for paginated preview.',
  })
  @ApiParam({
    name: 'promotionId',
    description: 'Promotion ID',
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
        startTime: {
          type: 'string',
          description: 'Promotion start time (ISO 8601)',
        },
        endTime: {
          type: 'string',
          description: 'Promotion end time (ISO 8601)',
        },
        promotionId: {
          type: 'string',
          description: 'Promotion ID for edit mode conflict exclusion',
        },
      },
      required: ['file', 'startTime', 'endTime'],
    },
  })
  @ApiCreatedResponse({
    description: 'Import session created',
    type: ImportSessionResponseDto,
  })
  async createSession(
    @Param('promotionId') promotionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateProductDiscountImportSessionDto,
  ): Promise<ImportSessionResponseDto> {
    return this.importSessionsService.createProductDiscountSession(
      file,
      promotionId,
      dto,
    );
  }

  /**
   * Get import session summary
   */
  @Get('import-session/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get import session summary' })
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
  @ApiOperation({ summary: 'Get paginated import session rows' })
  @ApiParam({ name: 'sessionId', description: 'Import session ID' })
  @ApiOkResponse({ description: 'Paginated rows' })
  async getSessionRows(
    @Param('sessionId') sessionId: string,
    @Query() query: QueryImportSessionRowsDto,
  ) {
    return this.importSessionsService.getSessionRows(sessionId, query);
  }

  /**
   * Update a session row (inline edit with re-validation)
   */
  @Patch('import-session/:sessionId/rows/:rowId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update product discount import session row',
    description: 'Inline edit a row. Backend re-validates discount.',
  })
  @ApiParam({ name: 'sessionId', description: 'Import session ID' })
  @ApiParam({ name: 'rowId', description: 'Row ID' })
  @ApiOkResponse({
    description: 'Updated row',
    type: ImportSessionRowResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Row not found' })
  async updateSessionRow(
    @Param('sessionId') sessionId: string,
    @Param('rowId') rowId: string,
    @Body() dto: UpdateImportSessionRowDto,
  ): Promise<ImportSessionRowResponseDto> {
    return this.importSessionsService.updateSessionRow(sessionId, rowId, dto);
  }

  /**
   * Delete a session row
   */
  @Delete('import-session/:sessionId/rows/:rowId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete import session row' })
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
    summary: 'Confirm product discount import session',
    description:
      'Starts a background job to process valid rows. Returns job ID for progress tracking.',
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
    return this.importSessionsService.confirmProductDiscountSession(sessionId);
  }
}
