import { getAllPosts, type PostMeta } from "./posts";
import { slugify } from "./slug";

export type GuideTopic = {
  slug: string;
  name: string;
  description: string;
  /** Keywords to match against category/tags/title. */
  match: string[];
};

export const GUIDE_TOPICS: GuideTopic[] = [
  {
    slug: "getting-started",
    name: "Getting started",
    description: "Shortlists, tour checklists, and the fastest way to narrow options without missing anything important.",
    match: ["getting started", "choose", "shortlist", "tour", "questions"],
  },
  {
    slug: "fees-and-budgets",
    name: "Fees and budgets",
    description: "How fees work, what’s included, and how to estimate total first-year cost before you commit.",
    match: ["fees", "budget", "cost", "pricing"],
  },
  {
    slug: "admissions",
    name: "Admissions",
    description: "Timelines, documents, trial days, and what to ask so you get clear answers early.",
    match: ["admissions", "documents", "timeline", "trial", "enrollment"],
  },
  {
    slug: "curriculum",
    name: "Curriculum",
    description: "IB, British, Cambridge, American, Montessori — what families mean when they say “the right fit”.",
    match: ["ib", "british", "cambridge", "american", "montessori", "curriculum"],
  },
  {
    slug: "areas-and-lifestyle",
    name: "Areas and lifestyle",
    description: "Commute realities, family neighbourhoods, and how location changes your school shortlist.",
    match: ["canggu", "ubud", "sanur", "bukit", "area", "commute", "lifestyle"],
  },
  {
    slug: "relocation",
    name: "Relocation",
    description: "Practical considerations for families moving to Bali — scheduling, settling in, and school transitions.",
    match: ["relocation", "moving", "visa", "settling", "transition", "new to bali"],
  },
];

