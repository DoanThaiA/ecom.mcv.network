import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JobType } from '../domain/job-type.enum';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import { JOB_TYPE_PROTO_MAP } from '../../utils/transformers/proto-enum.transformer';

export class ListJobsDto {
  @ApiPropertyOptional({
    enum: JobType,
    description: 'Filter by job type',
  })
  @IsOptional()
  @TransformProtoEnum(JobType, JOB_TYPE_PROTO_MAP)
  type?: JobType;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
    description: 'Page number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 20,
    description: 'Number of items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
