export type Format = "article" | "video" | "pdf" | "podcast" | "slides";
export type AccessType = "free" | "paid";

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  url: string;
  category: string;
  tags: string[];
  description: string;
  datePublished: string;
  source: string;
  format: Format;
  company: string;
  createdAt: string;
  access: AccessType;
  summary?: string; // Detailed summary of the case study content
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  count?: number;
}

export const CATEGORIES: Category[] = [
  {
    slug: "product-launch",
    name: "Product Launch & Strategy",
    description: "Go-to-market strategies, launch playbooks, product decisions",
  },
  {
    slug: "growth-acquisition",
    name: "Growth & Acquisition",
    description: "User growth, viral loops, marketing strategies",
  },
  {
    slug: "platform-strategy",
    name: "Platform Strategy",
    description: "Marketplaces, ecosystems, network effects",
  },
  {
    slug: "retention-engagement",
    name: "Retention & Engagement",
    description: "User retention, engagement loops, personalization",
  },
  {
    slug: "ai-ml-product",
    name: "AI/ML Product",
    description: "Building AI products, ML features, generative AI",
  },
  {
    slug: "b2b-product",
    name: "B2B Product Management",
    description: "Enterprise products, B2B SaaS, sales-led growth",
  },
  {
    slug: "pivots",
    name: "Pivots & Turnarounds",
    description: "Strategic changes, repositioning, recovery stories",
  },
  {
    slug: "pricing-monetization",
    name: "Pricing & Monetization",
    description: "Pricing models, freemium, revenue optimization",
  },
  {
    slug: "user-research",
    name: "User Research & Discovery",
    description: "Customer discovery, validation, PMF measurement",
  },
  {
    slug: "product-led-growth",
    name: "Product-Led Growth",
    description: "PLG strategies, self-serve, viral mechanics",
  },
  {
    slug: "data-driven",
    name: "Data-Driven Decisions",
    description: "Analytics, experimentation, metrics frameworks",
  },
  {
    slug: "marketplace-dynamics",
    name: "Marketplace Dynamics",
    description: "Two-sided marketplaces, supply/demand balance",
  },
  {
    slug: "onboarding-activation",
    name: "Onboarding & Activation",
    description: "User onboarding, activation strategies, first-time UX",
  },
  {
    slug: "feature-prioritization",
    name: "Feature Prioritization",
    description: "Roadmap management, prioritization frameworks",
  },
  {
    slug: "payments-commerce",
    name: "Payments & Commerce",
    description: "E-commerce, checkout, payment experiences",
  },
  {
    slug: "mobile-product",
    name: "Mobile Product",
    description: "Mobile apps, mobile-first strategies",
  },
  {
    slug: "developer-tools",
    name: "Developer Tools & APIs",
    description: "Dev tools, API products, developer experience",
  },
  {
    slug: "trust-safety",
    name: "Trust & Safety",
    description: "Platform safety, crisis management, responsible PM",
  },
  {
    slug: "internationalization",
    name: "Internationalization",
    description: "Global expansion, localization, multi-market",
  },
];

export const FORMATS: { value: Format; label: string }[] = [
  { value: "article", label: "Article" },
  { value: "video", label: "Video" },
  { value: "pdf", label: "PDF" },
  { value: "podcast", label: "Podcast" },
  { value: "slides", label: "Slides" },
];

export const ACCESS_TYPES: { value: AccessType; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];
