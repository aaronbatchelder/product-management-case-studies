import { Metadata } from "next";
import { getCategoriesWithCounts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse product management case studies by category: Growth & Acquisition, Product Launch, Pricing & Monetization, Platform Strategy, User Research, Pivots, and more.",
  openGraph: {
    title: "Categories | Product Case Studies",
    description:
      "Browse product management case studies by category: Growth & Acquisition, Product Launch, Pricing & Monetization, Platform Strategy, User Research, Pivots, and more.",
  },
};

export default function CategoriesPage() {
  const categories = getCategoriesWithCounts();

  return (
    <div className="py-section">
      <div className="container-content">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Categories</h1>
          <p className="text-muted">
            Browse case studies by topic to find relevant examples for your work.
          </p>
        </header>

        <div className="grid gap-4">
          {categories.map((category) => (
            <a
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="card group flex items-start justify-between"
            >
              <div>
                <h2 className="font-medium group-hover:text-accent transition-colors">
                  {category.name}
                </h2>
                <p className="text-sm text-muted mt-1">{category.description}</p>
              </div>
              <span className="text-sm text-muted shrink-0 ml-4">
                {category.count} {category.count === 1 ? "study" : "studies"}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Categories",
            description:
              "Browse product management case studies by category.",
            url: "https://productcasestudies.com/categories",
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
