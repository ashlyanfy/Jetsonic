import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLeadDto {
  @IsString() @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional() @IsString() @MaxLength(120) company?: string;
  @IsOptional() @IsString() @MaxLength(80)  role?: string;
  @IsOptional() @IsString() @MaxLength(60)  phone?: string;

  @IsOptional() @IsString() @MaxLength(60)  requestType?: string;
  @IsOptional() @IsString() @MaxLength(60)  urgency?: string;

  @IsOptional() @IsString() @MaxLength(120) partNumber?: string;
  @IsOptional() @IsString() @MaxLength(120) altPartNumber?: string;
  @IsOptional() @IsString() @MaxLength(40)  ataChapter?: string;
  @IsOptional() @IsString() @MaxLength(60)  aircraftType?: string;
  @IsOptional() @IsString() @MaxLength(40)  tailNumber?: string;
  @IsOptional() @IsString() @MaxLength(40)  quantity?: string;
  @IsOptional() @IsString() @MaxLength(60)  condition?: string;
  @IsOptional() @IsString() @MaxLength(60)  certificate?: string;
  @IsOptional() @IsString() @MaxLength(40)  targetDate?: string;
  @IsOptional() @IsString() @MaxLength(200) deliveryLocation?: string;

  @IsOptional() @IsString() @MaxLength(4000) message?: string;
  @IsOptional() @IsString() @MaxLength(200)  source?: string;

  // Honeypot — must remain empty. Filled = bot.
  @IsOptional() @IsString() @MaxLength(0) botField?: string;
}
