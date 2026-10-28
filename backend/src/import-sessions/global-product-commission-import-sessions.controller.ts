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
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';

/**
 * Controller for global commission settings product import sessions
 * (rows are written with affiliateId = null)
 */
@ApiBearerAuth()
@RequireModulePermission(ModulePermission.affiliate_management)
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@ApiTags('Global Product Commission Import Sessions')
@Controller({ path: 'commission-settings/products', version: '1' })
export class GlobalProductCommissionImportSessionsController {
  constructor(private readonly importSessionsService: ImportSessionsService) {}

  @Post('import-session')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create global product commission import session',
    description:
      'Upload Excel file (Mã sản phẩm + Tỷ lệ hoa hồng %) for Cài đặt hoa hồng. Rows are upserted with affiliateId=null on confirm.',
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
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImportSessionResponseDto> {
    return this.importSessionsService.createAffiliateProductCommissionSession(
      file,
      null,
    );
  }

  @Get('import-session/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get global product commission import session summary',
  })
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

  @Get('import-session/:sessionId/rows')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get paginated global product commission import session rows',
  })
  @ApiParam({ name: 'sessionId', description: 'Import session ID' })
  @ApiOkResponse({ description: 'Paginated rows' })
  async getSessionRows(
    @Param('sessionId') sessionId: string,
    @Query() query: QueryImportSessionRowsDto,
  ) {
    return this.importSessionsService.getSessionRows(sessionId, query);
  }

  @Delete('import-session/:sessionId/rows/:rowId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete global product commission import session row',
  })
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

  @Post('import-session/:sessionId/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm global product commission import session',
    description:
      'Starts a background job to upsert global product commissions (affiliateId=null) with the rate parsed from Excel. Returns job ID for progress tracking.',
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
    return this.importSessionsService.confirmAffiliateProductCommissionSession(
      sessionId,
    );
  }
}
