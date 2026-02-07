import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP Integration",
  description:
    "Connect Product Case Studies to Claude, Cursor, or other AI tools via Model Context Protocol (MCP) for instant access to case study insights.",
  openGraph: {
    title: "MCP Integration | Product Case Studies",
    description:
      "Connect Product Case Studies to Claude, Cursor, or other AI tools via Model Context Protocol (MCP) for instant access to case study insights.",
  },
};

export default function MCPPage() {
  return (
    <div className="py-section">
      <div className="container-content">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">MCP Integration</h1>
          <p className="text-muted">
            Connect Product Case Studies to your AI assistant for instant access to
            case study insights while you work.
          </p>
        </header>

        {/* Claude Desktop */}
        <section className="mb-section">
          <h2 className="text-lg font-semibold mb-4">Claude Desktop</h2>

          <div className="space-y-6">
            {/* Option 1: UI (Pro/Max/Team) */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-sm">Option 1: Via Settings</h3>
                <span className="text-xs bg-border px-2 py-0.5">Pro/Max/Team</span>
              </div>
              <ol className="text-sm text-muted space-y-1 list-decimal list-inside mb-2">
                <li>Open Claude Desktop → Settings → Connectors</li>
                <li>Click &ldquo;Add custom connector&rdquo;</li>
                <li>Paste the URL: <code className="bg-border px-1">https://productcasestudies.com/api/mcp</code></li>
                <li>Click &ldquo;Add&rdquo;</li>
              </ol>
            </div>

            {/* Option 2: Config file */}
            <div>
              <h3 className="font-medium text-sm mb-2">Option 2: Config File (All Plans)</h3>
              <p className="text-xs text-muted mb-2">
                Edit <code className="bg-border px-1">~/Library/Application Support/Claude/claude_desktop_config.json</code> (macOS) or <code className="bg-border px-1">%APPDATA%\Claude\claude_desktop_config.json</code> (Windows):
              </p>
              <div className="bg-ink text-cream p-4 overflow-x-auto">
                <pre className="text-sm">{`{
  "mcpServers": {
    "productcasestudies": {
      "command": "npx",
      "args": ["productcasestudies-mcp"]
    }
  }
}`}</pre>
              </div>
              <p className="text-xs text-muted mt-2">
                Restart Claude Desktop after saving.
              </p>
            </div>
          </div>
        </section>

        {/* Cursor */}
        <section className="mb-section border-t border-border pt-8">
          <h2 className="text-lg font-semibold mb-4">Cursor</h2>
          <p className="text-xs text-muted mb-2">
            Add to <code className="bg-border px-1">.cursor/mcp.json</code> in your project:
          </p>
          <div className="bg-ink text-cream p-4 overflow-x-auto">
            <pre className="text-sm">{`{
  "mcpServers": {
    "productcasestudies": {
      "command": "npx",
      "args": ["productcasestudies-mcp"]
    }
  }
}`}</pre>
          </div>
        </section>

        {/* Other MCP Clients */}
        <section className="mb-section border-t border-border pt-8">
          <h2 className="text-lg font-semibold mb-4">Other MCP Clients</h2>
          <p className="text-muted mb-4 text-sm">
            For clients that support remote HTTP servers, use:
          </p>
          <div className="bg-ink text-cream p-4 overflow-x-auto mb-4">
            <code className="text-sm">https://productcasestudies.com/api/mcp</code>
          </div>
          <p className="text-muted text-sm">
            Or run locally with: <code className="bg-border px-1">npx productcasestudies-mcp</code>
          </p>
        </section>

        {/* Available Tools */}
        <section className="mb-section border-t border-border pt-8">
          <h2 className="text-lg font-semibold mb-4">Available Tools</h2>
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-medium mb-1">search_case_studies</h3>
              <p className="text-sm text-muted">
                Search case studies by keyword, with optional category and format filters.
              </p>
              <div className="mt-2 text-xs text-muted">
                <code>{"{ query: string, category?: string, format?: string, limit?: number }"}</code>
              </div>
            </div>

            <div className="card">
              <h3 className="font-medium mb-1">get_case_study</h3>
              <p className="text-sm text-muted">
                Get a specific case study by its slug or ID, including full details.
              </p>
              <div className="mt-2 text-xs text-muted">
                <code>{"{ slug: string }"}</code>
              </div>
            </div>

            <div className="card">
              <h3 className="font-medium mb-1">get_case_study_summary</h3>
              <p className="text-sm text-muted">
                Get the AI-generated summary and key insights from a case study.
              </p>
              <div className="mt-2 text-xs text-muted">
                <code>{"{ slug: string }"}</code>
              </div>
            </div>

            <div className="card">
              <h3 className="font-medium mb-1">list_categories</h3>
              <p className="text-sm text-muted">
                List all categories with their case study counts.
              </p>
              <div className="mt-2 text-xs text-muted">
                <code>{"{ }"}</code>
              </div>
            </div>

            <div className="card">
              <h3 className="font-medium mb-1">get_random_case_studies</h3>
              <p className="text-sm text-muted">
                Get random case studies for inspiration, optionally filtered by category.
              </p>
              <div className="mt-2 text-xs text-muted">
                <code>{"{ count?: number, category?: string }"}</code>
              </div>
            </div>
          </div>
        </section>

        {/* Example Prompts */}
        <section className="mb-section border-t border-border pt-8">
          <h2 className="text-lg font-semibold mb-4">Example Prompts</h2>
          <div className="space-y-3 text-sm">
            <div className="card">
              <p className="italic text-muted">
                &ldquo;Find case studies about freemium pricing strategies&rdquo;
              </p>
            </div>
            <div className="card">
              <p className="italic text-muted">
                &ldquo;Show me examples of successful product pivots&rdquo;
              </p>
            </div>
            <div className="card">
              <p className="italic text-muted">
                &ldquo;What can I learn from Airbnb&apos;s early growth strategy?&rdquo;
              </p>
            </div>
            <div className="card">
              <p className="italic text-muted">
                &ldquo;Summarize the Superhuman product-market fit case study&rdquo;
              </p>
            </div>
            <div className="card">
              <p className="italic text-muted">
                &ldquo;Give me 3 random case studies about product launches for inspiration&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="border-t border-border pt-8">
          <h2 className="text-lg font-semibold mb-4">Resources</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://modelcontextprotocol.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Model Context Protocol Documentation
              </a>
            </li>
            <li>
              <a
                href="https://github.com/aaronbatchelder/product-management-case-studies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                GitHub Repository
              </a>
            </li>
            <li>
              <a
                href="https://www.npmjs.com/package/productcasestudies-mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                NPM Package
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
