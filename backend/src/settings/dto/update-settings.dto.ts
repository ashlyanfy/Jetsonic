import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional() @IsString() @MaxLength(50)
  telegramChatId?: string;
}
