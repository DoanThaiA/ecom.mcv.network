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
 * Controller for per-affiliate product commission import sessions
 */
@ApiBearerAuth()
@RequireModulePermission(ModulePermission.affiliate_management)
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@ApiTags('Affiliate Product Commission Import Sessions')
@Controller({
  path: 'affiliates/:affiliateId/product-commissions',
  version: '1',
})
export class AffiliateProductCommissionImportSessionsController {
  constructor(private readonly importSessionsService: ImportSessionsService) {}

  @Post('import-session')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create affiliate product commission import session',
    description:
      'Upload Excel file (Mã sản phẩm + Tỷ lệ hoa hồng %), validate products, and persist results in an import session for paginated preview.',
  })
  @ApiParam({ name: 'affiliateId', description: 'Affiliate ID' })
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
    @Param('affiliateId') affiliateId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImportSessionResponseDto> {
    return this.importSessionsService.createAffiliateProductCommissionSession(
      file,
      affiliateId,
    );
  }

  @Get('import-session/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get affiliate product commission import session summary',
  })
  @ApiParam({ name: 'affiliateId', description: 'Affiliate ID' })
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
    summary: 'Get paginated affiliate product commission import session rows',
  })
  @ApiParam({ name: 'affiliateId', description: 'Affiliate ID' })
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
    summary: 'Delete affiliate product commission import session row',
  })
  @ApiParam({ name: 'affiliateId', description: 'Affiliate ID' })
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
    summary: 'Confirm affiliate product commission import session',
    description:
      'Starts a background job to upsert product commissions with the rate parsed from Excel. Returns job ID for progress tracking.',
  })
  @ApiParam({ name: 'affiliateId', description: 'Affiliate ID' })
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
