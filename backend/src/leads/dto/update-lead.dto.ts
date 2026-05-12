import { IsEnum, IsOptional } from 'class-validator';
import { LeadStatus } from '@prisma/client';

export class UpdateLeadDto {
  @IsOptional() @IsEnum(LeadStatus)
  status?: LeadStatus;
}
