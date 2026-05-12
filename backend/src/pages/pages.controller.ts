import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PagesService } from './pages.service';

interface CreatePageBody {
  slug: string;
  title: string;
}

interface UpdatePageBody {
  title?: string;
}

interface CreateBlockBody {
  type: string;
  order?: number;
  enabled?: boolean;
  data: unknown;
}

interface UpdateBlockBody {
  type?: string;
  enabled?: boolean;
  order?: number;
  data?: unknown;
}

interface SeoBody {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
}

@Controller('pages')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(private readonly pages: PagesService) {}

  @Get()
  list() {
    return this.pages.list();
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.pages.findBySlug(slug);
  }

  @Post()
  create(@Body() body: CreatePageBody) {
    return this.pages.createPage(body);
  }

  @Patch(':slug')
  update(@Param('slug') slug: string, @Body() body: UpdatePageBody) {
    return this.pages.updatePage(slug, body);
  }

  @Post(':slug/blocks')
  createBlock(@Param('slug') slug: string, @Body() body: CreateBlockBody) {
    return this.pages.createBlock(slug, body);
  }

  @Patch('blocks/:id')
  updateBlock(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateBlockBody) {
    return this.pages.updateBlock(id, body);
  }

  @Delete('blocks/:id')
  deleteBlock(@Param('id', ParseIntPipe) id: number) {
    return this.pages.deleteBlock(id);
  }

  @Post(':slug/blocks/reorder')
  reorderBlocks(@Param('slug') slug: string, @Body() body: { orderedIds: number[] }) {
    return this.pages.reorderBlocks(slug, body.orderedIds);
  }

  @Post(':slug/seo')
  upsertSeo(@Param('slug') slug: string, @Body() body: SeoBody) {
    return this.pages.upsertSeo(slug, body);
  }
}
