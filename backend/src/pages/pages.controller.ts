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
  @UseGuards(JwtAuthGuard)
  create(@Body() body: CreatePageBody) {
    return this.pages.createPage(body);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard)
  update(@Param('slug') slug: string, @Body() body: UpdatePageBody) {
    return this.pages.updatePage(slug, body);
  }

  @Post(':slug/blocks')
  @UseGuards(JwtAuthGuard)
  createBlock(@Param('slug') slug: string, @Body() body: CreateBlockBody) {
    return this.pages.createBlock(slug, body);
  }

  @Patch('blocks/:id')
  @UseGuards(JwtAuthGuard)
  updateBlock(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateBlockBody) {
    return this.pages.updateBlock(id, body);
  }

  @Delete('blocks/:id')
  @UseGuards(JwtAuthGuard)
  deleteBlock(@Param('id', ParseIntPipe) id: number) {
    return this.pages.deleteBlock(id);
  }

  @Post(':slug/blocks/reorder')
  @UseGuards(JwtAuthGuard)
  reorderBlocks(@Param('slug') slug: string, @Body() body: { orderedIds: number[] }) {
    return this.pages.reorderBlocks(slug, body.orderedIds);
  }

  @Post(':slug/seo')
  @UseGuards(JwtAuthGuard)
  upsertSeo(@Param('slug') slug: string, @Body() body: SeoBody) {
    return this.pages.upsertSeo(slug, body);
  }
}
