import { Category } from "@/lib/types";

interface CategoryPillProps {
  category: Category;
  isActive?: boolean;
  showCount?: boolean;
}

export function CategoryPill({ category, isActive = false, showCount = true }: CategoryPillProps) {
  return (
    <a
      href={`/categories/${category.slug}`}
      className={`pill ${isActive ? "border-ink bg-ink text-cream" : ""}`}
    >
      {category.name}
      {showCount && category.count !== undefined && (
        <span className="ml-1 opacity-60">({category.count})</span>
      )}
    </a>
  );
}

interface CategoryGridProps {
  categories: Category[];
  activeSlug?: string;
}

export function CategoryGrid({ categories, activeSlug }: CategoryGridProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <CategoryPill
          key={category.slug}
          category={category}
          isActive={activeSlug === category.slug}
        />
      ))}
    </div>
  );
}
