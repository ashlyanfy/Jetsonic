import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Ip,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { buildLeadsXlsx } from './leads.export';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import type { Express } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { CreateLeadDto } from './dto/create-lead.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { ListLeadsDto } from './dto/list-leads.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  // ----- Public: form submission from the landing site -----
  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseInterceptors(FileInterceptor('attachment'))
  async create(
    @Body() dto: CreateLeadDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    if (dto.botField) throw new BadRequestException('Bot detected');
    const attachmentUrl = file ? `pending:${file.originalname}` : undefined;
    const lead = await this.leads.create(dto, { ip, userAgent, attachmentUrl });
    return { ok: true, id: lead.id };
  }

  // ----- Admin endpoints (require JWT) -----
  @Get()
  @UseGuards(JwtAuthGuard)
  list(@Query() query: ListLeadsDto) {
    return this.leads.findMany(query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  stats() {
    return this.leads.stats();
  }

  @Get('export')
  @UseGuards(JwtAuthGuard)
  async export(@Query() query: ListLeadsDto, @Res() res: Response) {
    const leads = await this.leads.findManyForExport(query);
    const xlsx = await buildLeadsXlsx(leads);
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="jetsonic-leads-${stamp}.xlsx"`);
    res.send(xlsx);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  get(@Param('id', ParseIntPipe) id: number) {
    return this.leads.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLeadDto) {
    return this.leads.update(id, dto);
  }

  @Post(':id/notes')
  @UseGuards(JwtAuthGuard)
  addNote(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateNoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.leads.addNote(id, user.id, dto.body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.leads.remove(id);
  }
}
