import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PAGES: Array<{
  slug: string;
  title: string;
  seo: { title: string; description: string; keywords?: string };
  blocks: Array<{ type: string; data: Record<string, unknown> }>;
}> = [
  {
    slug: 'home',
    title: 'Home',
    seo: {
      title: 'Jetsonic Trading FZCO | Aircraft Parts RFQ and AOG Support',
      description:
        'Dubai based aircraft parts sourcing, AOG support, RFQ intake and documentation control for aviation buyers.',
      keywords: 'aircraft parts, AOG, RFQ, FAA 8130-3, EASA Form 1, Dubai aviation, parts sourcing',
    },
    blocks: [
      {
        type: 'hero',
        data: {
          eyebrowEn: 'AOG and RFQ request platform from Dubai',
          eyebrowAr: 'منصة طلبات AOG و RFQ من دبي',
          headingEn: 'Certified aircraft parts sourcing and AOG support for Central Asia and the Middle East.',
          headingAr: 'توريد قطع طائرات موثقة ودعم AOG لآسيا الوسطى والشرق الأوسط.',
          leadEn:
            'Jetsonic Trading FZCO helps airlines, MRO centers, private operators and aviation brokers send precise part requests.',
          leadAr: 'تساعد Jetsonic Trading FZCO شركات الطيران ومراكز الصيانة والمشغلين والوسطاء على إرسال طلبات قطع دقيقة.',
          primaryCtaEn: 'Submit AOG request',
          primaryCtaAr: 'إرسال طلب AOG',
          primaryCtaHref: '/contact/?request=aog#rfq',
          secondaryCtaEn: 'Request part quote',
          secondaryCtaAr: 'طلب عرض قطعة',
          secondaryCtaHref: '/contact/#rfq',
          imageUrl: '/assets/hero-aircraft.jpg',
        },
      },
      {
        type: 'process',
        data: {
          eyebrowEn: 'Aircraft parts sourcing desk',
          eyebrowAr: 'مكتب توريد قطع الطائرات',
          headingEn: 'A structured entry point for urgent AOG requests and planned procurement.',
          headingAr: 'نقطة دخول منظمة لطلبات AOG العاجلة والمشتريات المخططة.',
        },
      },
      {
        type: 'feature-grid',
        data: {
          eyebrowEn: 'Built for aviation procurement',
          eyebrowAr: 'مصمم لمشتريات الطيران',
          headingEn: 'Aircraft parts service that fits procurement workflows.',
          headingAr: 'خدمة قطع طائرات تتناسب مع سير عمل المشتريات.',
        },
      },
      {
        type: 'feature-grid',
        data: {
          eyebrowEn: 'Lifecycle parts support',
          eyebrowAr: 'دعم دورة حياة القطع',
          headingEn: 'Purchase, sale, exchange, lease and repair support for aircraft and helicopter parts.',
          headingAr: 'دعم الشراء والبيع والتبادل والتأجير والإصلاح لقطع الطائرات والمروحيات.',
        },
      },
      {
        type: 'split',
        data: {
          eyebrowEn: 'Target customers',
          eyebrowAr: 'العملاء المستهدفون',
          headingEn: 'Built for airlines, MRO centers, operators and brokers.',
          headingAr: 'مصمم لشركات الطيران ومراكز الصيانة والمشغلين والوسطاء.',
        },
      },
      {
        type: 'cta-band',
        data: {
          headingEn: 'Send a part request and get a structured response.',
          headingAr: 'أرسل طلب قطعة واحصل على رد منظم.',
          ctaEn: 'Open RFQ form',
          ctaAr: 'افتح نموذج RFQ',
          ctaHref: '/contact/#rfq',
        },
      },
    ],
  },
  {
    slug: 'about',
    title: 'Company',
    seo: {
      title: 'About Jetsonic Trading FZCO | Aviation Sourcing in Dubai',
      description:
        'Jetsonic Trading FZCO supports aircraft parts sourcing, AOG response and documentation discipline from a Dubai base.',
      keywords: 'Jetsonic Trading FZCO, Dubai aviation company, aircraft parts trader, FZCO aviation',
    },
    blocks: [
      {
        type: 'page-hero',
        data: {
          eyebrowEn: 'Company',
          eyebrowAr: 'الشركة',
          headingEn: 'Dubai based aviation parts trading and AOG support.',
          headingAr: 'تجارة قطع الطيران ودعم AOG من دبي.',
        },
      },
    ],
  },
  {
    slug: 'aog',
    title: 'AOG',
    seo: {
      title: 'AOG Support | Jetsonic Trading FZCO',
      description:
        'Aircraft On Ground urgent parts sourcing and documentation review from Dubai. Submit AOG requests with full technical data.',
      keywords: 'AOG, aircraft on ground, urgent parts, AOG sourcing Dubai',
    },
    blocks: [
      {
        type: 'page-hero',
        data: {
          eyebrowEn: 'AOG response',
          eyebrowAr: 'استجابة AOG',
          headingEn: 'Urgent AOG parts sourcing with disciplined documentation handling.',
          headingAr: 'توريد قطع AOG العاجلة مع معالجة منضبطة للوثائق.',
        },
      },
    ],
  },
  {
    slug: 'parts',
    title: 'Parts',
    seo: {
      title: 'Aircraft Parts Sourcing | Jetsonic Trading FZCO',
      description:
        'Sourcing for new, serviceable, overhauled and repairable aircraft parts with FAA 8130-3 and EASA Form 1 alignment.',
      keywords: 'aircraft parts sourcing, serviceable parts, overhauled parts, FAA 8130-3, EASA Form 1',
    },
    blocks: [
      {
        type: 'page-hero',
        data: {
          eyebrowEn: 'Aircraft parts',
          eyebrowAr: 'قطع الطائرات',
          headingEn: 'Sourcing for civil aircraft and helicopter components.',
          headingAr: 'توريد مكونات الطائرات المدنية والمروحيات.',
        },
      },
    ],
  },
  {
    slug: 'services',
    title: 'Services',
    seo: {
      title: 'Services | Jetsonic Trading FZCO',
      description:
        'RFQ handling, supplier search, document control and delivery coordination for aviation buyers.',
      keywords: 'aviation services, RFQ handling, supplier search, document control',
    },
    blocks: [
      {
        type: 'page-hero',
        data: {
          eyebrowEn: 'Services',
          eyebrowAr: 'الخدمات',
          headingEn: 'Structured services for aviation procurement teams.',
          headingAr: 'خدمات منظمة لفرق مشتريات الطيران.',
        },
      },
    ],
  },
  {
    slug: 'quality',
    title: 'Quality',
    seo: {
      title: 'Quality and Documentation | Jetsonic Trading FZCO',
      description:
        'Document discipline for FAA 8130-3, EASA Form 1, CoC and traceability across aircraft parts requests.',
      keywords: 'quality control aviation, FAA 8130-3, EASA Form 1, CoC, traceability',
    },
    blocks: [
      {
        type: 'page-hero',
        data: {
          eyebrowEn: 'Quality discipline',
          eyebrowAr: 'انضباط الجودة',
          headingEn: 'Documentation discipline for every aircraft parts request.',
          headingAr: 'انضباط الوثائق لكل طلب قطع طائرات.',
        },
      },
    ],
  },
  {
    slug: 'contact',
    title: 'Contact',
    seo: {
      title: 'Contact and RFQ Form | Jetsonic Trading FZCO',
      description:
        'Send an aircraft parts RFQ or AOG request with part number, urgency and certificate requirements.',
      keywords: 'aviation RFQ form, AOG request, contact Jetsonic',
    },
    blocks: [
      {
        type: 'page-hero',
        data: {
          eyebrowEn: 'Contact and RFQ',
          eyebrowAr: 'الاتصال و RFQ',
          headingEn: 'Send a structured aircraft parts request.',
          headingAr: 'أرسل طلب قطع طائرة منظم.',
        },
      },
    ],
  },
];

async function main() {
  for (const p of PAGES) {
    const page = await prisma.page.upsert({
      where: { slug: p.slug },
      update: { title: p.title },
      create: { slug: p.slug, title: p.title },
    });

    await prisma.seo.upsert({
      where: { pageId: page.id },
      update: p.seo,
      create: { pageId: page.id, ...p.seo },
    });

    const existing = await prisma.block.findMany({ where: { pageId: page.id } });
    if (existing.length === 0) {
      for (let i = 0; i < p.blocks.length; i++) {
        const b = p.blocks[i];
        await prisma.block.create({
          data: {
            pageId: page.id,
            type: b.type,
            order: i,
            enabled: true,
            data: b.data as never,
          },
        });
      }
      console.log(`Seeded ${p.slug} with ${p.blocks.length} blocks`);
    } else {
      console.log(`Skipped ${p.slug} (already has ${existing.length} blocks)`);
    }
  }

  console.log('\nCMS seed complete.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
