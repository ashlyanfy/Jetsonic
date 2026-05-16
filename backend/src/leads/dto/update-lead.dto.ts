import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { LeadStatus } from '@prisma/client';

export class UpdateLeadDto {
  @IsOptional() @IsEnum(LeadStatus)
  status?: LeadStatus;

  // Use empty string to unassign; otherwise expects a user id (cuid).
  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  assigneeId?: string | null;

  // Editable contact + request fields (all optional, all length-bounded).
  @IsOptional() @IsString() @MaxLength(200)
  name?: string;

  @IsOptional() @IsString() @MaxLength(254)
  email?: string;

  @IsOptional() @IsString() @MaxLength(60)
  phone?: string;

  @IsOptional() @IsString() @MaxLength(200)
  company?: string;

  @IsOptional() @IsString() @MaxLength(120)
  role?: string;

  @IsOptional() @IsString() @MaxLength(40)
  requestType?: string;

  @IsOptional() @IsIn(['AOG', 'Priority', 'Routine'])
  urgency?: string;

  @IsOptional() @IsString() @MaxLength(120)
  partNumber?: string;

  @IsOptional() @IsString() @MaxLength(120)
  altPartNumber?: string;

  @IsOptional() @IsString() @MaxLength(80)
  aircraftType?: string;

  @IsOptional() @IsString() @MaxLength(40)
  tailNumber?: string;

  @IsOptional() @IsString() @MaxLength(20)
  ataChapter?: string;

  @IsOptional() @IsString() @MaxLength(40)
  quantity?: string;

  @IsOptional() @IsString() @MaxLength(40)
  condition?: string;

  @IsOptional() @IsString() @MaxLength(120)
  certificate?: string;

  @IsOptional() @IsDateString()
  @Type(() => String)
  targetDate?: string | null;

  @IsOptional() @IsString() @MaxLength(300)
  deliveryLocation?: string;

  @IsOptional() @IsString() @MaxLength(5000)
  message?: string;
}
