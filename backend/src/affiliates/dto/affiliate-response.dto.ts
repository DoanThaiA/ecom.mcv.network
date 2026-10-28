import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AffiliateType } from '../domain/affiliate-type.enum';
import { AffiliateStatus } from '../domain/affiliate-status.enum';

export class AffiliateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  affiliateCode: string;

  @ApiProperty({ enum: AffiliateType })
  type: AffiliateType;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiPropertyOptional()
  bankAccountHolder?: string | null;

  @ApiPropertyOptional()
  bankName?: string | null;

  @ApiPropertyOptional()
  bankAccountNumber?: string | null;

  @ApiPropertyOptional()
  citizenId?: string | null;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty({ enum: AffiliateStatus })
  status: AffiliateStatus;

  @ApiPropertyOptional()
  defaultCommissionRate?: number | null;

  @ApiProperty()
  autoUpdateProducts: boolean;

  @ApiPropertyOptional()
  isRecalculating?: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
