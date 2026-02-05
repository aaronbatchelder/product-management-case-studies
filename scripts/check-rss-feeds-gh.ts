/**
 * RSS Feed Monitoring Script for GitHub Actions
 *
 * Checks configured RSS feeds for new case study content and outputs
 * candidates to a JSON file for PR review.
 *
 * Run with: npx tsx scripts/check-rss-feeds-gh.ts
 */

import * as fs from "fs";
import * as path from "path";

import {
  RSS_SOURCES,
  CASE_STUDY_INDICATORS,
  EXCLUSION_KEYWORDS,
  type RSSSource,
} from "../src/lib/rss-sources";
import type { CaseStudy, Format } from "../src/lib/types";

interface FeedItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  content?: string;
}

interface CaseStudyCandidate extends CaseStudy {
  matchScore: number;
  matchedKeywords: string[];
  sourceFeed: string;
}

const CASE_STUDIES_FILE = path.join(
  process.cwd(),
  "src/data/case-studies.json"
);
const OUTPUT_FILE = path.join(process.cwd(), "new-case-studies.json");

// Simple XML parser for RSS feeds
function parseRSSXML(xml: string): FeedItem[] {
  const items: FeedItem[] = [];

  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>|<entry[^>]*>([\s\S]*?)<\/entry>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1] || match[2];

    const titleMatch = content.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const linkMatch =
      content.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i) ||
      content.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
    const pubDateMatch =
      content.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ||
      content.match(/<published[^>]*>([\s\S]*?)<\/published>/i) ||
      content.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i);
    const descMatch =
      content.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) ||
      content.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i);
    const contentMatch = content.match(
      /<content:encoded[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/i
    );

    if (titleMatch && linkMatch) {
      items.push({
        title: decodeHTMLEntities(titleMatch[1].trim()),
        link: linkMatch[1].trim(),
        pubDate: pubDateMatch ? pubDateMatch[1].trim() : undefined,
        description: descMatch ? decodeHTMLEntities(descMatch[1].trim()) : undefined,
        content: contentMatch ? decodeHTMLEntities(contentMatch[1].trim()) : undefined,
      });
    }
  }

  return items;
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function scoreContent(
  item: FeedItem,
  source: RSSSource
): { score: number; matchedKeywords: string[] } {
  const textToSearch = `${item.title} ${item.description || ""} ${item.content || ""}`.toLowerCase();
  const matchedKeywords: string[] = [];
  let score = 0;

  for (const pattern of CASE_STUDY_INDICATORS) {
    const regex = new RegExp(pattern, "i");
    if (regex.test(textToSearch)) {
      score += 20;
      matchedKeywords.push(pattern);
    }
  }

  for (const keyword of source.keywords) {
    if (textToSearch.includes(keyword.toLowerCase())) {
      score += 10;
      matchedKeywords.push(keyword);
    }
  }

  for (const keyword of EXCLUSION_KEYWORDS) {
    if (textToSearch.includes(keyword.toLowerCase())) {
      score -= 50;
    }
  }

  if (source.quality === "high") {
    score += 5;
  }

  return { score, matchedKeywords };
}

async function fetchFeed(source: RSSSource): Promise<FeedItem[]> {
  try {
    console.log(`  Fetching: ${source.name}...`);
    const response = await fetch(source.feedUrl, {
      headers: {
        "User-Agent": "ProductCaseStudies/1.0 (RSS Monitor)",
      },
    });

    if (!response.ok) {
      console.log(`    ⚠ HTTP ${response.status} for ${source.name}`);
      return [];
    }

    const xml = await response.text();
    const items = parseRSSXML(xml);
    console.log(`    ✓ Found ${items.length} items`);
    return items;
  } catch (error) {
    console.log(`    ✗ Error fetching ${source.name}: ${(error as Error).message}`);
    return [];
  }
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname.replace(/\/$/, "")}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80);
}

function generateId(): string {
  return `cs-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function parseDate(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  } catch {
    // ignore
  }
  return new Date().toISOString().split("T")[0];
}

async function main() {
  console.log("🔍 Product Case Studies RSS Monitor (GitHub Actions)\n");
  console.log(`Checking ${RSS_SOURCES.length} sources...\n`);

  // Load existing case studies to check for duplicates
  let existingStudies: CaseStudy[] = [];
  try {
    const data = fs.readFileSync(CASE_STUDIES_FILE, "utf-8");
    existingStudies = JSON.parse(data);
  } catch {
    console.log("Warning: Could not load existing case studies");
  }

  const existingUrls = new Set(existingStudies.map((s) => normalizeUrl(s.url)));
  const newCandidates: CaseStudyCandidate[] = [];
  const SCORE_THRESHOLD = 15;

  for (const source of RSS_SOURCES) {
    const items = await fetchFeed(source);

    for (const item of items) {
      const normalizedUrl = normalizeUrl(item.link);
      if (existingUrls.has(normalizedUrl)) {
        continue;
      }

      const { score, matchedKeywords } = scoreContent(item, source);

      if (score >= SCORE_THRESHOLD) {
        const candidate: CaseStudyCandidate = {
          id: generateId(),
          slug: generateSlug(item.title),
          title: item.title,
          url: item.link,
          category: source.category,
          tags: matchedKeywords.slice(0, 5),
          description: item.description?.substring(0, 300) || "",
          datePublished: parseDate(item.pubDate),
          source: source.name,
          format: "article" as Format,
          company: "Various",
          createdAt: new Date().toISOString(),
          matchScore: score,
          matchedKeywords,
          sourceFeed: source.name,
        };

        newCandidates.push(candidate);
        existingUrls.add(normalizedUrl);
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✅ Found ${newCandidates.length} new case study candidates`);

  if (newCandidates.length > 0) {
    // Sort by score descending
    newCandidates.sort((a, b) => b.matchScore - a.matchScore);

    // Write candidates to file for PR review
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(newCandidates, null, 2));
    console.log(`\n📝 Wrote candidates to: ${OUTPUT_FILE}`);

    // Also append to case-studies.json (reviewers can edit/remove before merging)
    const updatedStudies = [...existingStudies, ...newCandidates.map(({ matchScore, matchedKeywords, sourceFeed, ...study }) => study)];
    fs.writeFileSync(CASE_STUDIES_FILE, JSON.stringify(updatedStudies, null, 2));
    console.log(`📚 Updated case-studies.json with ${newCandidates.length} new entries`);

    console.log("\nTop candidates:");
    for (const candidate of newCandidates.slice(0, 5)) {
      console.log(`  • [${candidate.matchScore}] ${candidate.title.substring(0, 50)}...`);
      console.log(`    Source: ${candidate.sourceFeed}`);
    }
  } else {
    console.log("\nNo new candidates to add.");
  }
}

main().catch(console.error);
