/**
 * Script to add access type (free/paid) to all case studies
 * based on their URL and source.
 *
 * Run with: npx tsx scripts/add-access-type.ts
 */

import * as fs from "fs";
import * as path from "path";

interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  url: string;
  category: string;
  tags: string[];
  description: string;
  datePublished: string;
  source: string;
  format: string;
  company: string;
  createdAt: string;
  access?: string;
}

// Domains/sources that are typically paywalled
const PAID_DOMAINS = [
  "store.hbr.org",
  "hbr.org/store",
  "hbs.edu/faculty", // HBS case studies require purchase
  "ssrn.com", // Some papers are paid
  "jstor.org",
  "springer.com",
  "wiley.com",
  "sciencedirect.com",
  "emerald.com",
  "tandfonline.com",
];

const PAID_SOURCES = [
  "HBS",
  "Harvard Business School",
  "Harvard Business Review", // Most HBR content is paywalled
  "MIT Sloan",
  "Stanford GSB",
  "Kellogg",
  "Wharton",
  "INSEAD",
];

// Domains that are typically free
const FREE_DOMAINS = [
  "youtube.com",
  "youtu.be",
  "medium.com",
  "substack.com",
  "lennysnewsletter.com",
  "firstround.com",
  "review.firstround.com",
  "a16z.com",
  "andrewchen.com",
  "reforge.com/blog",
  "stratechery.com", // Has free tier
  "notboring.co",
  "generalist.com",
  "caseyaccidental.com",
  "brianbalfour.com",
  "svpg.com",
  "mindtheproduct.com",
  "productcoalition.com",
  "growth.design",
  "builtformars.com",
  "ycombinator.com",
  "sequoiacap.com",
  "nfx.com",
  "intercom.com",
  "amplitude.com",
  "mixpanel.com",
  "segment.com",
  "productboard.com",
  "pendo.io",
  "spotify.design",
  "airbnb.design",
  "uber.com/blog",
  "engineering.atspotify.com",
  "slack.engineering",
  "netflixtechblog.com",
  "dropbox.tech",
  "stripe.com/blog",
  "github.blog",
  "blog.google",
  "engineering.fb.com",
  "linkedin.com/pulse",
  "ted.com",
  "slideshare.net",
  "speakerdeck.com",
  "docs.google.com",
  "notion.so",
  "figma.com",
  "miro.com",
  "twitter.com",
  "x.com",
  "news.ycombinator.com",
  "techcrunch.com",
  "wired.com",
  "theverge.com",
  "arstechnica.com",
  "producthunt.com",
  "indie hackers",
  "wikipedia.org",
];

function isPaidContent(study: CaseStudy): boolean {
  const url = study.url.toLowerCase();
  const source = study.source.toLowerCase();

  // Check if URL contains paid domain patterns
  for (const domain of PAID_DOMAINS) {
    if (url.includes(domain.toLowerCase())) {
      return true;
    }
  }

  // Check if source is a known paid source
  for (const paidSource of PAID_SOURCES) {
    if (source.includes(paidSource.toLowerCase())) {
      // Exception: some HBR articles are free (hbr.org without /store)
      if (paidSource.toLowerCase().includes("harvard") &&
          url.includes("hbr.org") &&
          !url.includes("store") &&
          !url.includes("hbs.edu")) {
        return false;
      }
      return true;
    }
  }

  return false;
}

function isFreeContent(study: CaseStudy): boolean {
  const url = study.url.toLowerCase();

  for (const domain of FREE_DOMAINS) {
    if (url.includes(domain.toLowerCase())) {
      return true;
    }
  }

  return false;
}

function categorizeAccess(study: CaseStudy): "free" | "paid" {
  // First check if it's definitely paid
  if (isPaidContent(study)) {
    return "paid";
  }

  // Then check if it's definitely free
  if (isFreeContent(study)) {
    return "free";
  }

  // Default to free for unknown sources (most web content is free)
  return "free";
}

const CASE_STUDIES_FILE = path.join(
  process.cwd(),
  "src/data/case-studies.json"
);

async function main() {
  console.log("📊 Adding access type to case studies...\n");

  // Load case studies
  const data = fs.readFileSync(CASE_STUDIES_FILE, "utf-8");
  const studies: CaseStudy[] = JSON.parse(data);

  let freeCount = 0;
  let paidCount = 0;
  const paidStudies: { title: string; source: string; url: string }[] = [];

  // Categorize each study
  for (const study of studies) {
    study.access = categorizeAccess(study);
    if (study.access === "paid") {
      paidCount++;
      paidStudies.push({
        title: study.title,
        source: study.source,
        url: study.url,
      });
    } else {
      freeCount++;
    }
  }

  // Save updated data
  fs.writeFileSync(CASE_STUDIES_FILE, JSON.stringify(studies, null, 2));

  console.log("✅ Done!\n");
  console.log(`Free: ${freeCount}`);
  console.log(`Paid: ${paidCount}`);
  console.log(`Total: ${studies.length}\n`);

  if (paidStudies.length > 0) {
    console.log("Paid case studies:");
    for (const study of paidStudies) {
      console.log(`  • ${study.title}`);
      console.log(`    Source: ${study.source}`);
      console.log(`    URL: ${study.url}\n`);
    }
  }
}

main().catch(console.error);
