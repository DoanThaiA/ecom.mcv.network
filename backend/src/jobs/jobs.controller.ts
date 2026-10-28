import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JobsService } from './jobs.service';
import { JobResponseDto, CancelJobResponseDto } from './dto/job-response.dto';
import { ListJobsDto } from './dto/list-jobs.dto';
import { infinityPaginationFromPaginate } from '../utils/infinity-pagination';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';
import { AuditLog } from '../audit-log/decorators/audit-log.decorator';

@ApiTags('Jobs')
@ApiBearerAuth()
@RequireModulePermission(ModulePermission.settings)
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@Controller({ path: 'jobs', version: '1' })
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get job status by ID (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nReturns the current status and progress of a job.',
  })
  @ApiOkResponse({
    description: 'Job status returned successfully',
    type: JobResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Job not found',
  })
  async getJob(@Param('id') id: string): Promise<JobResponseDto> {
    return this.jobsService.getJob(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @AuditLog({
    action: 'JOB_CANCEL',
    category: 'jobs',
    description: 'Cancel a running job',
  })
  @ApiOperation({
    summary: 'Cancel a running job (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nCancels a job that is pending or running.',
  })
  @ApiOkResponse({
    description: 'Job cancelled successfully',
    type: CancelJobResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Job not found',
  })
  @ApiConflictResponse({
    description: 'Job cannot be cancelled (already completed or failed)',
  })
  async cancelJob(@Param('id') id: string): Promise<CancelJobResponseDto> {
    await this.jobsService.cancelJob(id);
    return { message: 'Job cancelled' };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List jobs with pagination (Owner Only)',
    description:
      '**Requires: CMS Owner Permission**\n\nReturns a paginated list of jobs, optionally filtered by type.',
  })
  @ApiOkResponse({
    description: 'Jobs list returned successfully',
  })
  async listJobs(
    @Query() query: ListJobsDto,
  ): Promise<InfinityPaginationResponseDto<JobResponseDto>> {
    const result = await this.jobsService.listJobs(
      query.page ?? 1,
      query.limit ?? 20,
      query.type,
    );

    const paginatedResult = infinityPaginationFromPaginate(result);
    return {
      ...paginatedResult,
      data: paginatedResult.data.map((job) => JobResponseDto.fromDomain(job)),
    };
  }
}
