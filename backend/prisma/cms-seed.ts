/**
 * CMS seed — full content from the actual landing site.
 * Every text element of every section is editable. The admin editor groups
 * fields by prefix (Section / Card N / Step N / Stat N etc.) and renders
 * human-readable labels.
 *
 * Re-runnable: existing blocks of a page are deleted and re-created.
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
      title: 'Jetsonic Trading FZCO | Aircraft Parts & AOG Support in Dubai',
      description:
        'Dubai-based aircraft parts trading FZCO. AOG response 24/7, RFQ handling, FAA 8130-3 & EASA Form 1 documentation. Sourcing across US, Europe, UAE, Kazakhstan and Central Asia.',
      keywords:
        'aircraft parts Dubai, aircraft parts UAE, AOG support Dubai, AOG support Middle East, RFQ aviation, RFQ aircraft parts, aircraft components supplier, aviation sourcing Dubai, FAA 8130-3 parts, EASA Form 1 parts, certified aircraft parts, aviation logistics Dubai, aircraft spares UAE, helicopter parts Dubai, aircraft parts trader, aviation procurement Dubai, IFZA Business Park aviation, Dubai Silicon Oasis aviation, Jetsonic Trading, Jetsonic FZCO, aviation supply Kazakhstan, aircraft parts Central Asia, aviation parts broker, used serviceable material UAE, USM aviation Dubai, aircraft rotables Dubai, aviation consumables supplier, aircraft tools GSE Dubai',
    },
    blocks: [
      // 1. Hero
      {
        type: 'hero',
        data: {
          eyebrow_en: 'AOG and RFQ request platform from Dubai',
          eyebrow_ar: 'منصة طلبات AOG و RFQ من دبي',
          heading_en: 'Certified aircraft parts sourcing and AOG support for Central Asia and the Middle East.',
          heading_ar: 'توريد قطع طائرات موثقة ودعم AOG لآسيا الوسطى والشرق الأوسط.',
          lead_en:
            'Jetsonic Trading FZCO helps airlines, MRO centers, private operators and aviation brokers send precise part requests, align FAA/EASA documentation and move urgent orders through a disciplined sourcing path.',
          lead_ar:
            'تساعد Jetsonic Trading FZCO شركات الطيران ومراكز الصيانة والمشغلين والوسطاء على إرسال طلبات قطع دقيقة ومواءمة وثائق FAA/EASA وتحريك الطلبات العاجلة عبر مسار توريد منضبط.',
          primary_cta_en: 'Submit AOG request',
          primary_cta_ar: 'إرسال طلب AOG',
          primary_cta_href: '/contact/?request=aog#rfq',
          secondary_cta_en: 'Request part quote',
          secondary_cta_ar: 'طلب عرض قطعة',
          secondary_cta_href: '/contact/#rfq',
          stat_1_value: '30–60 min',
          stat_1_label_en: 'Initial sourcing review',
          stat_1_label_ar: 'مراجعة توريد أولية',
          stat_2_value: '24–48 h',
          stat_2_label_en: 'Regional delivery path',
          stat_2_label_ar: 'مسار تسليم إقليمي',
          stat_3_value: 'FAA / EASA',
          stat_3_label_en: 'Certificate focus',
          stat_3_label_ar: 'تركيز على الشهادات',
        },
      },
      // 2. Intro + process
      {
        type: 'intro-process',
        data: {
          eyebrow_en: 'Aircraft parts sourcing desk',
          eyebrow_ar: 'مكتب توريد قطع الطائرات',
          heading_en: 'A structured entry point for urgent AOG requests and planned aircraft parts procurement.',
          heading_ar: 'نقطة دخول منظمة لطلبات AOG العاجلة ومشتريات قطع الطائرات المخططة.',
          lead_en:
            'Jetsonic gives procurement teams a clear path to send part numbers, aircraft details, certificate requirements, delivery location and urgency so the sourcing process can begin with complete data.',
          lead_ar:
            'تمنح Jetsonic فرق المشتريات مساراً واضحاً لإرسال أرقام القطع وتفاصيل الطائرة ومتطلبات الشهادات وموقع التسليم والسرعة حتى يبدأ التوريد ببيانات كاملة.',
          cta_en: 'Open RFQ form',
          cta_ar: 'افتح نموذج RFQ',
          step_1_title_en: 'Request captured',
          step_1_title_ar: 'التقاط الطلب',
          step_1_desc_en:
            'AOG or standard RFQ with part number, alternate part number, aircraft type, ATA chapter and urgency.',
          step_1_desc_ar:
            'طلب AOG أو RFQ عادي مع رقم القطعة والرقم البديل ونوع الطائرة وفصل ATA والسرعة.',
          step_2_title_en: 'Supplier search',
          step_2_title_ar: 'بحث الموردين',
          step_2_desc_en:
            'United States, Europe and UAE availability routes are reviewed for price, condition and delivery timing.',
          step_2_desc_ar:
            'تتم مراجعة مسارات التوفر في الولايات المتحدة وأوروبا والإمارات حسب السعر والحالة ووقت التسليم.',
          step_3_title_en: 'Documents checked',
          step_3_title_ar: 'فحص الوثائق',
          step_3_desc_en:
            'FAA 8130 3, EASA Form 1, CoC, traceability and shipping documents are aligned before quotation.',
          step_3_desc_ar:
            'تتم مواءمة FAA 8130 3 و EASA Form 1 و CoC والتتبع ووثائق الشحن قبل العرض.',
          step_4_title_en: 'Quote and follow up',
          step_4_title_ar: 'العرض والمتابعة',
          step_4_desc_en:
            'The request is reviewed, prioritized and moved into supplier search, quotation and delivery coordination.',
          step_4_desc_ar:
            'تتم مراجعة الطلب وترتيبه حسب الأولوية ثم نقله إلى بحث الموردين والعرض وتنسيق التسليم.',
        },
      },
      // 3. Built for aviation procurement — 4 cards
      {
        type: 'feature-grid',
        data: {
          eyebrow_en: 'Built for aviation procurement',
          eyebrow_ar: 'مصمم لمشتريات الطيران',
          heading_en: 'A professional request flow for aviation procurement.',
          heading_ar: 'مسار طلبات احترافي لمشتريات الطيران.',
          lead_en:
            'The request flow is designed to improve RFQ quality, reduce clarification time and give buyers confidence through clear documentation, sourcing discipline and delivery planning.',
          lead_ar:
            'تم تصميم مسار الطلب لتحسين جودة RFQ وتقليل وقت التوضيح ومنح المشترين ثقة عبر الوثائق الواضحة وانضباط التوريد وتخطيط التسليم.',
          card_1_title_en: 'AOG priority path',
          card_1_title_ar: 'مسار AOG عاجل',
          card_1_desc_en:
            'Separate urgent path for grounded aircraft, with the required technical fields and a faster contact logic.',
          card_1_desc_ar: 'مسار عاجل منفصل للطائرات المتوقفة مع الحقول الفنية المطلوبة ومنطق تواصل أسرع.',
          card_1_cta_en: 'Send RFQ',
          card_1_cta_ar: 'أرسل طلب عرض',
          card_2_title_en: 'Structured RFQ data',
          card_2_title_ar: 'بيانات RFQ منظمة',
          card_2_desc_en:
            'Requests capture the technical and commercial details needed to prepare a clear supplier search and quote response.',
          card_2_desc_ar:
            'تلتقط الطلبات التفاصيل الفنية والتجارية اللازمة لإعداد بحث موردين واضح واستجابة عرض سعر.',
          card_2_cta_en: 'Send RFQ',
          card_2_cta_ar: 'أرسل طلب عرض',
          card_3_title_en: 'Document control',
          card_3_title_ar: 'ضبط الوثائق',
          card_3_desc_en:
            'Dedicated communication around FAA 8130 3, EASA Form 1, CoC, traceability and shipping documents.',
          card_3_desc_ar: 'تواصل مخصص حول FAA 8130 3 و EASA Form 1 و CoC والتتبع ووثائق الشحن.',
          card_3_cta_en: 'Send RFQ',
          card_3_cta_ar: 'أرسل طلب عرض',
          card_4_title_en: 'Request visibility',
          card_4_title_ar: 'رؤية الطلبات',
          card_4_desc_en:
            'Requests can be reviewed by country, part category, urgency, quotation status and delivery route to improve decision making.',
          card_4_desc_ar:
            'يمكن مراجعة الطلبات حسب البلد وفئة القطعة والسرعة وحالة العرض ومسار التسليم لتحسين القرار.',
          card_4_cta_en: 'Send RFQ',
          card_4_cta_ar: 'أرسل طلب عرض',
        },
      },
      // 4. Core services — 6 cards
      {
        type: 'feature-grid',
        data: {
          eyebrow_en: 'Core services',
          eyebrow_ar: 'الخدمات الأساسية',
          heading_en: 'Clear service areas for faster technical requests.',
          heading_ar: 'مجالات خدمة واضحة لطلبات فنية أسرع.',
          card_1_title_en: 'Aircraft components',
          card_1_title_ar: 'مكونات الطائرات',
          card_1_desc_en:
            'Rotables, avionics, hydraulic components, landing gear elements, fuel systems, control units and general consumables.',
          card_1_desc_ar:
            'روتيبلز، أفيونيكس، مكونات هيدروليك، عناصر هبوط، أنظمة وقود، وحدات تحكم ومواد استهلاكية عامة.',
          card_1_cta_en: 'View parts',
          card_1_cta_ar: 'عرض القطع',
          card_2_title_en: 'USM and expendables',
          card_2_title_ar: 'USM والمواد الاستهلاكية',
          card_2_desc_en:
            'Certified serviceable material, repaired or overhauled components, filters, seals, fasteners, chemicals and lubricants.',
          card_2_desc_ar:
            'مواد صالحة للخدمة وموثقة، مكونات مصلحة أو مجددة، فلاتر، أختام، مثبتات، كيماويات وزيوت.',
          card_2_cta_en: 'See coverage',
          card_2_cta_ar: 'عرض التغطية',
          card_3_title_en: 'Tools and GSE',
          card_3_title_ar: 'الأدوات و GSE',
          card_3_desc_en:
            'Specialized aviation tools, ground support equipment and test equipment for maintenance operations.',
          card_3_desc_ar: 'أدوات طيران متخصصة، معدات دعم أرضي ومعدات اختبار لعمليات الصيانة.',
          card_3_cta_en: 'Explore services',
          card_3_cta_ar: 'استعرض الخدمات',
          card_4_title_en: 'Logistics coordination',
          card_4_title_ar: 'تنسيق اللوجستيات',
          card_4_desc_en:
            'DHL, FedEx, Aramex and Emirates SkyCargo routes can be aligned with urgency and destination requirements.',
          card_4_desc_ar:
            'يمكن مواءمة مسارات DHL و FedEx و Aramex و Emirates SkyCargo مع السرعة ومتطلبات الوجهة.',
          card_4_cta_en: 'Plan delivery',
          card_4_cta_ar: 'خطط التسليم',
          card_5_title_en: 'Quality and compliance',
          card_5_title_ar: 'الجودة والامتثال',
          card_5_desc_en:
            'Documentation needs are clarified before quotation to reduce risk and support procurement confidence.',
          card_5_desc_ar: 'يتم توضيح متطلبات الوثائق قبل العرض لتقليل المخاطر ودعم ثقة المشتريات.',
          card_5_cta_en: 'View quality',
          card_5_cta_ar: 'عرض الجودة',
          card_6_title_en: 'Supplier network',
          card_6_title_ar: 'شبكة الموردين',
          card_6_desc_en:
            'Sourcing logic is built around supplier relationships across the United States, Europe and the UAE.',
          card_6_desc_ar:
            'يعتمد منطق التوريد على علاقات الموردين في الولايات المتحدة وأوروبا والإمارات.',
          card_6_cta_en: 'About company',
          card_6_cta_ar: 'عن الشركة',
        },
      },
      // 5. Lifecycle parts support — 4 cards
      {
        type: 'feature-grid',
        data: {
          eyebrow_en: 'Lifecycle parts support',
          eyebrow_ar: 'دعم دورة حياة القطع',
          heading_en: 'Purchase, sale, exchange, lease and repair support for aircraft and helicopter parts.',
          heading_ar: 'دعم الشراء والبيع والتبادل والتأجير والإصلاح لقطع الطائرات والمروحيات.',
          lead_en:
            'Jetsonic supports civil aircraft and helicopter components across different conditions: serviceable parts, repairable units removed from operation, and defective but recoverable stock that can move through a disciplined repair or exchange path.',
          lead_ar:
            'تدعم Jetsonic مكونات الطائرات المدنية والمروحيات في حالات مختلفة: قطع صالحة للخدمة، وحدات قابلة للإصلاح تم سحبها من التشغيل، ومخزون معطل قابل للاستعادة يمكن نقله عبر مسار إصلاح أو تبادل منظم.',
          card_1_title_en: 'Buy and sell',
          card_1_title_ar: 'الشراء والبيع',
          card_1_desc_en:
            'Commercial coordination for spare parts and components for civil aircraft and helicopters of all types.',
          card_1_desc_ar: 'تنسيق تجاري لقطع الغيار والمكونات للطائرات المدنية والمروحيات بجميع أنواعها.',
          card_1_cta_en: 'Send part request',
          card_1_cta_ar: 'أرسل طلب القطعة',
          card_2_title_en: 'Exchange path',
          card_2_title_ar: 'مسار التبادل',
          card_2_desc_en:
            'Exchange options can be reviewed by part number, condition, core return logic, timing and documentation needs.',
          card_2_desc_ar:
            'يمكن مراجعة خيارات التبادل حسب رقم القطعة والحالة ومنطق إرجاع الوحدة والوقت ومتطلبات الوثائق.',
          card_2_cta_en: 'Request exchange',
          card_2_cta_ar: 'طلب تبادل',
          card_3_title_en: 'Lease support',
          card_3_title_ar: 'دعم التأجير',
          card_3_desc_en:
            'Lease requests can be structured for urgent maintenance needs when temporary component availability is critical.',
          card_3_desc_ar:
            'يمكن تنظيم طلبات التأجير لاحتياجات الصيانة العاجلة عندما يكون توفر المكون مؤقتاً أمراً حاسماً.',
          card_3_cta_en: 'Check lease option',
          card_3_cta_ar: 'فحص خيار التأجير',
          card_4_title_en: 'Repairable stock',
          card_4_title_ar: 'مخزون قابل للإصلاح',
          card_4_desc_en:
            'Repairable, removed and unserviceable but recoverable units can be reviewed for repair route, traceability and recovery potential.',
          card_4_desc_ar:
            'يمكن مراجعة الوحدات القابلة للإصلاح والمسحوبة من الخدمة وغير الصالحة حالياً ولكن القابلة للاستعادة من حيث مسار الإصلاح والتتبع وإمكانات الاستعادة.',
          card_4_cta_en: 'Start repair review',
          card_4_cta_ar: 'ابدأ مراجعة الإصلاح',
        },
      },
      // 6. Target customers — 3 comparison items
      {
        type: 'split',
        data: {
          eyebrow_en: 'Target customers',
          eyebrow_ar: 'العملاء المستهدفون',
          heading_en: 'Built for airlines, MRO centers, operators and brokers.',
          heading_ar: 'مصمم لشركات الطيران ومراكز الصيانة والمشغلين والوسطاء.',
          lead_en:
            'Airlines need uptime. MRO centers need clear technical data. Private operators need speed and reliability. Brokers need a disciplined sourcing partner. Each group receives a clear reason to send a request with complete technical data.',
          lead_ar:
            'تحتاج شركات الطيران إلى جاهزية التشغيل. تحتاج مراكز الصيانة إلى بيانات فنية واضحة. يحتاج المشغلون الخاصون إلى السرعة والاعتمادية. يحتاج الوسطاء إلى شريك توريد منضبط. تحصل كل مجموعة على سبب واضح لإرسال طلب ببيانات فنية كاملة.',
          compare_1_title_en: 'Airlines',
          compare_1_title_ar: 'شركات الطيران',
          compare_1_desc_en:
            'AOG support, certified components and predictable logistics for operational continuity.',
          compare_1_desc_ar: 'دعم AOG ومكونات موثقة ولوجستيات متوقعة لاستمرارية التشغيل.',
          compare_2_title_en: 'MRO centers',
          compare_2_title_ar: 'مراكز الصيانة',
          compare_2_desc_en:
            'Technical RFQs, documentation alignment and support for planned or urgent maintenance.',
          compare_2_desc_ar: 'طلبات RFQ فنية ومواءمة وثائق ودعم للصيانة المخططة أو العاجلة.',
          compare_3_title_en: 'Operators and brokers',
          compare_3_title_ar: 'المشغلون والوسطاء',
          compare_3_desc_en: 'Fast sourcing options, alternative part numbers and clear quote communication.',
          compare_3_desc_ar: 'خيارات توريد سريعة وأرقام قطع بديلة وتواصل واضح للعروض.',
        },
      },
      // 7. Visual band — 3 meta tiles
      {
        type: 'visual-band',
        data: {
          eyebrow_en: 'Global sourcing, regional delivery',
          eyebrow_ar: 'توريد عالمي وتسليم إقليمي',
          heading_en: 'From US, Europe and UAE suppliers to Kazakhstan, Central Asia and the Middle East.',
          heading_ar: 'من موردي الولايات المتحدة وأوروبا والإمارات إلى كازاخستان وآسيا الوسطى والشرق الأوسط.',
          lead_en:
            'Dubai serves as the operating base for global supplier access and regional aviation support across Kazakhstan, Central Asia and the Middle East.',
          lead_ar:
            'تعمل دبي كقاعدة تشغيلية للوصول إلى الموردين العالميين ودعم عملاء الطيران في كازاخستان وآسيا الوسطى والشرق الأوسط.',
          meta_1_strong: 'US / Europe / UAE',
          meta_1_desc_en: 'Supplier search routes',
          meta_1_desc_ar: 'مسارات بحث الموردين',
          meta_2_strong: 'Dubai Silicon Oasis',
          meta_2_desc_en: 'Operational and logistics base',
          meta_2_desc_ar: 'قاعدة تشغيل ولوجستيات',
          meta_3_strong: 'Kazakhstan / Central Asia / Middle East',
          meta_3_desc_en: 'Target customer markets',
          meta_3_desc_ar: 'أسواق العملاء المستهدفة',
        },
      },
      // 8. CTA band
      {
        type: 'cta-band',
        data: {
          eyebrow_en: 'Start request',
          eyebrow_ar: 'ابدأ الطلب',
          heading_en: 'Send a precise RFQ and start the sourcing path.',
          heading_ar: 'أرسل RFQ دقيق وابدأ مسار التوريد.',
          lead_en:
            'Choose AOG or standard RFQ, attach files and send the technical data required for availability, documents and delivery review.',
          lead_ar:
            'اختر AOG أو RFQ عادي، أرفق الملفات وأرسل البيانات الفنية المطلوبة لمراجعة التوفر والوثائق والتسليم.',
          cta_en: 'Open RFQ form',
          cta_ar: 'افتح نموذج RFQ',
          cta_href: '/contact/',
        },
      },
    ],
  },

  // ---------- ABOUT ----------
  {
    slug: 'about',
    title: 'Company',
    seo: {
      title: 'About Jetsonic Trading FZCO | Dubai Aviation Sourcing Company',
      description:
        'Jetsonic Trading FZCO operates from Dubai Silicon Oasis. Lean aviation sourcing for airlines, MRO centers, operators and brokers across Kazakhstan, Central Asia and the Middle East.',
      keywords:
        'Jetsonic Trading FZCO, Dubai aviation company, IFZA Business Park, Dubai Silicon Oasis aviation, FZCO aviation, aviation trader Dubai, aircraft parts business UAE, aviation sourcing company, Dubai aircraft broker, Middle East aviation trader, Central Asia aviation parts, Kazakhstan aviation supplier',
    },
    blocks: [
      {
        type: 'page-hero',
        data: {
          eyebrow_en: 'Company',
          eyebrow_ar: 'الشركة',
          heading_en: 'A lean aviation sourcing company built around speed, trust and documentation.',
          heading_ar: 'شركة توريد طيران مرنة مبنية حول السرعة والثقة والوثائق.',
          lead_en:
            'Jetsonic Trading FZCO is positioned from Dubai Silicon Oasis to support aviation buyers across Kazakhstan, Central Asia and the Middle East through global supplier access and disciplined request handling.',
          lead_ar:
            'تتمركز Jetsonic Trading FZCO في Dubai Silicon Oasis لدعم مشتري الطيران في كازاخستان وآسيا الوسطى والشرق الأوسط عبر وصول عالمي للموردين ومعالجة طلبات منضبطة.',
          aside_eyebrow_en: 'Operating model',
          aside_eyebrow_ar: 'نموذج التشغيل',
          aside_strong_en: 'Lean sourcing',
          aside_strong_ar: 'توريد مرن',
          aside_desc_en: 'No unnecessary stock burden. Faster supplier comparison. Clearer RFQ discipline.',
          aside_desc_ar: 'بدون عبء مخزون غير ضروري. مقارنة موردين أسرع. انضباط RFQ أوضح.',
        },
      },
      {
        type: 'split-route',
        data: {
          eyebrow_en: 'Market logic',
          eyebrow_ar: 'منطق السوق',
          heading_en: 'The business works when buyers can request quickly and trust the process.',
          heading_ar: 'ينجح العمل عندما يستطيع المشترون الطلب بسرعة والثقة بالمسار.',
          lead_en:
            'Jetsonic reflects this logic through supplier access, AOG support, documentation control, logistics coordination and precise RFQ data from the first request.',
          lead_ar:
            'تعكس Jetsonic هذا المنطق عبر وصول الموردين ودعم AOG وضبط الوثائق وتنسيق اللوجستيات وبيانات RFQ دقيقة من أول طلب.',
          route_1_label: 'US',
          route_2_label: 'Europe',
          route_3_label: 'UAE',
          route_4_label: 'Central Asia',
        },
      },
      {
        type: 'feature-grid',
        data: {
          eyebrow_en: 'Strategic focus',
          eyebrow_ar: 'التركيز الاستراتيجي',
          heading_en: 'What Jetsonic builds for aviation buyers.',
          heading_ar: 'ما تبنيه Jetsonic لمشتري الطيران.',
          card_1_title_en: 'Supplier relationships',
          card_1_title_ar: 'علاقات الموردين',
          card_1_desc_en:
            'More structured RFQs help compare suppliers by availability, delivery timing, documents and margin.',
          card_1_desc_ar: 'تساعد RFQ المنظمة على مقارنة الموردين حسب التوفر ووقت التسليم والوثائق والهامش.',
          card_1_cta_en: 'Send RFQ',
          card_1_cta_ar: 'أرسل طلب عرض',
          card_2_title_en: 'Demand intelligence',
          card_2_title_ar: 'ذكاء الطلب',
          card_2_desc_en:
            'Requests can show which countries, part categories and urgency types create the strongest pipeline.',
          card_2_desc_ar: 'يمكن للطلبات إظهار البلدان وفئات القطع وأنواع السرعة التي تخلق أقوى خط أنابيب.',
          card_2_cta_en: 'Send RFQ',
          card_2_cta_ar: 'أرسل طلب عرض',
          card_3_title_en: 'Long term contracts',
          card_3_title_ar: 'عقود طويلة الأجل',
          card_3_desc_en:
            'A disciplined RFQ and documentation path supports tenders, repeat procurement and enterprise buyer confidence.',
          card_3_desc_ar:
            'يدعم مسار RFQ ووثائق منضبط المناقصات والمشتريات المتكررة وثقة المشترين المؤسسيين.',
          card_3_cta_en: 'Send RFQ',
          card_3_cta_ar: 'أرسل طلب عرض',
        },
      },
      {
        type: 'cta-band',
        data: {
          eyebrow_en: 'Start cooperation',
          eyebrow_ar: 'ابدأ التعاون',
          heading_en: 'Send the first RFQ and build the relationship from clarity.',
          heading_ar: 'أرسل أول RFQ وابنِ العلاقة من الوضوح.',
          cta_en: 'Request quote',
          cta_ar: 'طلب عرض',
          cta_href: '/contact/',
        },
      },
    ],
  },

  // ---------- AOG ----------
  {
    slug: 'aog',
    title: 'AOG',
    seo: {
      title: 'AOG Support 24/7 in Dubai | Urgent Aircraft Parts | Jetsonic',
      description:
        'Aircraft On Ground urgent parts sourcing from Dubai. Fast supplier search, certificate review and logistics for grounded aircraft. Submit AOG request with part number and target time.',
      keywords:
        'AOG support, AOG Dubai, aircraft on ground, urgent aircraft parts, AOG 24/7, AOG sourcing UAE, grounded aircraft parts, emergency aviation parts, AOG response Middle East, AOG service Kazakhstan, fast aircraft spares, AOG request form, AOG documentation, urgent FAA EASA parts, aircraft downtime parts',
    },
    blocks: [
      {
        type: 'page-hero',
        data: {
          eyebrow_en: 'AOG priority',
          eyebrow_ar: 'أولوية AOG',
          heading_en: 'When aircraft downtime is the risk, the request path must be fast and precise.',
          heading_ar: 'عندما يكون توقف الطائرة هو الخطر، يجب أن يكون مسار الطلب سريعاً ودقيقاً.',
          lead_en:
            'Jetsonic treats AOG requests as priority cases, helping buyers submit the exact technical and delivery details needed for fast availability checks and logistics review.',
          lead_ar:
            'تتعامل Jetsonic مع طلبات AOG كحالات أولوية وتساعد المشترين على إرسال التفاصيل الفنية وتفاصيل التسليم اللازمة لفحص التوفر ومراجعة اللوجستيات بسرعة.',
          primary_cta_en: 'Submit AOG request',
          primary_cta_ar: 'إرسال طلب AOG',
          primary_cta_href: '/contact/?request=aog#rfq',
          secondary_cta_en: 'Standard RFQ',
          secondary_cta_ar: 'RFQ عادي',
          secondary_cta_href: '/contact/#rfq',
          aside_title: 'AOG 24/7',
          aside_desc_en: 'Priority request logic for grounded aircraft and time sensitive maintenance needs.',
          aside_desc_ar: 'منطق طلب أولوية للطائرات المتوقفة واحتياجات الصيانة الحساسة للوقت.',
        },
      },
      {
        type: 'timeline',
        data: {
          eyebrow_en: 'AOG workflow',
          eyebrow_ar: 'مسار AOG',
          heading_en: 'A clean response path creates confidence under pressure.',
          heading_ar: 'مسار استجابة واضح يخلق الثقة تحت الضغط.',
          step_1_title_en: 'AOG request',
          step_1_title_ar: 'طلب AOG',
          step_1_desc_en:
            'Part number, aircraft type, quantity, certificate, airport and target time are captured.',
          step_1_desc_ar:
            'يتم التقاط رقم القطعة ونوع الطائرة والكمية والشهادة والمطار والوقت المستهدف.',
          step_2_title_en: 'Supplier search',
          step_2_title_ar: 'بحث الموردين',
          step_2_desc_en:
            'Supplier availability is checked through US, Europe and UAE sourcing routes.',
          step_2_desc_ar: 'يتم فحص توفر الموردين عبر مسارات الولايات المتحدة وأوروبا والإمارات.',
          step_3_title_en: 'Quote and documents',
          step_3_title_ar: 'العرض والوثائق',
          step_3_desc_en: 'Condition, certificates, delivery terms and release documents are clarified.',
          step_3_desc_ar: 'يتم توضيح الحالة والشهادات وشروط التسليم ووثائق الإفراج.',
          step_4_title_en: 'Delivery route',
          step_4_title_ar: 'مسار التسليم',
          step_4_desc_en: 'Logistics path is aligned with urgency, destination and customs sensitivity.',
          step_4_desc_ar: 'يتم مواءمة مسار اللوجستيات مع السرعة والوجهة وحساسية الجمارك.',
        },
      },
      {
        type: 'split-checklist',
        data: {
          eyebrow_en: 'AOG data checklist',
          eyebrow_ar: 'قائمة بيانات AOG',
          heading_en: 'What the buyer should send immediately.',
          heading_ar: 'ما يجب على المشتري إرساله فوراً.',
          lead_en:
            'AOG response depends on clarity. Complete technical data helps reduce missed details and supports faster supplier and logistics coordination.',
          lead_ar:
            'تعتمد استجابة AOG على الوضوح. تساعد البيانات الفنية الكاملة على تقليل التفاصيل المفقودة ودعم تنسيق أسرع مع الموردين واللوجستيات.',
          check_1_en: 'Aircraft on ground status and airport',
          check_1_ar: 'حالة الطائرة المتوقفة والمطار',
          check_2_en: 'Part number and alternate references',
          check_2_ar: 'رقم القطعة والمراجع البديلة',
          check_3_en: 'Aircraft type and tail number if available',
          check_3_ar: 'نوع الطائرة ورقم الذيل إن وُجد',
          check_4_en: 'Required condition and certificate',
          check_4_ar: 'الحالة المطلوبة والشهادة',
          check_5_en: 'Required delivery time and contact person',
          check_5_ar: 'وقت التسليم المطلوب وشخص الاتصال',
        },
      },
      {
        type: 'cta-band',
        data: {
          eyebrow_en: 'Urgent request',
          eyebrow_ar: 'طلب عاجل',
          heading_en: 'Use the AOG path when time is the real cost.',
          heading_ar: 'استخدم مسار AOG عندما يكون الوقت هو التكلفة الحقيقية.',
          cta_en: 'Submit AOG request',
          cta_ar: 'إرسال طلب AOG',
          cta_href: '/contact/?request=aog#rfq',
        },
      },
    ],
  },

  // ---------- PARTS ----------
  {
    slug: 'parts',
    title: 'Parts',
    seo: {
      title: 'Aircraft Parts Sourcing | Rotables, USM, Tools | Jetsonic Dubai',
      description:
        'Rotables, USM, consumables, GSE and certified aviation components. FAA 8130-3 and EASA Form 1 alignment for every request. Send part number and get a structured quote.',
      keywords:
        'aircraft rotables, aircraft consumables, USM aircraft parts, used serviceable material, aviation expendables, aircraft components supplier, aircraft hydraulic parts, aircraft avionics, landing gear parts, aircraft fuel system parts, aircraft control units, aviation O rings, aircraft fasteners, aviation chemicals, aircraft GSE, ground support equipment Dubai, aviation tools supplier, certified aircraft parts UAE, overhauled aircraft components, serviceable aircraft parts Dubai',
    },
    blocks: [
      {
        type: 'page-hero',
        data: {
          eyebrow_en: 'Parts coverage',
          eyebrow_ar: 'تغطية القطع',
          heading_en: 'Aircraft components organized for fast RFQ decisions.',
          heading_ar: 'مكونات طائرات منظمة لاتخاذ قرارات RFQ أسرع.',
          lead_en:
            'Buyers can quickly understand what Jetsonic can source and send the correct technical details for availability, certificates and delivery planning.',
          lead_ar:
            'يمكن للمشترين فهم ما يمكن لـ Jetsonic توريده بسرعة وإرسال التفاصيل الفنية الصحيحة للتوفر والشهادات وتخطيط التسليم.',
          primary_cta_en: 'Request a part',
          primary_cta_ar: 'اطلب قطعة',
          primary_cta_href: '/contact/#rfq',
          secondary_cta_en: 'AOG support',
          secondary_cta_ar: 'دعم AOG',
          secondary_cta_href: '/aog/',
        },
      },
      {
        type: 'feature-grid',
        data: {
          eyebrow_en: 'Product lines',
          eyebrow_ar: 'خطوط المنتجات',
          heading_en: 'Clear part categories help procurement teams send faster, more complete requests.',
          heading_ar: 'تساعد فئات القطع الواضحة فرق المشتريات على إرسال طلبات أسرع وأكثر اكتمالاً.',
          card_1_title_en: 'Rotables',
          card_1_title_ar: 'روتيبلز',
          card_1_desc_en:
            'Avionics, hydraulic components, landing gear elements, fuel system components and control units.',
          card_1_desc_ar: 'أفيونيكس، مكونات هيدروليك، عناصر هبوط، مكونات أنظمة الوقود ووحدات تحكم.',
          card_1_cta_en: 'Send RFQ',
          card_1_cta_ar: 'أرسل طلب عرض',
          card_2_title_en: 'Consumables and expendables',
          card_2_title_ar: 'المواد الاستهلاكية',
          card_2_desc_en: 'Filters, seals, O rings, fasteners, chemicals, lubricants and general consumables.',
          card_2_desc_ar: 'فلاتر، أختام، O rings، مثبتات، مواد كيميائية، زيوت ومواد استهلاكية عامة.',
          card_2_cta_en: 'Send RFQ',
          card_2_cta_ar: 'أرسل طلب عرض',
          card_3_title_en: 'USM components',
          card_3_title_ar: 'مكونات USM',
          card_3_desc_en:
            'Certified repaired, overhauled and serviceable material with documentation requirements clarified before quote.',
          card_3_desc_ar:
            'مواد مصلحة ومجددة وصالحة للخدمة مع توضيح متطلبات الوثائق قبل العرض.',
          card_3_cta_en: 'Send RFQ',
          card_3_cta_ar: 'أرسل طلب عرض',
          card_4_title_en: 'Tools and GSE',
          card_4_title_ar: 'الأدوات و GSE',
          card_4_desc_en:
            'Specialized aviation tools, ground support equipment and test equipment for maintenance needs.',
          card_4_desc_ar: 'أدوات طيران متخصصة، معدات دعم أرضي ومعدات اختبار لاحتياجات الصيانة.',
          card_4_cta_en: 'Send RFQ',
          card_4_cta_ar: 'أرسل طلب عرض',
          card_5_title_en: 'Documentation support',
          card_5_title_ar: 'دعم الوثائق',
          card_5_desc_en: 'FAA 8130 3, EASA Form 1, CoC, traceability and shipping paperwork alignment.',
          card_5_desc_ar: 'مواءمة FAA 8130 3 و EASA Form 1 و CoC والتتبع ووثائق الشحن.',
          card_5_cta_en: 'Send RFQ',
          card_5_cta_ar: 'أرسل طلب عرض',
          card_6_title_en: 'Urgent sourcing',
          card_6_title_ar: 'توريد عاجل',
          card_6_desc_en:
            'AOG and priority requests can be routed through a faster review path with urgency and delivery point captured.',
          card_6_desc_ar:
            'يمكن توجيه طلبات AOG والأولوية عبر مسار مراجعة أسرع مع تحديد السرعة ونقطة التسليم.',
          card_6_cta_en: 'Send RFQ',
          card_6_cta_ar: 'أرسل طلب عرض',
        },
      },
      {
        type: 'split-checklist',
        data: {
          eyebrow_en: 'What to send',
          eyebrow_ar: 'ما يجب إرساله',
          heading_en: 'The better the technical data, the faster the sourcing path.',
          heading_ar: 'كلما كانت البيانات الفنية أفضل، كان مسار التوريد أسرع.',
          lead_en:
            'A strong request includes part number, alternative part number, quantity, condition, certificate requirement, aircraft type, delivery airport and target date.',
          lead_ar:
            'يتضمن الطلب القوي رقم القطعة والرقم البديل والكمية والحالة ومتطلبات الشهادة ونوع الطائرة ومطار التسليم والتاريخ المستهدف.',
          check_1_en: 'Part number and alternate part number',
          check_1_ar: 'رقم القطعة والرقم البديل',
          check_2_en: 'Aircraft type and ATA chapter',
          check_2_ar: 'نوع الطائرة وفصل ATA',
          check_3_en: 'Quantity and required condition',
          check_3_ar: 'الكمية والحالة المطلوبة',
          check_4_en: 'FAA 8130 3, EASA Form 1 or CoC',
          check_4_ar: 'FAA 8130 3 أو EASA Form 1 أو CoC',
          check_5_en: 'Delivery city, airport and urgency',
          check_5_ar: 'مدينة التسليم والمطار والسرعة',
        },
      },
      {
        type: 'cta-band',
        data: {
          eyebrow_en: 'Ready to request',
          eyebrow_ar: 'جاهز للطلب',
          heading_en: 'Send a part number and let the team start from clean data.',
          heading_ar: 'أرسل رقم القطعة ودع الفريق يبدأ من بيانات واضحة.',
          cta_en: 'Submit RFQ',
          cta_ar: 'إرسال RFQ',
          cta_href: '/contact/#rfq',
        },
      },
    ],
  },

  // ---------- SERVICES ----------
  {
    slug: 'services',
    title: 'Services',
    seo: {
      title: 'Aviation Services: RFQ, AOG, Documents & Logistics | Jetsonic',
      description:
        'RFQ workflow, supplier search across US, Europe and UAE. Certificate and document control. DHL, FedEx, Aramex and Emirates SkyCargo delivery coordination from Dubai.',
      keywords:
        'aviation RFQ workflow, aviation supplier search, aircraft parts logistics, DHL aircraft parts, FedEx aviation, Emirates SkyCargo parts, aviation document control, aircraft certificate alignment, aviation procurement service, aviation broker Dubai, supplier comparison aviation, aviation delivery coordination, aircraft parts shipping UAE',
    },
    blocks: [
      {
        type: 'page-hero',
        data: {
          eyebrow_en: 'Services',
          eyebrow_ar: 'الخدمات',
          heading_en:
            'Aircraft parts sourcing services built around speed, documentation and reliable delivery coordination.',
          heading_ar: 'خدمات توريد قطع طائرات مبنية حول السرعة والوثائق وتنسيق التسليم الموثوق.',
          lead_en:
            'Jetsonic supports aviation buyers with urgent sourcing, supplier comparison, document alignment and delivery coordination through Dubai based procurement routes.',
          lead_ar:
            'تدعم Jetsonic مشتري الطيران عبر التوريد العاجل ومقارنة الموردين ومواءمة الوثائق وتنسيق التسليم من خلال مسارات شراء قائمة في دبي.',
          orbit_1_label: 'AOG',
          orbit_2_label: 'RFQ',
          orbit_3_label: 'Docs',
          orbit_4_label: 'Logistics',
        },
      },
      {
        type: 'feature-grid',
        data: {
          eyebrow_en: 'Service modules',
          eyebrow_ar: 'وحدات الخدمة',
          heading_en: 'Services designed for aircraft uptime, sourcing clarity and procurement confidence.',
          heading_ar: 'خدمات مصممة لجاهزية الطائرات ووضوح التوريد وثقة المشتريات.',
          card_1_title_en: 'AOG response',
          card_1_title_ar: 'استجابة AOG',
          card_1_desc_en:
            'Priority sourcing for grounded aircraft, with structured technical fields and rapid contact.',
          card_1_desc_ar: 'توريد أولوية للطائرات المتوقفة، مع حقول فنية منظمة وتواصل سريع.',
          card_1_cta_en: 'Send RFQ',
          card_1_cta_ar: 'أرسل طلب عرض',
          card_2_title_en: 'Document control',
          card_2_title_ar: 'ضبط الوثائق',
          card_2_desc_en:
            'Certificate, trace and shipping documents can be requested and tracked from the first client contact.',
          card_2_desc_ar:
            'يمكن طلب وتتبع الشهادة والتتبع ووثائق الشحن من أول تواصل مع العميل.',
          card_2_cta_en: 'Send RFQ',
          card_2_cta_ar: 'أرسل طلب عرض',
          card_3_title_en: 'Supplier sourcing',
          card_3_title_ar: 'توريد الموردين',
          card_3_desc_en:
            'US, Europe and UAE supplier routes can be compared by availability, price and certificate type.',
          card_3_desc_ar:
            'يمكن مقارنة مسارات الموردين في الولايات المتحدة وأوروبا والإمارات حسب التوفر والسعر والشهادة.',
          card_3_cta_en: 'Send RFQ',
          card_3_cta_ar: 'أرسل طلب عرض',
        },
      },
    ],
  },

  // ---------- QUALITY ----------
  {
    slug: 'quality',
    title: 'Quality',
    seo: {
      title: 'FAA 8130-3, EASA Form 1, CoC | Aviation Documentation | Jetsonic',
      description:
        'Document discipline for every aircraft parts request: FAA 8130-3, EASA Form 1, Certificate of Conformity, traceability and shipping paperwork. Compliance-first sourcing from Dubai.',
      keywords:
        'FAA 8130-3, EASA Form 1, certificate of conformity aviation, CoC aviation, aircraft parts traceability, aviation documentation, aviation compliance Dubai, aircraft release documents, aviation airworthiness, MRO documentation, aircraft quality control, aviation regulatory compliance, FAA documentation, EASA documentation, JAA aircraft certificate',
    },
    blocks: [
      {
        type: 'page-hero',
        data: {
          eyebrow_en: 'Quality and documents',
          eyebrow_ar: 'الجودة والوثائق',
          heading_en: 'In aviation sourcing, documentation is part of the product.',
          heading_ar: 'في توريد الطيران، الوثائق جزء من المنتج.',
          lead_en:
            'Jetsonic keeps documentation at the center of every sourcing request, from certificate needs and traceability to release and shipping paperwork.',
          lead_ar:
            'تضع Jetsonic الوثائق في قلب كل طلب توريد، من متطلبات الشهادات والتتبع إلى أوراق الإفراج والشحن.',
          stack_1_label: 'FAA 8130 3',
          stack_2_label: 'EASA Form 1',
          stack_3_label: 'Traceability',
          stack_4_label: 'Shipping documents',
        },
      },
      {
        type: 'split-checklist',
        data: {
          eyebrow_en: 'Trust signals',
          eyebrow_ar: 'إشارات الثقة',
          heading_en: 'Procurement teams need proof before they need persuasion.',
          heading_ar: 'فرق المشتريات تحتاج إلى دليل قبل الإقناع.',
          lead_en:
            'Jetsonic highlights certificate expectations, condition requirements, supplier documentation, invoices and shipping documents so procurement teams can evaluate each request with greater confidence.',
          lead_ar:
            'توضح Jetsonic توقعات الشهادات ومتطلبات الحالة ووثائق الموردين والفواتير ووثائق الشحن حتى تتمكن فرق المشتريات من تقييم كل طلب بثقة أكبر.',
          check_1_en: 'FAA 8130 3 and EASA Form 1 requirements',
          check_1_ar: 'متطلبات FAA 8130 3 و EASA Form 1',
          check_2_en: 'CoC and trace document coordination',
          check_2_ar: 'تنسيق CoC ووثائق التتبع',
          check_3_en: 'Condition confirmation before quotation',
          check_3_ar: 'تأكيد الحالة قبل العرض',
          check_4_en: 'Invoice and shipping document alignment',
          check_4_ar: 'مواءمة الفاتورة ووثائق الشحن',
          check_5_en: 'Compliance notes captured in RFQ',
          check_5_ar: 'ملاحظات الامتثال الملتقطة في RFQ',
        },
      },
    ],
  },

  // ---------- CONTACT ----------
  {
    slug: 'contact',
    title: 'Contact',
    seo: {
      title: 'Contact & RFQ Form | Aircraft Parts Request | Jetsonic Dubai',
      description:
        'Send an RFQ or AOG request. Part number, aircraft type, ATA chapter, urgency and delivery point. Direct line +971 58 549 0059. Dubai Silicon Oasis, UAE.',
      keywords:
        'aviation RFQ form, AOG request form, aircraft parts request Dubai, send RFQ aviation, aircraft parts quote, contact aircraft parts supplier, Jetsonic contact, Dubai aircraft trader phone, aviation supplier UAE contact, Jetsonic WhatsApp, +971 aviation parts',
    },
    blocks: [
      {
        type: 'page-hero',
        data: {
          eyebrow_en: 'Professional RFQ intake',
          eyebrow_ar: 'استقبال RFQ احترافي',
          heading_en: 'Send AOG or standard RFQ details in one clear form.',
          heading_ar: 'أرسل تفاصيل AOG أو RFQ عادي في نموذج واحد واضح.',
          lead_en:
            'Use this form to submit part numbers, alternate references, aircraft type, ATA chapter, required condition, certificate need, urgency, delivery point and supporting files.',
          lead_ar:
            'استخدم هذا النموذج لإرسال أرقام القطع والمراجع البديلة ونوع الطائرة وفصل ATA والحالة المطلوبة ومتطلبات الشهادة والسرعة ومكان التسليم والملفات الداعمة.',
          card_eyebrow_en: 'Company address',
          card_eyebrow_ar: 'عنوان الشركة',
          card_address_line_1: 'IFZA Business Park, DDP, Premises No 67690 001',
          card_address_line_2: 'Dubai Silicon Oasis',
          card_address_line_3: 'Dubai, United Arab Emirates',
          card_phone: '+971 58 549 0059',
          card_note_en:
            'For urgent AOG cases, submit the form and include the fastest reachable contact person.',
          card_note_ar:
            'للحالات العاجلة AOG، أرسل النموذج وحدد أسرع شخص يمكن التواصل معه.',
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

    // Idempotent: wipe and reseed blocks for this page.
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

    const total = p.blocks.reduce((sum, b) => sum + Object.keys(b.data).length, 0);
    console.log(`Reseeded ${p.slug.padEnd(10)} → ${p.blocks.length} blocks, ${total} editable fields, SEO ✓`);
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
