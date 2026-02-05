import { CaseStudy, Category, CATEGORIES } from "./types";
import caseStudiesData from "@/data/case-studies.json";

export function getAllCaseStudies(): CaseStudy[] {
  return caseStudiesData as CaseStudy[];
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return getAllCaseStudies().find((study) => study.slug === slug);
}

export function getCaseStudiesByCategory(categorySlug: string): CaseStudy[] {
  return getAllCaseStudies().filter((study) => study.category === categorySlug);
}

export function getCategoriesWithCounts(): Category[] {
  const studies = getAllCaseStudies();
  return CATEGORIES.map((category) => ({
    ...category,
    count: studies.filter((study) => study.category === category.slug).length,
  }));
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function getRelatedCaseStudies(
  caseStudy: CaseStudy,
  limit: number = 3
): CaseStudy[] {
  const allStudies = getAllCaseStudies();

  // First, try to find studies in the same category
  const sameCategory = allStudies.filter(
    (study) => study.category === caseStudy.category && study.id !== caseStudy.id
  );

  // Then, find studies with overlapping tags
  const withSharedTags = allStudies
    .filter((study) => study.id !== caseStudy.id)
    .map((study) => ({
      study,
      sharedTags: study.tags.filter((tag) => caseStudy.tags.includes(tag)).length,
    }))
    .filter(({ sharedTags }) => sharedTags > 0)
    .sort((a, b) => b.sharedTags - a.sharedTags)
    .map(({ study }) => study);

  // Combine and dedupe, prioritizing same category
  const combined = [...sameCategory, ...withSharedTags];
  const seen = new Set<string>();
  const unique = combined.filter((study) => {
    if (seen.has(study.id)) return false;
    seen.add(study.id);
    return true;
  });

  return unique.slice(0, limit);
}

export function getUniqueCompanies(): string[] {
  const studies = getAllCaseStudies();
  const companies = new Set(studies.map((study) => study.company));
  return Array.from(companies).sort();
}

export function getTotalCount(): number {
  return getAllCaseStudies().length;
}
