import { Metadata } from "next";
import { ReviewQueue } from "@/components/ReviewQueue";

export const metadata: Metadata = {
  title: "Review Queue | Admin | Product Case Studies",
  robots: "noindex, nofollow",
};

export default function AdminReviewPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Review Queue</h1>
          <p className="text-muted mt-1">
            Review and approve submitted case studies
          </p>
        </div>
      </div>

      <ReviewQueue />
    </main>
  );
}
