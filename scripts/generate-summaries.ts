/**
 * Script to fetch case study URLs and generate summaries using Claude API
 *
 * Run with: ANTHROPIC_API_KEY=your_key npx tsx scripts/generate-summaries.ts
 *
 * Options:
 *   --start=N     Start from index N (for resuming)
 *   --limit=N     Process only N case studies
 *   --free-only   Only process free case studies
 */

import Anthropic from "@anthropic-ai/sdk";
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
  access: string;
  summary?: string;
}

const CASE_STUDIES_FILE = path.join(
  process.cwd(),
  "src/data/case-studies.json"
);

const client = new Anthropic();

async function fetchPageContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ProductCaseStudies/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.log(`    ⚠ HTTP ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Basic HTML to text conversion
    let text = html
      // Remove script and style tags
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      // Remove HTML tags
      .replace(/<[^>]+>/g, " ")
      // Decode entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Clean up whitespace
      .replace(/\s+/g, " ")
      .trim();

    // Limit to ~10000 chars to stay within context limits
    if (text.length > 10000) {
      text = text.substring(0, 10000) + "...";
    }

    return text;
  } catch (error) {
    console.log(`    ✗ Fetch error: ${(error as Error).message}`);
    return null;
  }
}

async function generateSummary(
  study: CaseStudy,
  content: string
): Promise<string | null> {
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are summarizing a product management case study for a database that helps PMs learn from real-world examples.

Title: ${study.title}
Company: ${study.company}
Category: ${study.category}
Source: ${study.source}

Page content:
${content}

Please write a 2-4 paragraph summary (150-300 words) that covers:
1. The key problem or challenge addressed
2. The approach or strategy used
3. The outcomes and results (if mentioned)
4. Key takeaways for product managers

Write in a factual, informative tone. Focus on actionable insights. If the content is paywalled, promotional, or doesn't contain substantive case study content, respond with "SKIP".`,
        },
      ],
    });

    const response = message.content[0];
    if (response.type === "text") {
      const text = response.text.trim();
      if (text === "SKIP" || text.includes("SKIP")) {
        return null;
      }
      return text;
    }
    return null;
  } catch (error) {
    console.log(`    ✗ API error: ${(error as Error).message}`);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const startIndex = parseInt(
    args.find((a) => a.startsWith("--start="))?.split("=")[1] || "0"
  );
  const limit = parseInt(
    args.find((a) => a.startsWith("--limit="))?.split("=")[1] || "999"
  );
  const freeOnly = args.includes("--free-only");

  console.log("📚 Case Study Summary Generator\n");

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Error: ANTHROPIC_API_KEY environment variable required");
    process.exit(1);
  }

  // Load case studies
  const data = fs.readFileSync(CASE_STUDIES_FILE, "utf-8");
  const studies: CaseStudy[] = JSON.parse(data);

  console.log(`Total case studies: ${studies.length}`);
  console.log(`Starting from index: ${startIndex}`);
  console.log(`Limit: ${limit}`);
  console.log(`Free only: ${freeOnly}\n`);

  let processed = 0;
  let summarized = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = startIndex; i < studies.length && processed < limit; i++) {
    const study = studies[i];

    // Skip if already has summary
    if (study.summary) {
      console.log(`[${i}] ${study.title.substring(0, 50)}... (already has summary)`);
      continue;
    }

    // Skip paid content if --free-only
    if (freeOnly && study.access === "paid") {
      console.log(`[${i}] ${study.title.substring(0, 50)}... (paid, skipping)`);
      skipped++;
      continue;
    }

    // Skip videos and podcasts (can't fetch content)
    if (["video", "podcast"].includes(study.format)) {
      console.log(`[${i}] ${study.title.substring(0, 50)}... (${study.format}, skipping)`);
      skipped++;
      continue;
    }

    console.log(`[${i}] ${study.title.substring(0, 50)}...`);
    console.log(`    URL: ${study.url}`);

    processed++;

    // Fetch page content
    const content = await fetchPageContent(study.url);
    if (!content || content.length < 500) {
      console.log(`    ⚠ Insufficient content (${content?.length || 0} chars)`);
      errors++;
      continue;
    }

    console.log(`    ✓ Fetched ${content.length} chars`);

    // Generate summary
    const summary = await generateSummary(study, content);
    if (summary) {
      study.summary = summary;
      summarized++;
      console.log(`    ✓ Generated summary (${summary.length} chars)`);

      // Save after each successful summary
      fs.writeFileSync(CASE_STUDIES_FILE, JSON.stringify(studies, null, 2));
    } else {
      console.log(`    ⚠ No summary generated`);
      errors++;
    }

    // Rate limiting - wait between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n" + "=".repeat(50));
  console.log(`Processed: ${processed}`);
  console.log(`Summarized: ${summarized}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`\nResults saved to: ${CASE_STUDIES_FILE}`);
}

main().catch(console.error);
