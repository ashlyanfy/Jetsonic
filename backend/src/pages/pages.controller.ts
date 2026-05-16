import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import {
  CreateBlockDto,
  CreatePageDto,
  ReorderBlocksDto,
  SeoDto,
  UpdateBlockDto,
  UpdatePageDto,
} from './dto/page.dto';
import { PagesService } from './pages.service';

@Controller('pages')
export class PagesController {
  constructor(private readonly pages: PagesService) {}

  // Public — used by the landing to render blocks dynamically.
  @Get('public/:slug')
  getPublic(@Param('slug') slug: string) {
    return this.pages.getPublicPage(slug);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  list() {
    return this.pages.list();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  search(@Query('q') q: string) {
    return this.pages.search(q ?? '');
  }

  @Get(':slug')
  @UseGuards(JwtAuthGuard)
  get(@Param('slug') slug: string) {
    return this.pages.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() body: CreatePageDto) {
    return this.pages.createPage(body);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('slug') slug: string, @Body() body: UpdatePageDto) {
    return this.pages.updatePage(slug, body);
  }

  @Post(':slug/blocks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createBlock(@Param('slug') slug: string, @Body() body: CreateBlockDto) {
    return this.pages.createBlock(slug, body);
  }

  @Patch('blocks/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateBlock(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateBlockDto) {
    return this.pages.updateBlock(id, body);
  }

  @Delete('blocks/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteBlock(@Param('id', ParseIntPipe) id: number) {
    return this.pages.deleteBlock(id);
  }

  @Post(':slug/blocks/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  reorderBlocks(@Param('slug') slug: string, @Body() body: ReorderBlocksDto) {
    return this.pages.reorderBlocks(slug, body.orderedIds);
  }

  @Post(':slug/seo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  upsertSeo(@Param('slug') slug: string, @Body() body: SeoDto) {
    return this.pages.upsertSeo(slug, body);
  }
}
