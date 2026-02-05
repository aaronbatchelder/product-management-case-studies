import { Metadata } from "next";
import { SubmitForm } from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "Submit a Case Study | Product Case Studies",
  description:
    "Know a great product case study? Submit it for review and help the PM community learn from real-world examples.",
  openGraph: {
    title: "Submit a Case Study | Product Case Studies",
    description:
      "Know a great product case study? Submit it for review and help the PM community learn from real-world examples.",
    type: "website",
  },
};

export default function SubmitPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Submit a Case Study</h1>
      <p className="text-muted mb-8">
        Know a great product case study we&apos;re missing? Submit it below and
        we&apos;ll review it for inclusion in our database.
      </p>

      <div className="bg-cream border border-border rounded-lg p-6 mb-8">
        <h2 className="font-bold mb-2">What makes a good case study?</h2>
        <ul className="text-sm text-muted space-y-1">
          <li>
            • <strong>In-depth analysis</strong> of a real product or company
          </li>
          <li>
            • <strong>Actionable insights</strong> that PMs can apply
          </li>
          <li>
            • <strong>Specific examples</strong> with data or detailed processes
          </li>
          <li>
            • <strong>High-quality source</strong> (company blog, reputable
            publication, known PM thought leader)
          </li>
        </ul>
      </div>

      <SubmitForm />

      <div className="mt-12 pt-8 border-t border-border">
        <h2 className="font-bold mb-2">Submission Guidelines</h2>
        <div className="text-sm text-muted space-y-3">
          <p>
            <strong>Review process:</strong> Submissions are reviewed manually
            to ensure quality. We typically review new submissions within a few
            days.
          </p>
          <p>
            <strong>What we look for:</strong> Depth of analysis, credibility of
            source, relevance to product management, and uniqueness of insights.
          </p>
          <p>
            <strong>What we don&apos;t accept:</strong> Promotional content,
            listicles without depth, paywalled content (unless exceptional),
            duplicate submissions.
          </p>
        </div>
      </div>
    </main>
  );
}
