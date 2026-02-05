"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, useCallback } from "react";
import { CaseStudy, CATEGORIES, FORMATS } from "@/lib/types";
import { searchAndFilter } from "@/lib/search";
import { CaseStudyCard } from "./CaseStudyCard";
import { SearchBar } from "./SearchBar";

interface CaseStudyListProps {
  caseStudies: CaseStudy[];
}

export function CaseStudyList({ caseStudies }: CaseStudyListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";
  const formatFilter = searchParams.get("format") || "";

  const [showFilters, setShowFilters] = useState(
    Boolean(categoryFilter || formatFilter)
  );

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/case-studies?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/case-studies");
  }, [router]);

  const filteredStudies = useMemo(() => {
    return searchAndFilter(caseStudies, query, {
      category: categoryFilter,
      format: formatFilter,
    });
  }, [caseStudies, query, categoryFilter, formatFilter]);

  const hasActiveFilters = Boolean(query || categoryFilter || formatFilter);

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <SearchBar defaultValue={query} />

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-muted hover:text-ink transition-colors flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            {showFilters ? "Hide filters" : "Show filters"}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-accent hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs text-muted mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => updateFilter("category", e.target.value)}
                className="input text-sm"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs text-muted mb-1">Format</label>
              <select
                value={formatFilter}
                onChange={(e) => updateFilter("format", e.target.value)}
                className="input text-sm"
              >
                <option value="">All formats</option>
                {FORMATS.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-muted">
        {filteredStudies.length} case {filteredStudies.length === 1 ? "study" : "studies"}
        {query && ` for "${query}"`}
      </div>

      {/* Results Grid */}
      {filteredStudies.length > 0 ? (
        <div className="grid gap-4">
          {filteredStudies.map((study) => (
            <CaseStudyCard key={study.id} caseStudy={study} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted">
          <p className="mb-2">No case studies found</p>
          <p className="text-sm">
            Try adjusting your search or{" "}
            <button onClick={clearFilters} className="text-accent hover:underline">
              clearing filters
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
