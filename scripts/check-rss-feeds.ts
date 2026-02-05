/**
 * RSS Feed Monitoring Script
 *
 * Checks configured RSS feeds for new case study content and adds
 * candidates to a pending review queue.
 *
 * Run with: npx tsx scripts/check-rss-feeds.ts
 * Schedule with cron for daily execution
 */

import * as fs from "fs";
import * as path from "path";

import {
  RSS_SOURCES,
  CASE_STUDY_INDICATORS,
  EXCLUSION_KEYWORDS,
  type RSSSource,
} from "../src/lib/rss-sources";

interface FeedItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  content?: string;
}

interface PendingSubmission {
  id: string;
  title: string;
  url: string;
  description: string;
  suggestedCategory: string;
  source: string;
  sourceType: "rss" | "community";
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  matchScore: number;
  matchedKeywords: string[];
}

interface PendingSubmissionsData {
  lastChecked: string;
  submissions: PendingSubmission[];
}

const PENDING_FILE = path.join(
  __dirname,
  "../src/data/pending-submissions.json"
);
const CASE_STUDIES_FILE = path.join(
  __dirname,
  "../src/data/case-studies.json"
);

// Simple XML parser for RSS feeds (no external dependencies)
function parseRSSXML(xml: string): FeedItem[] {
  const items: FeedItem[] = [];

  // Extract all <item> or <entry> elements
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
    .replace(/<[^>]+>/g, "") // Strip HTML tags
    .trim();
}

function scoreContent(
  item: FeedItem,
  source: RSSSource
): { score: number; matchedKeywords: string[] } {
  const textToSearch = `${item.title} ${item.description || ""} ${item.content || ""}`.toLowerCase();
  const matchedKeywords: string[] = [];
  let score = 0;

  // Check for case study indicators (regex patterns)
  for (const pattern of CASE_STUDY_INDICATORS) {
    const regex = new RegExp(pattern, "i");
    if (regex.test(textToSearch)) {
      score += 20;
      matchedKeywords.push(pattern);
    }
  }

  // Check for source-specific keywords
  for (const keyword of source.keywords) {
    if (textToSearch.includes(keyword.toLowerCase())) {
      score += 10;
      matchedKeywords.push(keyword);
    }
  }

  // Check for exclusion keywords (negative score)
  for (const keyword of EXCLUSION_KEYWORDS) {
    if (textToSearch.includes(keyword.toLowerCase())) {
      score -= 50;
    }
  }

  // Bonus for high-quality sources
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

function loadPendingSubmissions(): PendingSubmissionsData {
  try {
    const data = fs.readFileSync(PENDING_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {
      lastChecked: new Date().toISOString(),
      submissions: [],
    };
  }
}

function loadExistingUrls(): Set<string> {
  const urls = new Set<string>();

  // Load from case studies
  try {
    const data = fs.readFileSync(CASE_STUDIES_FILE, "utf-8");
    const studies = JSON.parse(data);
    for (const study of studies) {
      urls.add(normalizeUrl(study.url));
    }
  } catch {
    // File doesn't exist yet
  }

  // Load from pending
  const pending = loadPendingSubmissions();
  for (const sub of pending.submissions) {
    urls.add(normalizeUrl(sub.url));
  }

  return urls;
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove trailing slashes and normalize
    return `${parsed.hostname}${parsed.pathname.replace(/\/$/, "")}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function generateId(): string {
  return `rss-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

async function main() {
  console.log("🔍 Product Case Studies RSS Monitor\n");
  console.log(`Checking ${RSS_SOURCES.length} sources...\n`);

  const existingUrls = loadExistingUrls();
  const pending = loadPendingSubmissions();
  const newCandidates: PendingSubmission[] = [];
  const SCORE_THRESHOLD = 15;

  for (const source of RSS_SOURCES) {
    const items = await fetchFeed(source);

    for (const item of items) {
      // Skip if we already have this URL
      const normalizedUrl = normalizeUrl(item.link);
      if (existingUrls.has(normalizedUrl)) {
        continue;
      }

      // Score the content
      const { score, matchedKeywords } = scoreContent(item, source);

      if (score >= SCORE_THRESHOLD) {
        const submission: PendingSubmission = {
          id: generateId(),
          title: item.title,
          url: item.link,
          description: item.description?.substring(0, 500) || "",
          suggestedCategory: source.category,
          source: source.name,
          sourceType: "rss",
          submittedAt: new Date().toISOString(),
          status: "pending",
          matchScore: score,
          matchedKeywords,
        };

        newCandidates.push(submission);
        existingUrls.add(normalizedUrl); // Prevent duplicates within run
      }
    }
  }

  // Add new candidates to pending
  pending.submissions.push(...newCandidates);
  pending.lastChecked = new Date().toISOString();

  // Save
  fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2));

  console.log("\n" + "=".repeat(50));
  console.log(`✅ Found ${newCandidates.length} new case study candidates`);
  console.log(`📋 Total pending: ${pending.submissions.filter((s) => s.status === "pending").length}`);

  if (newCandidates.length > 0) {
    console.log("\nNew candidates:");
    for (const candidate of newCandidates.slice(0, 10)) {
      console.log(`  • ${candidate.title.substring(0, 60)}...`);
      console.log(`    Score: ${candidate.matchScore} | Source: ${candidate.source}`);
    }
    if (newCandidates.length > 10) {
      console.log(`  ... and ${newCandidates.length - 10} more`);
    }
  }

  console.log(`\nResults saved to: ${PENDING_FILE}`);
}

main().catch(console.error);
