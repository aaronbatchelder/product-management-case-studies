import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCaseStudiesByCategory,
  getCategoryBySlug,
  getCategoriesWithCounts,
} from "@/lib/data";
import { CATEGORIES } from "@/lib/types";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { CategoryPill } from "@/components/CategoryPill";

interface PageProps {
  params: { category: string };
}

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = getCategoryBySlug(params.category);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.name} Case Studies`,
    description: `Browse product management case studies about ${category.name.toLowerCase()}. ${category.description}`,
    openGraph: {
      title: `${category.name} Case Studies | Product Case Studies`,
      description: `Browse product management case studies about ${category.name.toLowerCase()}. ${category.description}`,
    },
  };
}

export default function CategoryPage({ params }: PageProps) {
  const category = getCategoryBySlug(params.category);

  if (!category) {
    notFound();
  }

  const caseStudies = getCaseStudiesByCategory(params.category);
  const allCategories = getCategoriesWithCounts();

  return (
    <div className="py-section">
      <div className="container-content">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted">
          <a href="/categories" className="hover:text-ink transition-colors">
            Categories
          </a>
          <span className="mx-2">/</span>
          <span className="text-ink">{category.name}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">{category.name}</h1>
          <p className="text-muted">{category.description}</p>
          <p className="text-sm text-muted mt-2">
            {caseStudies.length} case {caseStudies.length === 1 ? "study" : "studies"}
          </p>
        </header>

        {/* Case Studies */}
        {caseStudies.length > 0 ? (
          <div className="grid gap-4 mb-section">
            {caseStudies.map((study) => (
              <CaseStudyCard key={study.id} caseStudy={study} showCategory={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted mb-section">
            <p>No case studies in this category yet.</p>
          </div>
        )}

        {/* Other Categories */}
        <aside className="border-t border-border pt-8">
          <h2 className="text-sm font-medium text-muted uppercase tracking-wide mb-4">
            Other Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {allCategories
              .filter((c) => c.slug !== category.slug)
              .map((c) => (
                <CategoryPill key={c.slug} category={c} />
              ))}
          </div>
        </aside>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${category.name} Case Studies`,
            description: category.description,
            url: `https://productcasestudies.com/categories/${category.slug}`,
            isPartOf: {
              "@type": "WebSite",
              name: "Product Case Studies",
              url: "https://productcasestudies.com",
            },
            numberOfItems: caseStudies.length,
          }),
        }}
      />

      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://productcasestudies.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Categories",
                item: "https://productcasestudies.com/categories",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: category.name,
                item: `https://productcasestudies.com/categories/${category.slug}`,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
