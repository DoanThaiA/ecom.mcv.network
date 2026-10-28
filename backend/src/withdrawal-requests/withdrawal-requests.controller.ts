import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';
import { WithdrawalRequestsService } from './withdrawal-requests.service';
import { QueryWithdrawalRequestsDto } from './dto/query-withdrawal-requests.dto';
import { RejectWithdrawalRequestDto } from './dto/reject-withdrawal-request.dto';
import { BulkActionDto, BulkRejectDto } from './dto/bulk-action.dto';

@ApiBearerAuth()
@RequireModulePermission(ModulePermission.affiliate_management)
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@ApiTags('CMS - Withdrawal Requests')
@Controller({ path: 'withdrawal-requests', version: '1' })
export class WithdrawalRequestsController {
  constructor(private readonly service: WithdrawalRequestsService) {}

  /**
   * Get paginated list of all withdrawal requests (admin view).
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all withdrawal requests' })
  @ApiOkResponse({ description: 'Paginated withdrawal request list' })
  async findAll(@Query() query: QueryWithdrawalRequestsDto) {
    const result = await this.service.findAll(query);
    return {
      data: result.docs.map(this.mapToResponse),
      total: result.totalDocs,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
    };
  }

  /**
   * Get a single withdrawal request by ID.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get withdrawal request detail' })
  @ApiParam({ name: 'id', description: 'Withdrawal request ID' })
  async findOne(@Param('id') id: string) {
    const request = await this.service.findOne(id);
    const processedByName = await this.service.resolveProcessorName(
      request.processedBy,
    );
    return { ...this.mapToResponse(request), processedBy: processedByName };
  }

  /**
   * Approve a pending withdrawal request.
   */
  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a withdrawal request' })
  @ApiParam({ name: 'id', description: 'Withdrawal request ID' })
  async approve(@Param('id') id: string, @Request() req: any) {
    const request = await this.service.approve(
      id,
      req.user?.email ?? req.user?.id,
    );
    return this.mapToResponse(request);
  }

  /**
   * Reject a pending withdrawal request.
   */
  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a withdrawal request' })
  @ApiParam({ name: 'id', description: 'Withdrawal request ID' })
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectWithdrawalRequestDto,
    @Request() req: any,
  ) {
    const request = await this.service.reject(
      id,
      req.user?.email ?? req.user?.id,
      dto.reason,
    );
    return this.mapToResponse(request);
  }

  /**
   * Mark an approved withdrawal request as paid.
   */
  @Patch(':id/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark withdrawal request as paid' })
  @ApiParam({ name: 'id', description: 'Withdrawal request ID' })
  async pay(@Param('id') id: string, @Request() req: any) {
    const request = await this.service.pay(id, req.user?.email ?? req.user?.id);
    return this.mapToResponse(request);
  }

  /**
   * Bulk approve multiple withdrawal requests.
   */
  @Patch('bulk-approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk approve withdrawal requests' })
  async bulkApprove(@Body() dto: BulkActionDto, @Request() req: any) {
    await this.service.bulkApprove(dto.ids, req.user?.email ?? req.user?.id);
    return { success: true };
  }

  /**
   * Bulk reject multiple withdrawal requests.
   */
  @Patch('bulk-reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk reject withdrawal requests' })
  async bulkReject(@Body() dto: BulkRejectDto, @Request() req: any) {
    await this.service.bulkReject(
      dto.ids,
      req.user?.email ?? req.user?.id,
      dto.reason ?? '',
    );
    return { success: true };
  }

  /**
   * Bulk mark approved withdrawal requests as paid.
   */
  @Patch('bulk-pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk mark withdrawal requests as paid' })
  async bulkPay(@Body() dto: BulkActionDto, @Request() req: any) {
    await this.service.bulkPay(dto.ids, req.user?.email ?? req.user?.id);
    return { success: true };
  }

  private mapToResponse(request: any) {
    return {
      id: request.id,
      affiliateId: request.affiliateId,
      agentName: request.agentName,
      recipientName: request.recipientName,
      bankAccountNumber: request.bankAccountNumber,
      bankName: request.bankName,
      amount: request.amount,
      note: request.note,
      status: request.status,
      requestDate: request.requestDate,
      processedBy: request.processedBy,
      processedDate: request.processedDate,
      rejectionReason: request.rejectionReason,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }
}