const TOPIC_TRANSLATIONS: Record<string, Record<string, { name: string; description: string }>> = {
  es: {
    "getting-started": {
      name: "Primeros pasos",
      description: "Listas cortas, checklist de visitas y la forma más rápida de reducir opciones sin perder nada importante.",
    },
    "fees-and-budgets": {
      name: "Cuotas y presupuesto",
      description: "Cómo funcionan las cuotas, qué está incluido y cómo estimar el costo total del primer año antes de decidir.",
    },
    admissions: {
      name: "Admisiones",
      description: "Calendarios, documentos, días de prueba y qué preguntar para obtener respuestas claras desde el inicio.",
    },
    curriculum: {
      name: "Currículo",
      description: "IB, británico, Cambridge, americano, Montessori: qué significa realmente elegir el mejor encaje.",
    },
    "areas-and-lifestyle": {
      name: "Zonas y estilo de vida",
      description: "Realidad de los traslados, barrios familiares y cómo la ubicación cambia tu lista corta de escuelas.",
    },
    relocation: {
      name: "Reubicación",
      description: "Consideraciones prácticas para familias que se mudan a Bali: planificación, adaptación y transición escolar.",
    },
  },
  de: {
    "getting-started": {
      name: "Erste Schritte",
      description: "Shortlists, Tour-Checklisten und der schnellste Weg, Optionen einzugrenzen, ohne Wichtiges zu übersehen.",
    },
    "fees-and-budgets": {
      name: "Gebühren und Budget",
      description: "Wie Gebühren funktionieren, was enthalten ist und wie Sie die Gesamtkosten im ersten Jahr realistisch einschätzen.",
    },
    admissions: {
      name: "Aufnahme",
      description: "Zeitpläne, Unterlagen, Probetage und welche Fragen Sie stellen sollten, um früh klare Antworten zu bekommen.",
    },
    curriculum: {
      name: "Lehrplan",
      description: "IB, britisch, Cambridge, amerikanisch, Montessori — was Familien meinen, wenn sie vom passenden Weg sprechen.",
    },
    "areas-and-lifestyle": {
      name: "Regionen und Lebensstil",
      description: "Pendelrealität, familienfreundliche Viertel und wie der Standort Ihre Schulauswahl verändert.",
    },
    relocation: {
      name: "Umzug",
      description: "Praktische Punkte für Familien, die nach Bali ziehen — Planung, Ankommen und Schulübergänge.",
    },
  },
  fr: {
    "getting-started": {
      name: "Bien démarrer",
      description: "Shortlists, check-lists de visite et méthode rapide pour réduire les options sans rien d’essentiel oublier.",
    },
    "fees-and-budgets": {
      name: "Frais et budget",
      description: "Comprendre les frais, ce qui est inclus et comment estimer le coût total de la première année.",
    },
    admissions: {
      name: "Admissions",
      description: "Calendrier, documents, journées d’essai et questions à poser pour obtenir des réponses claires dès le départ.",
    },
    curriculum: {
      name: "Programme",
      description: "IB, britannique, Cambridge, américain, Montessori — ce que les familles entendent par “bon profil”.",
    },
    "areas-and-lifestyle": {
      name: "Zones et mode de vie",
      description: "Réalité des trajets, quartiers familiaux et impact de la localisation sur votre shortlist d’écoles.",
    },
    relocation: {
      name: "Relocalisation",
      description: "Points pratiques pour les familles qui s’installent à Bali : planning, adaptation et transitions scolaires.",
    },
  },
  nl: {
    "getting-started": {
      name: "Eerste stappen",
      description: "Shortlists, rondleidingschecklists en de snelste manier om opties te verfijnen zonder iets belangrijks te missen.",
    },
    "fees-and-budgets": {
      name: "Kosten en budget",
      description: "Hoe schoolkosten werken, wat is inbegrepen en hoe je de totale kosten van het eerste jaar inschat.",
    },
    admissions: {
      name: "Toelating",
      description: "Tijdlijnen, documenten, proefdagen en welke vragen je moet stellen voor snelle en duidelijke antwoorden.",
    },
    curriculum: {
      name: "Curriculum",
      description: "IB, Brits, Cambridge, Amerikaans, Montessori — wat gezinnen bedoelen met de juiste match.",
    },
    "areas-and-lifestyle": {
      name: "Gebieden en levensstijl",
      description: "Forensen in de praktijk, gezinswijken en hoe locatie je schoolshortlist beïnvloedt.",
    },
    relocation: {
      name: "Verhuizing",
      description: "Praktische punten voor gezinnen die naar Bali verhuizen: planning, settelen en schoolovergangen.",
    },
  },
  ru: {
    "getting-started": {
      name: "С чего начать",
      description: "Шорт-листы, чек-листы для туров и самый быстрый способ сузить выбор, не упуская важное.",
    },
    "fees-and-budgets": {
      name: "Стоимость и бюджет",
      description: "Как устроены платежи, что включено и как оценить полную стоимость первого года до решения.",
    },
    admissions: {
      name: "Поступление",
      description: "Сроки, документы, пробные дни и какие вопросы задавать, чтобы сразу получить ясные ответы.",
    },
    curriculum: {
      name: "Программа",
      description: "IB, британская, Cambridge, американская, Montessori — что семьи имеют в виду под “подходящим вариантом”.",
    },
    "areas-and-lifestyle": {
      name: "Районы и стиль жизни",
      description: "Реальность поездок, семейные районы и как локация меняет ваш список школ.",
    },
    relocation: {
      name: "Переезд",
      description: "Практические моменты для семей, переезжающих на Бали: планирование, адаптация и переходы между школами.",
    },
  },
  zh: {
    "getting-started": {
      name: "入门指南",
      description: "候选清单、访校检查表，以及在不遗漏重点的前提下快速缩小选择范围的方法。",
    },
    "fees-and-budgets": {
      name: "学费与预算",
      description: "学费如何构成、包含哪些项目，以及在决定前如何估算第一年总成本。",
    },
    admissions: {
      name: "招生入学",
      description: "时间线、材料、试读日，以及应提出哪些问题才能尽早获得清晰答案。",
    },
    curriculum: {
      name: "课程体系",
      description: "IB、英式、剑桥、美式、蒙特梭利——家庭所说“适配度”到底指什么。",
    },
    "areas-and-lifestyle": {
      name: "区域与生活方式",
      description: "通勤现实、家庭社区，以及居住位置如何改变你的学校候选清单。",
    },
    relocation: {
      name: "搬迁指南",
      description: "面向搬到巴厘岛家庭的实用建议：时间安排、安顿过程与学校衔接。",
    },
  },
  ja: {
    "getting-started": {
      name: "はじめ方",
      description: "候補校リスト、見学チェックリスト、そして大事な点を漏らさずに素早く絞り込む方法。",
    },
    "fees-and-budgets": {
      name: "学費と予算",
      description: "学費の仕組み、含まれる項目、そして入学前に初年度総費用を見積もる方法。",
    },
    admissions: {
      name: "入学手続き",
      description: "時期、必要書類、体験日、そして早い段階で明確な回答を得るための質問ポイント。",
    },
    curriculum: {
      name: "カリキュラム",
      description: "IB・英国式・ケンブリッジ・米国式・モンテッソーリ――家庭が言う“合う学校”とは何か。",
    },
    "areas-and-lifestyle": {
      name: "エリアと暮らし",
      description: "通学時間の現実、家族向けエリア、そして住む場所が学校選びに与える影響。",
    },
    relocation: {
      name: "移住準備",
      description: "バリへ移住する家族向けの実務ガイド：準備、定着、学校間の移行。",
    },
  },
  ko: {
    "getting-started": {
      name: "시작 가이드",
      description: "숏리스트, 학교 방문 체크리스트, 그리고 중요한 것을 놓치지 않고 빠르게 좁혀 가는 방법입니다.",
    },
    "fees-and-budgets": {
      name: "학비와 예산",
      description: "학비 구조, 포함 항목, 그리고 결정 전에 1년 총비용을 추정하는 방법을 다룹니다.",
    },
    admissions: {
      name: "입학",
      description: "일정, 서류, 체험수업, 그리고 초기에 명확한 답을 얻기 위해 꼭 물어볼 질문들입니다.",
    },
    curriculum: {
      name: "커리큘럼",
      description: "IB, 영국식, 케임브리지, 미국식, 몬테소리 — 가족이 말하는 ‘맞는 학교’의 의미를 설명합니다.",
    },
    "areas-and-lifestyle": {
      name: "지역과 라이프스타일",
      description: "통학 현실, 가족 친화 지역, 그리고 거주지가 학교 후보군에 미치는 영향을 다룹니다.",
    },
    relocation: {
      name: "이주",
      description: "발리로 이주하는 가족을 위한 실전 팁: 일정 계획, 정착, 학교 전환.",
    },
  },
  ar: {
    "getting-started": {
      name: "البدء",
      description: "قوائم مختصرة، وقوائم فحص للزيارات، وأسرع طريقة لتضييق الخيارات دون فقدان ما هو مهم.",
    },
    "fees-and-budgets": {
      name: "الرسوم والميزانية",
      description: "كيف تعمل الرسوم، وما الذي يشمله المبلغ، وكيف تقدّر التكلفة الإجمالية للسنة الأولى قبل القرار.",
    },
    admissions: {
      name: "القبول",
      description: "الجداول الزمنية، المستندات، أيام التجربة، وما الذي يجب سؤاله للحصول على إجابات واضحة مبكرًا.",
    },
    curriculum: {
      name: "المنهج",
      description: "IB والبريطاني وكامبريدج والأمريكي ومونتيسوري — ما الذي تعنيه العائلات بعبارة “الملاءمة الصحيحة”.",
    },
    "areas-and-lifestyle": {
      name: "المناطق ونمط الحياة",
      description: "واقع التنقل، والأحياء المناسبة للعائلات، وكيف يغيّر الموقع قائمة المدارس المختصرة.",
    },
    relocation: {
      name: "الانتقال",
      description: "اعتبارات عملية للعائلات المنتقلة إلى بالي: التخطيط، الاستقرار، والانتقال بين المدارس.",
    },
  },
};

