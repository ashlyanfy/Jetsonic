import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.page.findMany({
      orderBy: { slug: 'asc' },
      include: {
        _count: { select: { blocks: true } },
      },
    });
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: {
        blocks: { orderBy: { order: 'asc' } },
        seo: true,
      },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async createPage(data: { slug: string; title: string }) {
    return this.prisma.page.create({ data });
  }

  async updatePage(slug: string, data: { title?: string }) {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('Page not found');
    return this.prisma.page.update({ where: { slug }, data });
  }

  async createBlock(slug: string, data: { type: string; order?: number; enabled?: boolean; data: unknown }) {
    const page = await this.prisma.page.findUnique({ where: { slug }, include: { blocks: true } });
    if (!page) throw new NotFoundException('Page not found');
    const order = data.order ?? page.blocks.length;
    return this.prisma.block.create({
      data: {
        pageId: page.id,
        type: data.type,
        order,
        enabled: data.enabled ?? true,
        data: data.data as never,
      },
    });
  }

  async updateBlock(id: number, data: { enabled?: boolean; order?: number; data?: unknown; type?: string }) {
    const block = await this.prisma.block.findUnique({ where: { id } });
    if (!block) throw new NotFoundException('Block not found');
    return this.prisma.block.update({
      where: { id },
      data: {
        ...(data.enabled !== undefined ? { enabled: data.enabled } : {}),
        ...(data.order !== undefined ? { order: data.order } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.data !== undefined ? { data: data.data as never } : {}),
      },
    });
  }

  async deleteBlock(id: number) {
    const block = await this.prisma.block.findUnique({ where: { id } });
    if (!block) throw new NotFoundException('Block not found');
    await this.prisma.block.delete({ where: { id } });
    return { ok: true };
  }

  async reorderBlocks(slug: string, orderedIds: number[]) {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('Page not found');
    await this.prisma.$transaction(
      orderedIds.map((id, index) => this.prisma.block.update({ where: { id }, data: { order: index } })),
    );
    return { ok: true };
  }

  async search(q: string) {
    const term = q.trim().toLowerCase();
    if (!term) return { pages: [], blocks: [] };

    const pages = await this.prisma.page.findMany({
      where: {
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { slug: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: 5,
      include: { _count: { select: { blocks: true } } },
    });

    const allBlocks = await this.prisma.block.findMany({
      orderBy: { id: 'asc' },
      include: { page: { select: { slug: true, title: true } } },
      take: 200,
    });

    const blocks = allBlocks
      .map((b) => {
        const data = (b.data ?? {}) as Record<string, unknown>;
        const hit = Object.entries(data).find(
          ([, v]) => typeof v === 'string' && v.toLowerCase().includes(term),
        );
        return hit ? { block: b, key: hit[0], value: hit[1] as string } : null;
      })
      .filter((x): x is { block: typeof allBlocks[number]; key: string; value: string } => x !== null)
      .slice(0, 10)
      .map(({ block, key, value }) => ({
        id: block.id,
        type: block.type,
        pageSlug: block.page.slug,
        pageTitle: block.page.title,
        matchKey: key,
        matchValue: value.length > 120 ? value.slice(0, 117) + '…' : value,
        enabled: block.enabled,
      }));

    return { pages, blocks };
  }

  async getPublicPage(slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: {
        blocks: { where: { enabled: true }, orderBy: { order: 'asc' } },
        seo: true,
      },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async upsertSeo(slug: string, data: { title: string; description: string; keywords?: string; ogImage?: string }) {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('Page not found');
    return this.prisma.seo.upsert({
      where: { pageId: page.id },
      update: data,
      create: { pageId: page.id, ...data },
    });
  }
}
