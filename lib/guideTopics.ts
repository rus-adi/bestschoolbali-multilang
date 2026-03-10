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

const ES_TOPICS: Record<string, { name: string; description: string }> = {
  "getting-started": {
    name: "Primeros pasos",
    description: "Listas cortas, checklists de visitas y la forma más rápida de reducir opciones sin perder nada importante.",
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
    description: "IB, Británico, Cambridge, Americano, Montessori: lo que realmente significa elegir el mejor encaje.",
  },
  "areas-and-lifestyle": {
    name: "Zonas y estilo de vida",
    description: "Realidad de los traslados, barrios familiares y cómo la ubicación cambia tu lista corta de escuelas.",
  },
  relocation: {
    name: "Reubicación",
    description: "Consideraciones prácticas para familias que se mudan a Bali: planificación, adaptación y transición escolar.",
  },
};

function localizeTopic(topic: GuideTopic, locale = "en"): GuideTopic {
  if (locale === "es") {
    const translated = ES_TOPICS[topic.slug];
    if (translated) return { ...topic, ...translated };
  }
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