function localizeTopic(topic: GuideTopic, locale = "en"): GuideTopic {
  const translated = TOPIC_TRANSLATIONS[locale]?.[topic.slug];
  if (translated) return { ...topic, ...translated };
  return topic;
}

function postMatchesTopic(post: PostMeta, topic: GuideTopic) {
  const haystack = [post.title, post.category ?? "", ...(post.tags ?? [])].join(" ").toLowerCase();
  return topic.match.some((m) => haystack.includes(m.toLowerCase()));
}

export function getGuideTopic(topicSlug: string, locale: string = "en"): GuideTopic | null {
  const topic = GUIDE_TOPICS.find((t) => t.slug === slugify(topicSlug));
  if (!topic) return null;
  return localizeTopic(topic, locale);
}

export function getGuideTopicsWithCounts(locale: string = "en") {
  const posts = getAllPosts(locale);
  return GUIDE_TOPICS.map((t) => {
    const localized = localizeTopic(t, locale);
    return {
      ...localized,
      count: posts.filter((p) => postMatchesTopic(p, t)).length,
    };
  }).filter((t) => t.count > 0);
}

export function getPostsForTopic(topicSlug: string, locale: string = "en"): PostMeta[] {
  const topic = GUIDE_TOPICS.find((t) => t.slug === slugify(topicSlug));
  if (!topic) return [];
  const posts = getAllPosts(locale);
  return posts.filter((p) => postMatchesTopic(p, topic));
}
