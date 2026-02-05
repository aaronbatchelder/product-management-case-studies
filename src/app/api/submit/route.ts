import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

interface SubmissionRequest {
  url: string;
  title: string;
  description?: string;
  category: string;
  format?: string;
  company?: string;
  submitterEmail?: string;
  notes?: string;
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

function generateId(): string {
  return `community-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname.replace(/\/$/, "")}`.toLowerCase();
  } catch {
    return url.toLowerCase();
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

function savePendingSubmissions(data: PendingSubmissionsData): void {
  fs.writeFileSync(PENDING_FILE, JSON.stringify(data, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmissionRequest = await request.json();

    // Validate required fields
    if (!body.url || !body.title || !body.category) {
      return NextResponse.json(
        { error: "Missing required fields: url, title, and category are required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Load existing submissions
    const pending = loadPendingSubmissions();

    // Check for duplicates
    const normalizedUrl = normalizeUrl(body.url);
    const isDuplicate = pending.submissions.some(
      (s) => normalizeUrl(s.url) === normalizedUrl
    );

    if (isDuplicate) {
      return NextResponse.json(
        { error: "This URL has already been submitted" },
        { status: 409 }
      );
    }

    // Create new submission
    const submission: PendingSubmission = {
      id: generateId(),
      title: body.title,
      url: body.url,
      description: body.description?.substring(0, 300) || "",
      suggestedCategory: body.category,
      source: "Community Submission",
      sourceType: "community",
      submittedAt: new Date().toISOString(),
      status: "pending",
      matchScore: 0, // Community submissions don't get auto-scored
      matchedKeywords: [],
      format: body.format,
      company: body.company,
      submitterEmail: body.submitterEmail,
      notes: body.notes,
    };

    // Add to pending
    pending.submissions.push(submission);
    savePendingSubmissions(pending);

    return NextResponse.json(
      { success: true, id: submission.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve pending count (useful for admin)
export async function GET() {
  try {
    const pending = loadPendingSubmissions();
    const pendingCount = pending.submissions.filter(
      (s) => s.status === "pending"
    ).length;

    return NextResponse.json({
      pendingCount,
      lastChecked: pending.lastChecked,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
