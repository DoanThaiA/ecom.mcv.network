import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEnum, ValidationOptions } from 'class-validator';
import {
  createProtoEnumTransformer,
  ProtoEnumMapping,
} from '../transformers/proto-enum.transformer';

/**
 * Combined decorator that transforms proto enum numbers to string values
 * and validates the result against the enum.
 *
 * This decorator handles both:
 * - String values (e.g., 'active', 'inactive') - passed through directly
 * - Number values from proto (e.g., 1, 2) - converted to string values
 *
 * @param enumType - The TypeScript enum to validate against
 * @param protoMapping - Mapping of proto number values to enum string values
 * @param validationOptions - Optional validation options for @IsEnum
 *
 * @example
 * import { TopicStatus } from '../domain/topic-status.enum';
 * import { TOPIC_STATUS_PROTO_MAP } from '../../utils/transformers/proto-enum.transformer';
 *
 * export class CreateTopicDto {
 *   @ApiPropertyOptional({ enum: TopicStatus })
 *   @IsOptional()
 *   @TransformProtoEnum(TopicStatus, TOPIC_STATUS_PROTO_MAP)
 *   status?: TopicStatus;
 * }
 *
 * // Now accepts both:
 * // { "status": "active" }     -> works
 * // { "status": 1 }            -> converted to "active", works
 * // { "status": "invalid" }    -> validation error
 * // { "status": 99 }           -> validation error (not in mapping)
 */
export function TransformProtoEnum<T extends object>(
  enumType: T,
  protoMapping: ProtoEnumMapping,
  validationOptions?: ValidationOptions,
) {
  return applyDecorators(
    Transform(createProtoEnumTransformer(protoMapping)),
    IsEnum(enumType, validationOptions),
  );
}
