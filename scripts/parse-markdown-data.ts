#!/usr/bin/env npx tsx

/**
 * Parse markdown tables from Claude's research output and convert to JSON
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
}

// Category mapping from research categories to our slugs
const CATEGORY_MAP: Record<string, string> = {
  // Direct mappings
  "growth & acquisition": "growth-acquisition",
  "product launch & strategy": "product-launch",
  "pricing & monetization": "pricing-monetization",
  "platform strategy": "platform-strategy",
  "user research & discovery": "user-research",
  "pivots & turnarounds": "pivots",
  "pivots": "pivots",

  // New categories we need to add
  "retention & engagement": "retention-engagement",
  "ai/ml product": "ai-ml-product",
  "b2b product management": "b2b-product",
  "onboarding & activation": "onboarding-activation",
  "data-driven decisions": "data-driven",
  "product-led growth": "product-led-growth",
  "marketplace dynamics": "marketplace-dynamics",
  "feature prioritization": "feature-prioritization",
  "developer tools & apis": "developer-tools",
  "mobile product": "mobile-product",
  "payments & commerce": "payments-commerce",
  "internationalization": "internationalization",
  "trust & safety": "trust-safety",

  // Fallbacks
  "design & ux": "design-ux",
  "engineering culture": "engineering-culture",
  "startup post-mortems": "post-mortems",
  "post-mortems": "post-mortems",
  "scaling": "scaling",
};

// Format mapping
const FORMAT_MAP: Record<string, string> = {
  "case study": "article",
  "article": "article",
  "insight article": "article",
  "blog": "article",
  "essay": "article",
  "long-form": "article",
  "deep dive": "article",
  "interview": "article",
  "newsletter": "article",
  "research": "article",
  "research paper": "pdf",
  "framework": "article",
  "reference": "article",
  "guidelines": "article",
  "benchmark": "article",
  "analysis": "article",
  "multi-chapter": "article",
  "collection": "article",

  "video": "video",
  "webinar": "video",
  "interactive": "video",
  "slideshow": "slides",
  "slide deck": "slides",
  "slides": "slides",

  "podcast": "podcast",
  "podcast 3+ hrs": "podcast",
  "podcast 4+ hrs": "podcast",
  "podcast series": "podcast",

  "book": "article",
  "book/blog": "article",
  "blog series": "article",
  "series": "article",

  "interview prep": "article",
  "rca": "article",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 80);
}

function parseMarkdownTable(tableText: string): Record<string, string>[] {
  const lines = tableText.trim().split("\n").filter(line => line.trim());
  if (lines.length < 3) return []; // Need header, separator, and at least one row

  // Parse header
  const headerLine = lines[0];
  const headers = headerLine.split("|")
    .map(h => h.trim().toLowerCase())
    .filter(h => h);

  // Skip separator line (index 1)

  // Parse data rows
  const rows: Record<string, string>[] = [];
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes("|")) continue;

    const values = line.split("|").map(v => v.trim()).filter((_, idx) => idx > 0);
    if (values.length === 0) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || "";
    });

    // Only include rows with a valid URL
    if (row.url && row.url.startsWith("http")) {
      rows.push(row);
    }
  }

  return rows;
}

function extractTables(markdown: string): string[] {
  const tables: string[] = [];
  const lines = markdown.split("\n");

  let inTable = false;
  let currentTable: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      inTable = true;
      currentTable.push(line);
    } else if (inTable) {
      if (currentTable.length > 2) {
        tables.push(currentTable.join("\n"));
      }
      currentTable = [];
      inTable = false;
    }
  }

  // Don't forget last table
  if (currentTable.length > 2) {
    tables.push(currentTable.join("\n"));
  }

  return tables;
}

function mapCategory(category: string): string {
  const normalized = category.toLowerCase().trim();
  return CATEGORY_MAP[normalized] || "product-launch"; // Default fallback
}

function mapFormat(format: string): string {
  const normalized = format.toLowerCase().trim();
  return FORMAT_MAP[normalized] || "article"; // Default fallback
}

function parseDate(dateStr: string): string {
  if (!dateStr || dateStr === "N/A" || dateStr === "Various") {
    return "Unknown";
  }

  // Try to parse common formats
  const cleaned = dateStr.trim();

  // "Dec 2011" format
  const monthYearMatch = cleaned.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const months: Record<string, string> = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12"
    };
    const month = months[monthYearMatch[1].toLowerCase().substring(0, 3)];
    if (month) {
      return `${monthYearMatch[2]}-${month}-01`;
    }
  }

  // "2024" format
  const yearMatch = cleaned.match(/^(\d{4})$/);
  if (yearMatch) {
    return `${yearMatch[1]}-01-01`;
  }

  // "2015+" format
  const yearPlusMatch = cleaned.match(/^(\d{4})\+$/);
  if (yearPlusMatch) {
    return `${yearPlusMatch[1]}-01-01`;
  }

  // "Fall 2024" etc
  const seasonYearMatch = cleaned.match(/^(Spring|Summer|Fall|Winter)\s+(\d{4})$/i);
  if (seasonYearMatch) {
    const seasonMonth: Record<string, string> = {
      spring: "04", summer: "07", fall: "10", winter: "01"
    };
    const month = seasonMonth[seasonYearMatch[1].toLowerCase()];
    return `${seasonYearMatch[2]}-${month}-01`;
  }

  // "2022-2023" range - use first year
  const rangeMatch = cleaned.match(/^(\d{4})-(\d{4})$/);
  if (rangeMatch) {
    return `${rangeMatch[1]}-01-01`;
  }

  return "Unknown";
}

function parseTags(tagsStr: string): string[] {
  if (!tagsStr) return [];
  return tagsStr.split(",").map(t => t.trim()).filter(t => t && t !== "N/A");
}

function transformRow(row: Record<string, string>, id: number): CaseStudy | null {
  const title = row.title;
  const url = row.url;

  if (!title || !url || !url.startsWith("http")) {
    return null;
  }

  const category = mapCategory(row.category || "Product Launch & Strategy");
  const format = mapFormat(row.format || "Article");
  const tags = parseTags(row.tags || "");
  const datePublished = parseDate(row.date || row["date published"] || "");

  // Extract source - handle "Source/Author" column
  let source = row.source || row["source/author"] || "";
  if (source.includes("/")) {
    source = source.split("/")[0].trim();
  }
  if (source.includes(" - ")) {
    source = source.split(" - ")[0].trim();
  }

  const company = row.company || "";
  const description = (row["short description"] || row.description || "").substring(0, 300);

  return {
    id: String(id),
    slug: slugify(title),
    title,
    url,
    category,
    tags,
    description,
    datePublished,
    source,
    format,
    company,
    createdAt: new Date().toISOString().split("T")[0],
  };
}

function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    console.log("Usage: npx tsx scripts/parse-markdown-data.ts path/to/markdown.md");
    console.log("");
    console.log("This script parses markdown tables from Claude's research output");
    console.log("and converts them to our case-studies.json format.");
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File not found: ${inputPath}`);
    process.exit(1);
  }

  console.log(`Reading markdown from: ${inputPath}`);
  const markdown = fs.readFileSync(inputPath, "utf-8");

  // Extract all tables
  const tables = extractTables(markdown);
  console.log(`Found ${tables.length} tables`);

  // Parse all tables
  const allRows: Record<string, string>[] = [];
  for (const table of tables) {
    const rows = parseMarkdownTable(table);
    allRows.push(...rows);
  }
  console.log(`Parsed ${allRows.length} rows total`);

  // Transform to our format
  const caseStudies: CaseStudy[] = [];
  const seenUrls = new Set<string>();
  let id = 1;

  for (const row of allRows) {
    // Skip duplicates by URL
    if (seenUrls.has(row.url)) {
      continue;
    }

    const study = transformRow(row, id);
    if (study) {
      caseStudies.push(study);
      seenUrls.add(row.url);
      id++;
    }
  }

  console.log(`Transformed ${caseStudies.length} unique case studies`);

  // Check for duplicate slugs and make unique
  const slugCounts: Record<string, number> = {};
  for (const study of caseStudies) {
    slugCounts[study.slug] = (slugCounts[study.slug] || 0) + 1;
  }

  const slugSeen: Record<string, number> = {};
  for (const study of caseStudies) {
    if (slugCounts[study.slug] > 1) {
      slugSeen[study.slug] = (slugSeen[study.slug] || 0) + 1;
      if (slugSeen[study.slug] > 1) {
        study.slug = `${study.slug}-${study.id}`;
      }
    }
  }

  // Write output
  const outputPath = path.join(process.cwd(), "src/data/case-studies.json");
  fs.writeFileSync(outputPath, JSON.stringify(caseStudies, null, 2));

  console.log(`\nSuccess! Wrote ${caseStudies.length} case studies to:`);
  console.log(`  ${outputPath}`);

  // Summary by category
  console.log("\nCase studies by category:");
  const byCat: Record<string, number> = {};
  for (const study of caseStudies) {
    byCat[study.category] = (byCat[study.category] || 0) + 1;
  }
  Object.entries(byCat)
    .sort(([, a], [, b]) => b - a)
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });

  // Summary by format
  console.log("\nCase studies by format:");
  const byFormat: Record<string, number> = {};
  for (const study of caseStudies) {
    byFormat[study.format] = (byFormat[study.format] || 0) + 1;
  }
  Object.entries(byFormat)
    .sort(([, a], [, b]) => b - a)
    .forEach(([fmt, count]) => {
      console.log(`  ${fmt}: ${count}`);
    });
}

main();
