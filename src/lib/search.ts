import Fuse, { IFuseOptions } from "fuse.js";
import { CaseStudy } from "./types";

const fuseOptions: IFuseOptions<CaseStudy> = {
  keys: [
    { name: "title", weight: 0.4 },
    { name: "description", weight: 0.25 },
    { name: "company", weight: 0.2 },
    { name: "tags", weight: 0.15 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true,
};

export function searchCaseStudies(
  caseStudies: CaseStudy[],
  query: string
): CaseStudy[] {
  if (!query.trim()) {
    return caseStudies;
  }

  const fuse = new Fuse(caseStudies, fuseOptions);
  const results = fuse.search(query);
  return results.map((result) => result.item);
}

export function filterCaseStudies(
  caseStudies: CaseStudy[],
  filters: {
    category?: string;
    format?: string;
    company?: string;
    access?: string;
  }
): CaseStudy[] {
  let filtered = caseStudies;

  if (filters.category) {
    filtered = filtered.filter((study) => study.category === filters.category);
  }

  if (filters.format) {
    filtered = filtered.filter((study) => study.format === filters.format);
  }

  if (filters.company) {
    filtered = filtered.filter(
      (study) => study.company.toLowerCase() === filters.company?.toLowerCase()
    );
  }

  if (filters.access) {
    filtered = filtered.filter((study) => study.access === filters.access);
  }

  return filtered;
}

export function searchAndFilter(
  caseStudies: CaseStudy[],
  query: string,
  filters: {
    category?: string;
    format?: string;
    company?: string;
    access?: string;
  }
): CaseStudy[] {
  // First filter, then search
  const filtered = filterCaseStudies(caseStudies, filters);
  return searchCaseStudies(filtered, query);
}
