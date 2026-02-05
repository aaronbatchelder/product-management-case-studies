#!/usr/bin/env npx tsx

/**
 * CSV Import Script for Product Case Studies
 *
 * Usage: npm run import-csv -- path/to/your/data.csv
 *
 * Expected CSV columns:
 * - title (required)
 * - url (required)
 * - category (required) - must match category slugs
 * - description (required)
 * - datePublished (optional) - ISO date format or "Unknown"
 * - source (required) - source/author name
 * - format (required) - article, video, pdf, podcast, or slides
 * - company (required) - company featured in the case study
 * - tags (optional) - comma-separated tags
 */

import * as fs from "fs";
import * as path from "path";

// Category slugs (must match types.ts)
const VALID_CATEGORIES = [
  "growth-acquisition",
  "product-launch",
  "pricing-monetization",
  "platform-strategy",
  "user-research",
  "pivots",
  "design-ux",
  "engineering-culture",
  "post-mortems",
  "scaling",
];

const VALID_FORMATS = ["article", "video", "pdf", "podcast", "slides"];

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 100);
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split("\n").filter((line) => line.trim());
  if (lines.length < 2) {
    throw new Error("CSV must have at least a header row and one data row");
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);

  // Parse rows
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header.trim().toLowerCase()] = (values[index] || "").trim();
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function validateRow(
  row: Record<string, string>,
  index: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const required = ["title", "url", "category", "description", "source", "format", "company"];

  for (const field of required) {
    if (!row[field]) {
      errors.push(`Row ${index + 2}: Missing required field "${field}"`);
    }
  }

  if (row.category && !VALID_CATEGORIES.includes(row.category)) {
    errors.push(
      `Row ${index + 2}: Invalid category "${row.category}". Valid options: ${VALID_CATEGORIES.join(", ")}`
    );
  }

  if (row.format && !VALID_FORMATS.includes(row.format)) {
    errors.push(
      `Row ${index + 2}: Invalid format "${row.format}". Valid options: ${VALID_FORMATS.join(", ")}`
    );
  }

  if (row.url && !row.url.startsWith("http")) {
    errors.push(`Row ${index + 2}: URL must start with http or https`);
  }

  return { valid: errors.length === 0, errors };
}

function transformRow(row: Record<string, string>, id: number): CaseStudy {
  const tags = row.tags
    ? row.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return {
    id: String(id),
    slug: slugify(row.title),
    title: row.title,
    url: row.url,
    category: row.category,
    tags,
    description: row.description.substring(0, 300),
    datePublished: row.datepublished || row.date_published || "Unknown",
    source: row.source,
    format: row.format,
    company: row.company,
    createdAt: new Date().toISOString().split("T")[0],
  };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: npm run import-csv -- path/to/your/data.csv");
    console.log("");
    console.log("Expected CSV columns:");
    console.log("  - title (required)");
    console.log("  - url (required)");
    console.log("  - category (required) - one of:", VALID_CATEGORIES.join(", "));
    console.log("  - description (required)");
    console.log("  - datePublished (optional)");
    console.log("  - source (required)");
    console.log("  - format (required) - one of:", VALID_FORMATS.join(", "));
    console.log("  - company (required)");
    console.log("  - tags (optional) - comma-separated");
    process.exit(1);
  }

  const csvPath = args[0];
  if (!fs.existsSync(csvPath)) {
    console.error(`Error: File not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`Reading CSV from: ${csvPath}`);

  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(content);

  console.log(`Found ${rows.length} rows`);

  // Validate all rows
  const allErrors: string[] = [];
  rows.forEach((row, index) => {
    const { errors } = validateRow(row, index);
    allErrors.push(...errors);
  });

  if (allErrors.length > 0) {
    console.error("\nValidation errors:");
    allErrors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }

  // Transform rows
  const caseStudies = rows.map((row, index) => transformRow(row, index + 1));

  // Check for duplicate slugs
  const slugs = new Set<string>();
  const duplicates: string[] = [];
  caseStudies.forEach((cs) => {
    if (slugs.has(cs.slug)) {
      duplicates.push(cs.slug);
    }
    slugs.add(cs.slug);
  });

  if (duplicates.length > 0) {
    console.warn("\nWarning: Duplicate slugs detected (adding IDs to make unique):");
    duplicates.forEach((slug) => console.warn(`  - ${slug}`));

    // Make slugs unique by appending ID
    const slugCount: Record<string, number> = {};
    caseStudies.forEach((cs) => {
      if (duplicates.includes(cs.slug)) {
        slugCount[cs.slug] = (slugCount[cs.slug] || 0) + 1;
        if (slugCount[cs.slug] > 1) {
          cs.slug = `${cs.slug}-${cs.id}`;
        }
      }
    });
  }

  // Write output
  const outputPath = path.join(process.cwd(), "src/data/case-studies.json");
  fs.writeFileSync(outputPath, JSON.stringify(caseStudies, null, 2));

  console.log(`\nSuccess! Imported ${caseStudies.length} case studies to:`);
  console.log(`  ${outputPath}`);

  // Summary by category
  console.log("\nCase studies by category:");
  const byCat: Record<string, number> = {};
  caseStudies.forEach((cs) => {
    byCat[cs.category] = (byCat[cs.category] || 0) + 1;
  });
  Object.entries(byCat)
    .sort(([, a], [, b]) => b - a)
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
}

main();
