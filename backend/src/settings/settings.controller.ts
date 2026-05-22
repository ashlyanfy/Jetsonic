import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { SettingsService, SETTING_KEYS } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  async getAll() {
    const all = await this.settings.getAll();
    return {
      telegramChatId: all[SETTING_KEYS.TELEGRAM_CHAT_ID] ?? '',
    };
  }

  @Patch()
  async update(@Body() dto: UpdateSettingsDto) {
    if (dto.telegramChatId !== undefined) {
      const trimmed = dto.telegramChatId.trim();
      if (trimmed) {
        await this.settings.set(SETTING_KEYS.TELEGRAM_CHAT_ID, trimmed);
      } else {
        // Empty string = delete override, fall back to env var
        await this.settings.set(SETTING_KEYS.TELEGRAM_CHAT_ID, '');
      }
    }
    return { ok: true };
  }
}
