/**
 * CMS seed — populates pages, blocks and SEO based on the actual landing site.
 * Re-runnable: existing blocks/SEO are replaced. Pages are upserted by slug.
 *
 * Each block represents one <section> on the landing, with the *section-level*
 * editable strings (eyebrow / heading / lead / cta labels). Cards and feature
 * items inside sections are still part of the static HTML; editing them
 * requires an extension to the block schema later on.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PageSeed {
  slug: string;
  title: string;
  seo: { title: string; description: string; keywords?: string };
  blocks: Array<{ type: string; data: Record<string, string> }>;
}

const PAGES: PageSeed[] = [
  // ---------- HOME ----------
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
            'Jetsonic Trading FZCO helps airlines, MRO centers, private operators and aviation brokers send precise part requests, align FAA/EASA documentation and move urgent orders through a disciplined sourcing path.',
          leadAr:
            'تساعد Jetsonic Trading FZCO شركات الطيران ومراكز الصيانة والمشغلين والوسطاء على إرسال طلبات قطع دقيقة ومواءمة وثائق FAA/EASA وتحريك الطلبات العاجلة عبر مسار توريد منضبط.',
          primaryCtaEn: 'Submit AOG request',
          primaryCtaAr: 'إرسال طلب AOG',
          secondaryCtaEn: 'Request part quote',
          secondaryCtaAr: 'طلب عرض قطعة',
        },
      },
      {
        type: 'intro-process',
        data: {
          eyebrowEn: 'Aircraft parts sourcing desk',
          eyebrowAr: 'مكتب توريد قطع الطائرات',
          headingEn: 'A structured entry point for urgent AOG requests and planned aircraft parts procurement.',
          headingAr: 'نقطة دخول منظمة لطلبات AOG العاجلة ومشتريات قطع الطائرات المخططة.',
          leadEn:
            'Jetsonic gives procurement teams a clear path to send part numbers, aircraft details, certificate requirements, delivery location and urgency so the sourcing process can begin with complete data.',
          leadAr:
            'تمنح Jetsonic فرق المشتريات مساراً واضحاً لإرسال أرقام القطع وتفاصيل الطائرة ومتطلبات الشهادات وموقع التسليم والسرعة حتى يبدأ التوريد ببيانات كاملة.',
          ctaEn: 'Open RFQ form',
          ctaAr: 'افتح نموذج RFQ',
        },
      },
      {
        type: 'feature-grid',
        data: {
          eyebrowEn: 'Built for aviation procurement',
          eyebrowAr: 'مصمم لمشتريات الطيران',
          headingEn: 'A professional request flow for aviation procurement.',
          headingAr: 'مسار طلبات احترافي لمشتريات الطيران.',
          leadEn:
            'The request flow is designed to improve RFQ quality, reduce clarification time and give buyers confidence through clear documentation, sourcing discipline and delivery planning.',
          leadAr:
            'تم تصميم مسار الطلب لتحسين جودة RFQ وتقليل وقت التوضيح ومنح المشترين ثقة عبر الوثائق الواضحة وانضباط التوريد وتخطيط التسليم.',
        },
      },
      {
        type: 'feature-grid',
        data: {
          eyebrowEn: 'Core services',
          eyebrowAr: 'الخدمات الأساسية',
          headingEn: 'Clear service areas for faster technical requests.',
          headingAr: 'مجالات خدمة واضحة لطلبات فنية أسرع.',
        },
      },
      {
        type: 'feature-grid',
        data: {
          eyebrowEn: 'Lifecycle parts support',
          eyebrowAr: 'دعم دورة حياة القطع',
          headingEn: 'Purchase, sale, exchange, lease and repair support for aircraft and helicopter parts.',
          headingAr: 'دعم الشراء والبيع والتبادل والتأجير والإصلاح لقطع الطائرات والمروحيات.',
          leadEn:
            'Jetsonic supports civil aircraft and helicopter components across different conditions: serviceable parts, repairable units removed from operation, and defective but recoverable stock that can move through a disciplined repair or exchange path.',
          leadAr:
            'تدعم Jetsonic مكونات الطائرات المدنية والمروحيات في حالات مختلفة: قطع صالحة للخدمة، وحدات قابلة للإصلاح تم سحبها من التشغيل، ومخزون معطل قابل للاستعادة يمكن نقله عبر مسار إصلاح أو تبادل منظم.',
        },
      },
      {
        type: 'split',
        data: {
          eyebrowEn: 'Target customers',
          eyebrowAr: 'العملاء المستهدفون',
          headingEn: 'Built for airlines, MRO centers, operators and brokers.',
          headingAr: 'مصمم لشركات الطيران ومراكز الصيانة والمشغلين والوسطاء.',
          leadEn:
            'Airlines need uptime. MRO centers need clear technical data. Private operators need speed and reliability. Brokers need a disciplined sourcing partner. Each group receives a clear reason to send a request with complete technical data.',
          leadAr:
            'تحتاج شركات الطيران إلى جاهزية التشغيل. تحتاج مراكز الصيانة إلى بيانات فنية واضحة. يحتاج المشغلون الخاصون إلى السرعة والاعتمادية. يحتاج الوسطاء إلى شريك توريد منضبط. تحصل كل مجموعة على سبب واضح لإرسال طلب ببيانات فنية كاملة.',
        },
      },
      {
        type: 'visual-band',
        data: {
          eyebrowEn: 'Global sourcing, regional delivery',
          eyebrowAr: 'توريد عالمي وتسليم إقليمي',
          headingEn: 'From US, Europe and UAE suppliers to Kazakhstan, Central Asia and the Middle East.',
          headingAr: 'من موردي الولايات المتحدة وأوروبا والإمارات إلى كازاخستان وآسيا الوسطى والشرق الأوسط.',
          leadEn:
            'Dubai serves as the operating base for global supplier access and regional aviation support across Kazakhstan, Central Asia and the Middle East.',
          leadAr:
            'تعمل دبي كقاعدة تشغيلية للوصول إلى الموردين العالميين ودعم عملاء الطيران في كازاخستان وآسيا الوسطى والشرق الأوسط.',
        },
      },
      {
        type: 'cta-band',
        data: {
          eyebrowEn: 'Start request',
          eyebrowAr: 'ابدأ الطلب',
          headingEn: 'Send a precise RFQ and start the sourcing path.',
          headingAr: 'أرسل RFQ دقيق وابدأ مسار التوريد.',
          leadEn:
            'Choose AOG or standard RFQ, attach files and send the technical data required for availability, documents and delivery review.',
          leadAr:
            'اختر AOG أو RFQ عادي، أرفق الملفات وأرسل البيانات الفنية المطلوبة لمراجعة التوفر والوثائق والتسليم.',
          ctaEn: 'Open RFQ form',
          ctaAr: 'افتح نموذج RFQ',
        },
      },
    ],
  },

  // ---------- ABOUT ----------
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
          headingEn: 'A lean aviation sourcing company built around speed, trust and documentation.',
          headingAr: 'شركة توريد طيران مرنة مبنية حول السرعة والثقة والوثائق.',
          leadEn:
            'Jetsonic Trading FZCO is positioned from Dubai Silicon Oasis to support aviation buyers across Kazakhstan, Central Asia and the Middle East through global supplier access and disciplined request handling.',
          leadAr:
            'تتمركز Jetsonic Trading FZCO في Dubai Silicon Oasis لدعم مشتري الطيران في كازاخستان وآسيا الوسطى والشرق الأوسط عبر وصول عالمي للموردين ومعالجة طلبات منضبطة.',
        },
      },
      {
        type: 'split',
        data: {
          eyebrowEn: 'Market logic',
          eyebrowAr: 'منطق السوق',
          headingEn: 'The business works when buyers can request quickly and trust the process.',
          headingAr: 'ينجح العمل عندما يستطيع المشترون الطلب بسرعة والثقة بالمسار.',
          leadEn:
            'Jetsonic reflects this logic through supplier access, AOG support, documentation control, logistics coordination and precise RFQ data from the first request.',
          leadAr:
            'تعكس Jetsonic هذا المنطق عبر وصول الموردين ودعم AOG وضبط الوثائق وتنسيق اللوجستيات وبيانات RFQ دقيقة من أول طلب.',
        },
      },
      {
        type: 'feature-grid',
        data: {
          eyebrowEn: 'Strategic focus',
          eyebrowAr: 'التركيز الاستراتيجي',
          headingEn: 'What Jetsonic builds for aviation buyers.',
          headingAr: 'ما تبنيه Jetsonic لمشتري الطيران.',
        },
      },
      {
        type: 'cta-band',
        data: {
          eyebrowEn: 'Start cooperation',
          eyebrowAr: 'ابدأ التعاون',
          headingEn: 'Send the first RFQ and build the relationship from clarity.',
          headingAr: 'أرسل أول RFQ وابنِ العلاقة من الوضوح.',
          ctaEn: 'Request quote',
          ctaAr: 'طلب عرض',
        },
      },
    ],
  },

  // ---------- AOG ----------
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
          eyebrowEn: 'AOG priority',
          eyebrowAr: 'أولوية AOG',
          headingEn: 'When aircraft downtime is the risk, the request path must be fast and precise.',
          headingAr: 'عندما يكون توقف الطائرة هو الخطر، يجب أن يكون مسار الطلب سريعاً ودقيقاً.',
          leadEn:
            'Jetsonic treats AOG requests as priority cases, helping buyers submit the exact technical and delivery details needed for fast availability checks and logistics review.',
          leadAr:
            'تتعامل Jetsonic مع طلبات AOG كحالات أولوية وتساعد المشترين على إرسال التفاصيل الفنية وتفاصيل التسليم اللازمة لفحص التوفر ومراجعة اللوجستيات بسرعة.',
          primaryCtaEn: 'Submit AOG request',
          primaryCtaAr: 'إرسال طلب AOG',
          secondaryCtaEn: 'Standard RFQ',
          secondaryCtaAr: 'RFQ عادي',
        },
      },
      {
        type: 'timeline',
        data: {
          eyebrowEn: 'AOG workflow',
          eyebrowAr: 'مسار AOG',
          headingEn: 'A clean response path creates confidence under pressure.',
          headingAr: 'مسار استجابة واضح يخلق الثقة تحت الضغط.',
        },
      },
      {
        type: 'split-checklist',
        data: {
          eyebrowEn: 'AOG data checklist',
          eyebrowAr: 'قائمة بيانات AOG',
          headingEn: 'What the buyer should send immediately.',
          headingAr: 'ما يجب على المشتري إرساله فوراً.',
          leadEn:
            'AOG response depends on clarity. Complete technical data helps reduce missed details and supports faster supplier and logistics coordination.',
          leadAr:
            'تعتمد استجابة AOG على الوضوح. تساعد البيانات الفنية الكاملة على تقليل التفاصيل المفقودة ودعم تنسيق أسرع مع الموردين واللوجستيات.',
        },
      },
      {
        type: 'cta-band',
        data: {
          eyebrowEn: 'Urgent request',
          eyebrowAr: 'طلب عاجل',
          headingEn: 'Use the AOG path when time is the real cost.',
          headingAr: 'استخدم مسار AOG عندما يكون الوقت هو التكلفة الحقيقية.',
          ctaEn: 'Submit AOG request',
          ctaAr: 'إرسال طلب AOG',
        },
      },
    ],
  },

  // ---------- PARTS ----------
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
          eyebrowEn: 'Parts coverage',
          eyebrowAr: 'تغطية القطع',
          headingEn: 'Aircraft components organized for fast RFQ decisions.',
          headingAr: 'مكونات طائرات منظمة لاتخاذ قرارات RFQ أسرع.',
          leadEn:
            'Buyers can quickly understand what Jetsonic can source and send the correct technical details for availability, certificates and delivery planning.',
          leadAr:
            'يمكن للمشترين فهم ما يمكن لـ Jetsonic توريده بسرعة وإرسال التفاصيل الفنية الصحيحة للتوفر والشهادات وتخطيط التسليم.',
          primaryCtaEn: 'Request a part',
          primaryCtaAr: 'اطلب قطعة',
          secondaryCtaEn: 'AOG support',
          secondaryCtaAr: 'دعم AOG',
        },
      },
      {
        type: 'feature-grid',
        data: {
          eyebrowEn: 'Product lines',
          eyebrowAr: 'خطوط المنتجات',
          headingEn: 'Clear part categories help procurement teams send faster, more complete requests.',
          headingAr: 'تساعد فئات القطع الواضحة فرق المشتريات على إرسال طلبات أسرع وأكثر اكتمالاً.',
        },
      },
      {
        type: 'split-checklist',
        data: {
          eyebrowEn: 'What to send',
          eyebrowAr: 'ما يجب إرساله',
          headingEn: 'The better the technical data, the faster the sourcing path.',
          headingAr: 'كلما كانت البيانات الفنية أفضل، كان مسار التوريد أسرع.',
          leadEn:
            'A strong request includes part number, alternative part number, quantity, condition, certificate requirement, aircraft type, delivery airport and target date.',
          leadAr:
            'يتضمن الطلب القوي رقم القطعة والرقم البديل والكمية والحالة ومتطلبات الشهادة ونوع الطائرة ومطار التسليم والتاريخ المستهدف.',
        },
      },
      {
        type: 'cta-band',
        data: {
          eyebrowEn: 'Ready to request',
          eyebrowAr: 'جاهز للطلب',
          headingEn: 'Send a part number and let the team start from clean data.',
          headingAr: 'أرسل رقم القطعة ودع الفريق يبدأ من بيانات واضحة.',
          ctaEn: 'Submit RFQ',
          ctaAr: 'إرسال RFQ',
        },
      },
    ],
  },

  // ---------- SERVICES ----------
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
          headingEn:
            'Aircraft parts sourcing services built around speed, documentation and reliable delivery coordination.',
          headingAr: 'خدمات توريد قطع طائرات مبنية حول السرعة والوثائق وتنسيق التسليم الموثوق.',
          leadEn:
            'Jetsonic supports aviation buyers with urgent sourcing, supplier comparison, document alignment and delivery coordination through Dubai based procurement routes.',
          leadAr:
            'تدعم Jetsonic مشتري الطيران عبر التوريد العاجل ومقارنة الموردين ومواءمة الوثائق وتنسيق التسليم من خلال مسارات شراء قائمة في دبي.',
        },
      },
      {
        type: 'feature-grid',
        data: {
          eyebrowEn: 'Service modules',
          eyebrowAr: 'وحدات الخدمة',
          headingEn: 'Services designed for aircraft uptime, sourcing clarity and procurement confidence.',
          headingAr: 'خدمات مصممة لجاهزية الطائرات ووضوح التوريد وثقة المشتريات.',
        },
      },
    ],
  },

  // ---------- QUALITY ----------
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
          eyebrowEn: 'Quality and documents',
          eyebrowAr: 'الجودة والوثائق',
          headingEn: 'In aviation sourcing, documentation is part of the product.',
          headingAr: 'في توريد الطيران، الوثائق جزء من المنتج.',
          leadEn:
            'Jetsonic keeps documentation at the center of every sourcing request, from certificate needs and traceability to release and shipping paperwork.',
          leadAr:
            'تضع Jetsonic الوثائق في قلب كل طلب توريد، من متطلبات الشهادات والتتبع إلى أوراق الإفراج والشحن.',
        },
      },
      {
        type: 'split-checklist',
        data: {
          eyebrowEn: 'Trust signals',
          eyebrowAr: 'إشارات الثقة',
          headingEn: 'Procurement teams need proof before they need persuasion.',
          headingAr: 'فرق المشتريات تحتاج إلى دليل قبل الإقناع.',
          leadEn:
            'Jetsonic highlights certificate expectations, condition requirements, supplier documentation, invoices and shipping documents so procurement teams can evaluate each request with greater confidence.',
          leadAr:
            'توضح Jetsonic توقعات الشهادات ومتطلبات الحالة ووثائق الموردين والفواتير ووثائق الشحن حتى تتمكن فرق المشتريات من تقييم كل طلب بثقة أكبر.',
        },
      },
    ],
  },

  // ---------- CONTACT ----------
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
          eyebrowEn: 'Professional RFQ intake',
          eyebrowAr: 'استقبال RFQ احترافي',
          headingEn: 'Send AOG or standard RFQ details in one clear form.',
          headingAr: 'أرسل تفاصيل AOG أو RFQ عادي في نموذج واحد واضح.',
          leadEn:
            'Use this form to submit part numbers, alternate references, aircraft type, ATA chapter, required condition, certificate need, urgency, delivery point and supporting files.',
          leadAr:
            'استخدم هذا النموذج لإرسال أرقام القطع والمراجع البديلة ونوع الطائرة وفصل ATA والحالة المطلوبة ومتطلبات الشهادة والسرعة ومكان التسليم والملفات الداعمة.',
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

    // Replace all blocks for this page with the fresh seed (idempotent).
    await prisma.block.deleteMany({ where: { pageId: page.id } });

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

    console.log(`Reseeded ${p.slug.padEnd(10)} → ${p.blocks.length} blocks, SEO ✓`);
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
