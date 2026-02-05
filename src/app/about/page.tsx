import { Metadata } from "next";
import { getTotalCount, getCategoriesWithCounts, getUniqueCompanies } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description:
    "Product Case Studies is an open-source database of product management case studies, designed to help PMs learn from real-world examples.",
  openGraph: {
    title: "About | Product Case Studies",
    description:
      "Product Case Studies is an open-source database of product management case studies, designed to help PMs learn from real-world examples.",
  },
};

export default function AboutPage() {
  const totalCount = getTotalCount();
  const categories = getCategoriesWithCounts();
  const companies = getUniqueCompanies();

  return (
    <div className="py-section">
      <div className="container-content">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">About</h1>
        </header>

        <div className="prose prose-sm max-w-none space-y-6">
          <p className="text-muted">
            Product Case Studies is an open-source database designed to help product
            managers learn from real-world examples. We aggregate and categorize case
            studies from across the web - blog posts, conference talks, videos, and
            more - so you can quickly find relevant examples to inform your decisions.
          </p>

          <div className="grid grid-cols-3 gap-4 py-6 border-y border-border">
            <div className="text-center">
              <div className="text-2xl font-semibold">{totalCount}+</div>
              <div className="text-sm text-muted">Case Studies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold">{categories.length}</div>
              <div className="text-sm text-muted">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold">{companies.length}+</div>
              <div className="text-sm text-muted">Companies</div>
            </div>
          </div>

          <section>
            <h2 className="text-lg font-semibold mb-3">Why We Built This</h2>
            <p className="text-muted">
              Product managers constantly need to test, benchmark, and ground decisions
              in evidence. Case studies are a quick and useful reference - but the best
              ones are scattered across the web. We&apos;re bringing them together in one
              searchable, categorized place.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">How to Contribute</h2>
            <p className="text-muted mb-3">
              We welcome contributions! To add a case study:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted">
              <li>Fork the repository on GitHub</li>
              <li>Add your case study to the data file</li>
              <li>Submit a pull request with a brief description</li>
            </ol>
            <p className="text-muted mt-4">
              <a
                href="https://github.com/aaronbatchelder/product-management-case-studies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                View the repository on GitHub &rarr;
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">AI Integration</h2>
            <p className="text-muted">
              Product Case Studies supports the Model Context Protocol (MCP), allowing
              you to query case studies directly from Claude, Cursor, and other
              AI-powered tools. We also provide an{" "}
              <a href="/llms.txt" className="text-accent hover:underline">
                llms.txt
              </a>{" "}
              file for AI discoverability.
            </p>
            <p className="text-muted mt-2">
              <a href="/mcp" className="text-accent hover:underline">
                Learn about MCP integration &rarr;
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Contact</h2>
            <p className="text-muted">
              Questions, suggestions, or just want to say hi? Reach out on{" "}
              <a
                href="https://twitter.com/aaronbatcheldr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Twitter @aaronbatcheldr
              </a>{" "}
              or email{" "}
              <a href="mailto:aaronmb7@gmail.com" className="text-accent hover:underline">
                aaronmb7@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
