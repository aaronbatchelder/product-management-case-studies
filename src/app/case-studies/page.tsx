import { Metadata } from "next";
import { Suspense } from "react";
import { getAllCaseStudies } from "@/lib/data";
import { CaseStudyList } from "@/components/CaseStudyList";

export const metadata: Metadata = {
  title: "Browse Case Studies",
  description:
    "Search and filter through 1000+ product management case studies. Find examples of growth strategies, product launches, pricing models, pivots, and more.",
  openGraph: {
    title: "Browse Case Studies | Product Case Studies",
    description:
      "Search and filter through 1000+ product management case studies. Find examples of growth strategies, product launches, pricing models, pivots, and more.",
  },
};

export default function CaseStudiesPage() {
  const caseStudies = getAllCaseStudies();

  return (
    <div className="py-section">
      <div className="container-content">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Browse Case Studies</h1>
          <p className="text-muted">
            Search and filter through our collection of product management case studies.
          </p>
        </header>

        <Suspense fallback={<CaseStudiesLoading />}>
          <CaseStudyList caseStudies={caseStudies} />
        </Suspense>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Browse Case Studies",
            description:
              "Search and filter through product management case studies covering growth, launches, pricing, pivots, and more.",
            url: "https://productcasestudies.com/case-studies",
            isPartOf: {
              "@type": "WebSite",
              name: "Product Case Studies",
              url: "https://productcasestudies.com",
            },
          }),
        }}
      />
    </div>
  );
}

function CaseStudiesLoading() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="h-4 bg-border rounded w-24 mb-2" />
          <div className="h-5 bg-border rounded w-3/4 mb-2" />
          <div className="h-4 bg-border rounded w-full" />
        </div>
      ))}
    </div>
  );
}
