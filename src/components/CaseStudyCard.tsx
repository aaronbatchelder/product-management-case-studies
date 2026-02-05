import { CaseStudy } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  showCategory?: boolean;
}

export function CaseStudyCard({ caseStudy, showCategory = true }: CaseStudyCardProps) {
  const category = CATEGORIES.find((c) => c.slug === caseStudy.category);
  const formatLabel = caseStudy.format.charAt(0).toUpperCase() + caseStudy.format.slice(1);

  return (
    <article className="card group">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="font-medium">{caseStudy.company}</span>
          <span>·</span>
          <span>{formatLabel}</span>
          {showCategory && category && (
            <>
              <span>·</span>
              <a
                href={`/categories/${caseStudy.category}`}
                className="hover:text-ink transition-colors"
              >
                {category.name}
              </a>
            </>
          )}
        </div>

        <h3 className="font-medium leading-snug">
          <a
            href={`/case-studies/${caseStudy.slug}`}
            className="hover:text-accent transition-colors"
          >
            {caseStudy.title}
          </a>
        </h3>

        <p className="text-sm text-muted line-clamp-2">{caseStudy.description}</p>

        <div className="flex items-center gap-2 mt-1">
          <a
            href={caseStudy.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline underline-offset-2"
          >
            Read original &rarr;
          </a>
        </div>
      </div>
    </article>
  );
}

export function CaseStudyCardCompact({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <a
      href={`/case-studies/${caseStudy.slug}`}
      className="block card group"
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted">{caseStudy.company}</span>
        <h4 className="text-sm font-medium group-hover:text-accent transition-colors line-clamp-2">
          {caseStudy.title}
        </h4>
      </div>
    </a>
  );
}
