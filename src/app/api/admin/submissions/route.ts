import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import type { CaseStudy, Format } from "@/lib/types";

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
  format?: string;
  company?: string;
  submitterEmail?: string;
  notes?: string;
}

interface PendingSubmissionsData {
  lastChecked: string;
  submissions: PendingSubmission[];
}

const PENDING_FILE = path.join(
  process.cwd(),
  "src/data/pending-submissions.json"
);
const CASE_STUDIES_FILE = path.join(
  process.cwd(),
  "src/data/case-studies.json"
);

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

function savePendingSubmissions(data: PendingSubmissionsData): void {
  fs.writeFileSync(PENDING_FILE, JSON.stringify(data, null, 2));
}

function loadCaseStudies(): CaseStudy[] {
  try {
    const data = fs.readFileSync(CASE_STUDIES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveCaseStudies(studies: CaseStudy[]): void {
  fs.writeFileSync(CASE_STUDIES_FILE, JSON.stringify(studies, null, 2));
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

// GET - Retrieve all submissions
export async function GET() {
  try {
    const pending = loadPendingSubmissions();
    return NextResponse.json({
      submissions: pending.submissions,
      lastChecked: pending.lastChecked,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Approve or reject a submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, data } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: "Missing id or action" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const pending = loadPendingSubmissions();
    const submissionIndex = pending.submissions.findIndex((s) => s.id === id);

    if (submissionIndex === -1) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    const submission = pending.submissions[submissionIndex];

    if (action === "approve") {
      // Create new case study
      const caseStudies = loadCaseStudies();

      const newStudy: CaseStudy = {
        id: generateId(),
        slug: generateSlug(data?.title || submission.title),
        title: data?.title || submission.title,
        url: submission.url,
        category: data?.category || submission.suggestedCategory,
        tags: submission.matchedKeywords || [],
        description: data?.description || submission.description,
        datePublished: new Date().toISOString().split("T")[0],
        source: submission.source,
        format: (data?.format || submission.format || "article") as Format,
        company: data?.company || submission.company || "Various",
        createdAt: new Date().toISOString(),
      };

      // Ensure unique slug
      const slugBase = newStudy.slug;
      let counter = 1;
      while (caseStudies.some((s) => s.slug === newStudy.slug)) {
        newStudy.slug = `${slugBase}-${counter}`;
        counter++;
      }

      caseStudies.push(newStudy);
      saveCaseStudies(caseStudies);

      // Update submission status
      pending.submissions[submissionIndex].status = "approved";
      savePendingSubmissions(pending);

      return NextResponse.json({
        success: true,
        action: "approved",
        caseStudy: newStudy,
      });
    } else {
      // Reject
      pending.submissions[submissionIndex].status = "rejected";
      savePendingSubmissions(pending);

      return NextResponse.json({
        success: true,
        action: "rejected",
      });
    }
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
