import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllCaseStudies,
  getCaseStudyBySlug,
  getRelatedCaseStudies,
} from "@/lib/data";
import { CATEGORIES, FORMATS } from "@/lib/types";
import { CaseStudyCardCompact } from "@/components/CaseStudyCard";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const caseStudies = getAllCaseStudies();
  return caseStudies.map((study) => ({
    slug: study.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const caseStudy = getCaseStudyBySlug(params.slug);

  if (!caseStudy) {
    return {
      title: "Case Study Not Found",
    };
  }

  return {
    title: caseStudy.title,
    description: caseStudy.description,
    openGraph: {
      title: `${caseStudy.title} | Product Case Studies`,
      description: caseStudy.description,
      type: "article",
      publishedTime: caseStudy.datePublished,
    },
    twitter: {
      card: "summary_large_image",
      title: caseStudy.title,
      description: caseStudy.description,
    },
  };
}

export default function CaseStudyPage({ params }: PageProps) {
  const caseStudy = getCaseStudyBySlug(params.slug);

  if (!caseStudy) {
    notFound();
  }

  const category = CATEGORIES.find((c) => c.slug === caseStudy.category);
  const formatLabel = FORMATS.find((f) => f.value === caseStudy.format)?.label || caseStudy.format;
  const relatedStudies = getRelatedCaseStudies(caseStudy, 3);

  const formattedDate = caseStudy.datePublished !== "Unknown"
    ? new Date(caseStudy.datePublished).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  return (
    <article className="py-section">
      <div className="container-content">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted">
          <a href="/case-studies" className="hover:text-ink transition-colors">
            Case Studies
          </a>
          <span className="mx-2">/</span>
          {category && (
            <>
              <a
                href={`/categories/${category.slug}`}
                className="hover:text-ink transition-colors"
              >
                {category.name}
              </a>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-ink">{caseStudy.company}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted mb-3">
            <span className="font-medium text-ink">{caseStudy.company}</span>
            <span>·</span>
            <span>{formatLabel}</span>
            <span>·</span>
            <span>{formattedDate}</span>
          </div>

          <h1 className="text-2xl font-semibold mb-4 leading-tight">
            {caseStudy.title}
          </h1>

          <p className="text-muted text-lg">{caseStudy.description}</p>
        </header>

        {/* Meta Info */}
        <div className="border border-border p-4 mb-8">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-muted mb-1">Source</dt>
              <dd>{caseStudy.source}</dd>
            </div>
            <div>
              <dt className="text-muted mb-1">Category</dt>
              <dd>
                <a
                  href={`/categories/${caseStudy.category}`}
                  className="text-accent hover:underline"
                >
                  {category?.name || caseStudy.category}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted mb-1">Format</dt>
              <dd>{formatLabel}</dd>
            </div>
            <div>
              <dt className="text-muted mb-1">Published</dt>
              <dd>{formattedDate}</dd>
            </div>
          </dl>
        </div>

        {/* Tags */}
        {caseStudy.tags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm text-muted mb-2">Topics</h2>
            <div className="flex flex-wrap gap-2">
              {caseStudy.tags.map((tag) => (
                <span key={tag} className="pill">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="border-t border-border pt-8 mb-section">
          <a
            href={caseStudy.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            Read the full case study
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>

        {/* Related Case Studies */}
        {relatedStudies.length > 0 && (
          <aside className="border-t border-border pt-8">
            <h2 className="text-sm font-medium text-muted uppercase tracking-wide mb-4">
              Related Case Studies
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedStudies.map((study) => (
                <CaseStudyCardCompact key={study.id} caseStudy={study} />
              ))}
            </div>
          </aside>
        )}
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: caseStudy.title,
            description: caseStudy.description,
            datePublished: caseStudy.datePublished !== "Unknown" ? caseStudy.datePublished : undefined,
            author: {
              "@type": "Organization",
              name: caseStudy.source,
            },
            publisher: {
              "@type": "Organization",
              name: "Product Case Studies",
              url: "https://productcasestudies.com",
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://productcasestudies.com/case-studies/${caseStudy.slug}`,
            },
            about: {
              "@type": "Organization",
              name: caseStudy.company,
            },
            keywords: caseStudy.tags.join(", "),
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
                name: "Case Studies",
                item: "https://productcasestudies.com/case-studies",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: category?.name || caseStudy.category,
                item: `https://productcasestudies.com/categories/${caseStudy.category}`,
              },
              {
                "@type": "ListItem",
                position: 4,
                name: caseStudy.title,
                item: `https://productcasestudies.com/case-studies/${caseStudy.slug}`,
              },
            ],
          }),
        }}
      />
    </article>
  );
}
