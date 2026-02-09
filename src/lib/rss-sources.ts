/**
 * High-quality PM content sources to monitor for new case studies
 */

export interface RSSSource {
  name: string;
  feedUrl: string;
  websiteUrl: string;
  category: string; // Default category for new items
  quality: "high" | "medium"; // Quality tier
  keywords: string[]; // Keywords that indicate case study content
}

export const RSS_SOURCES: RSSSource[] = [
  // Tier 1: High-quality PM publications
  {
    name: "Lenny's Newsletter",
    feedUrl: "https://www.lennysnewsletter.com/feed",
    websiteUrl: "https://www.lennysnewsletter.com",
    category: "product-launch",
    quality: "high",
    keywords: ["how", "builds product", "case study", "growth", "strategy"],
  },
  {
    name: "First Round Review",
    feedUrl: "https://review.firstround.com/feed.xml",
    websiteUrl: "https://review.firstround.com",
    category: "product-launch",
    quality: "high",
    keywords: ["product-market fit", "founder", "startup", "growth", "strategy"],
  },
  {
    name: "Reforge Blog",
    feedUrl: "https://www.reforge.com/blog/rss.xml",
    websiteUrl: "https://www.reforge.com/blog",
    category: "growth-acquisition",
    quality: "high",
    keywords: ["growth", "retention", "monetization", "strategy"],
  },
  {
    name: "a]16z",
    feedUrl: "https://a16z.com/feed/",
    websiteUrl: "https://a16z.com",
    category: "platform-strategy",
    quality: "high",
    keywords: ["marketplace", "network effects", "platform", "AI"],
  },

  // Tier 1: PM Influencers
  {
    name: "Andrew Chen",
    feedUrl: "https://andrewchen.com/feed/",
    websiteUrl: "https://andrewchen.com",
    category: "growth-acquisition",
    quality: "high",
    keywords: ["growth", "marketplace", "network effects", "viral"],
  },
  {
    name: "Casey Winters",
    feedUrl: "https://caseyaccidental.com/feed/",
    websiteUrl: "https://caseyaccidental.com",
    category: "growth-acquisition",
    quality: "high",
    keywords: ["growth", "marketplace", "PLG", "loops"],
  },
  {
    name: "Brian Balfour",
    feedUrl: "https://brianbalfour.com/feed",
    websiteUrl: "https://brianbalfour.com",
    category: "growth-acquisition",
    quality: "high",
    keywords: ["growth", "PMF", "four fits", "strategy"],
  },
  {
    name: "SVPG (Marty Cagan)",
    feedUrl: "https://www.svpg.com/feed/",
    websiteUrl: "https://www.svpg.com",
    category: "product-launch",
    quality: "high",
    keywords: ["product", "teams", "discovery", "empowered"],
  },

  // Tier 1: Strategy Publications
  {
    name: "Stratechery",
    feedUrl: "https://stratechery.com/feed/",
    websiteUrl: "https://stratechery.com",
    category: "platform-strategy",
    quality: "high",
    keywords: ["strategy", "aggregation", "platform", "business model"],
  },
  {
    name: "Not Boring",
    feedUrl: "https://www.notboring.co/feed",
    websiteUrl: "https://www.notboring.co",
    category: "platform-strategy",
    quality: "high",
    keywords: ["strategy", "company", "business", "growth"],
  },
  {
    name: "The Generalist",
    feedUrl: "https://www.generalist.com/feed",
    websiteUrl: "https://www.generalist.com",
    category: "platform-strategy",
    quality: "high",
    keywords: ["company", "strategy", "deep dive", "analysis"],
  },

  // Tier 2: Good PM content
  {
    name: "Mind the Product",
    feedUrl: "https://www.mindtheproduct.com/feed/",
    websiteUrl: "https://www.mindtheproduct.com",
    category: "product-launch",
    quality: "medium",
    keywords: ["case study", "product", "PM", "strategy"],
  },
  {
    name: "Product Coalition",
    feedUrl: "https://productcoalition.com/feed",
    websiteUrl: "https://productcoalition.com",
    category: "product-launch",
    quality: "medium",
    keywords: ["case study", "product", "growth", "retention"],
  },
  {
    name: "Growth.Design",
    feedUrl: "https://growth.design/feed.xml",
    websiteUrl: "https://growth.design",
    category: "retention-engagement",
    quality: "high",
    keywords: ["case study", "psychology", "UX", "growth"],
  },
  {
    name: "Built for Mars",
    feedUrl: "https://builtformars.com/feed",
    websiteUrl: "https://builtformars.com",
    category: "user-research",
    quality: "high",
    keywords: ["UX", "case study", "analysis", "comparison"],
  },

  // Tier 2: VC/Startup ecosystem
  {
    name: "Y Combinator Blog",
    feedUrl: "https://www.ycombinator.com/blog/rss/",
    websiteUrl: "https://www.ycombinator.com/library",
    category: "product-launch",
    quality: "medium",
    keywords: ["startup", "PMF", "founder", "growth"],
  },
  {
    name: "Sequoia",
    feedUrl: "https://www.sequoiacap.com/feed/",
    websiteUrl: "https://www.sequoiacap.com",
    category: "growth-acquisition",
    quality: "high",
    keywords: ["growth", "company building", "strategy"],
  },
];

// Keywords that strongly indicate case study content
// These patterns must match actual company/product case studies, not general advice
export const CASE_STUDY_INDICATORS = [
  "case study",
  "how .* built",
  "how .* grew",
  "how .* scaled",
  "how .* achieved",
  "behind the scenes at",
  "path to product-market fit",
  "founding story",
  "growth story",
  "inside .*'s",
  "the story of how",
  "deep dive into",
  "breakdown of",
  "\\$\\d+.*revenue", // Revenue numbers indicate real case study
  "\\d+% growth", // Growth metrics indicate real case study
  "from \\d+ to \\d+", // Growth trajectory patterns
];

// Keywords that indicate NOT a case study (filter out)
export const EXCLUSION_KEYWORDS = [
  "job posting",
  "hiring",
  "we're looking for",
  "podcast episode",
  "roundup",
  "newsletter digest",
  "weekly links",
  "sponsor",
  "tips for",
  "how to become",
  "career advice",
  "interview questions",
  "best practices",
  "guide to",
  "introduction to",
  "what is a",
  "framework for",
  "template",
  "checklist",
  "book review",
  "book summary",
  "announcement",
  "webinar",
  "event",
  "conference",
];
