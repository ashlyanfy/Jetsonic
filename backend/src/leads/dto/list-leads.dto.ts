import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { LeadStatus } from '@prisma/client';

export class ListLeadsDto {
  @IsOptional() @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional() @IsString()
  q?: string;

  @IsOptional() @IsString()
  from?: string;

  @IsOptional() @IsString()
  to?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  pageSize?: number = 25;
}
