import { NextRequest, NextResponse } from "next/server";

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

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = "aaronbatchelder/product-management-case-studies";

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

    // If no GitHub token, fall back to logging (for local dev)
    if (!GITHUB_TOKEN) {
      console.log("Submission received (no GitHub token configured):", body);
      return NextResponse.json(
        { success: true, message: "Submission received (dev mode)" },
        { status: 201 }
      );
    }

    // Create GitHub Issue
    const issueTitle = `📚 Case Study Submission: ${body.title}`;
    const issueBody = `## Case Study Submission

**Title:** ${body.title}
**URL:** ${body.url}
**Category:** ${body.category}
**Format:** ${body.format || "article"}
**Company:** ${body.company || "Not specified"}

### Description
${body.description || "No description provided"}

### Submitter Notes
${body.notes || "None"}

### Submitter Email
${body.submitterEmail || "Not provided"}

---

### For Reviewers

To approve this submission, add the \`approved\` label. A GitHub Action will automatically create a PR to add this case study.

To reject, close the issue with a comment explaining why.

<details>
<summary>JSON Data (for automation)</summary>

\`\`\`json
${JSON.stringify({
  title: body.title,
  url: body.url,
  category: body.category,
  format: body.format || "article",
  company: body.company || "Various",
  description: body.description || "",
}, null, 2)}
\`\`\`

</details>
`;

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: ["case-study-submission", "pending-review"],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("GitHub API error:", error);
      return NextResponse.json(
        { error: "Failed to create submission" },
        { status: 500 }
      );
    }

    const issue = await response.json();

    return NextResponse.json(
      {
        success: true,
        issueNumber: issue.number,
        issueUrl: issue.html_url,
      },
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

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    githubConfigured: Boolean(GITHUB_TOKEN),
  });
}
