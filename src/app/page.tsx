import { SearchBarHome } from "@/components/SearchBar";
import { CategoryGrid } from "@/components/CategoryPill";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { getCategoriesWithCounts, getAllCaseStudies, getTotalCount } from "@/lib/data";

export default function HomePage() {
  const categories = getCategoriesWithCounts();
  const caseStudies = getAllCaseStudies();
  const totalCount = getTotalCount();

  // Get a diverse sample of recent case studies
  const featuredStudies = caseStudies.slice(0, 6);

  return (
    <>
      {/* Hero Section */}
      <section className="py-section">
        <div className="container-content text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-4">
            Learn from real product decisions
          </h1>
          <p className="text-muted max-w-lg mx-auto mb-8">
            A searchable database of {totalCount}+ product management case studies covering growth,
            launches, pricing, pivots, and more.
          </p>
          <SearchBarHome />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 border-t border-border">
        <div className="container-content">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted uppercase tracking-wide">
              Browse by Category
            </h2>
            <a href="/categories" className="text-xs text-accent hover:underline">
              View all
            </a>
          </div>
          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* Featured Case Studies */}
      <section className="py-section border-t border-border">
        <div className="container-content">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-medium text-muted uppercase tracking-wide">
              Featured Case Studies
            </h2>
            <a href="/case-studies" className="text-xs text-accent hover:underline">
              View all
            </a>
          </div>
          <div className="grid gap-4">
            {featuredStudies.map((study) => (
              <CaseStudyCard key={study.id} caseStudy={study} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section border-t border-border">
        <div className="container-content text-center">
          <h2 className="text-xl font-semibold mb-3">Use with AI assistants</h2>
          <p className="text-muted mb-6 max-w-md mx-auto">
            Connect Product Case Studies to Claude, Cursor, or other AI tools via MCP for
            instant access to case study insights.
          </p>
          <a href="/mcp" className="btn-primary">
            Set up MCP integration
          </a>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Product Case Studies",
            description:
              "A searchable database of product management case studies covering growth, launches, pricing, pivots, and more.",
            url: "https://productcasestudies.com",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://productcasestudies.com/case-studies?q={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </>
  );
}
