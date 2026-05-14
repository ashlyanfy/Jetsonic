import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { LeadStatus } from '@prisma/client';

export class UpdateLeadDto {
  @IsOptional() @IsEnum(LeadStatus)
  status?: LeadStatus;

  // Use empty string to unassign; otherwise expects a user id (cuid).
  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  assigneeId?: string | null;
}
