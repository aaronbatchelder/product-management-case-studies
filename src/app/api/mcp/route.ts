import { NextRequest, NextResponse } from "next/server";
import caseStudiesData from "@/data/case-studies.json";
import { CATEGORIES } from "@/lib/types";

interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  url: string;
  category: string;
  tags: string[];
  description: string;
  datePublished: string;
  source: string;
  format: string;
  company: string;
  createdAt: string;
  access?: string;
  summary?: string;
}

const caseStudies = caseStudiesData as CaseStudy[];

// Search function
function searchCaseStudies(
  query: string,
  category?: string,
  format?: string,
  limit: number = 10
): CaseStudy[] {
  let results = caseStudies;

  if (category) {
    results = results.filter((cs) => cs.category === category);
  }

  if (format) {
    results = results.filter((cs) => cs.format === format);
  }

  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(
      (cs) =>
        cs.title.toLowerCase().includes(lowerQuery) ||
        cs.description.toLowerCase().includes(lowerQuery) ||
        cs.company.toLowerCase().includes(lowerQuery) ||
        cs.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  return results.slice(0, limit);
}

// Tool definitions
const TOOLS = [
  {
    name: "search_case_studies",
    description:
      "Search product management case studies by keyword, with optional category and format filters",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search query (searches title, description, company, and tags)",
        },
        category: {
          type: "string",
          description:
            "Filter by category slug (e.g., 'growth-acquisition', 'product-launch', 'pricing-monetization')",
        },
        format: {
          type: "string",
          enum: ["article", "video", "pdf", "podcast", "slides"],
          description: "Filter by content format",
        },
        limit: {
          type: "number",
          description: "Maximum number of results (default: 10)",
        },
      },
    },
  },
  {
    name: "get_case_study",
    description:
      "Get a specific case study by its slug, including full summary if available",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "The case study slug",
        },
      },
      required: ["slug"],
    },
  },
  {
    name: "get_case_study_summary",
    description:
      "Get just the summary and key insights from a case study (best for understanding content without visiting the URL)",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "The case study slug",
        },
      },
      required: ["slug"],
    },
  },
  {
    name: "list_categories",
    description: "List all available categories with their case study counts",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_random_case_studies",
    description: "Get random case studies for inspiration",
    inputSchema: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "Number of random case studies to return (default: 3)",
        },
        category: {
          type: "string",
          description: "Optionally filter by category",
        },
      },
    },
  },
];

// Handle tool calls
function handleToolCall(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "search_case_studies": {
      const results = searchCaseStudies(
        (args?.query as string) || "",
        args?.category as string,
        args?.format as string,
        (args?.limit as number) || 10
      );
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    }

    case "get_case_study": {
      const slug = args?.slug as string;
      const caseStudy = caseStudies.find(
        (cs) => cs.slug === slug || cs.id === slug
      );
      if (!caseStudy) {
        return {
          content: [{ type: "text", text: `Case study not found: ${slug}` }],
          isError: true,
        };
      }
      return { content: [{ type: "text", text: JSON.stringify(caseStudy, null, 2) }] };
    }

    case "get_case_study_summary": {
      const slug = args?.slug as string;
      const caseStudy = caseStudies.find(
        (cs) => cs.slug === slug || cs.id === slug
      );
      if (!caseStudy) {
        return {
          content: [{ type: "text", text: `Case study not found: ${slug}` }],
          isError: true,
        };
      }
      const summaryResponse = {
        title: caseStudy.title,
        company: caseStudy.company,
        category: caseStudy.category,
        url: caseStudy.url,
        description: caseStudy.description,
        summary:
          caseStudy.summary ||
          "No detailed summary available yet. Visit the URL for full content.",
        tags: caseStudy.tags,
        access: caseStudy.access || "free",
      };
      return { content: [{ type: "text", text: JSON.stringify(summaryResponse, null, 2) }] };
    }

    case "list_categories": {
      const categoriesWithCounts = CATEGORIES.map((cat) => ({
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        count: caseStudies.filter((cs) => cs.category === cat.slug).length,
      }));
      return { content: [{ type: "text", text: JSON.stringify(categoriesWithCounts, null, 2) }] };
    }

    case "get_random_case_studies": {
      const count = (args?.count as number) || 3;
      const category = args?.category as string;

      const pool = category
        ? caseStudies.filter((cs) => cs.category === category)
        : caseStudies;

      const shuffled = pool.sort(() => Math.random() - 0.5);
      const results = shuffled.slice(0, count);
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
}

// MCP JSON-RPC handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, params, id, jsonrpc } = body;

    if (jsonrpc !== "2.0") {
      return NextResponse.json(
        { jsonrpc: "2.0", error: { code: -32600, message: "Invalid Request" }, id },
        { status: 400 }
      );
    }

    let result;

    switch (method) {
      case "initialize":
        result = {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: "productcasestudies-mcp",
            version: "1.0.0",
          },
        };
        break;

      case "tools/list":
        result = { tools: TOOLS };
        break;

      case "tools/call":
        const { name, arguments: args } = params;
        result = handleToolCall(name, args || {});
        break;

      case "ping":
        result = {};
        break;

      default:
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            error: { code: -32601, message: `Method not found: ${method}` },
            id,
          },
          { status: 404 }
        );
    }

    return NextResponse.json({ jsonrpc: "2.0", result, id });
  } catch (error) {
    console.error("MCP error:", error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal error" },
        id: null,
      },
      { status: 500 }
    );
  }
}

// Handle GET for server info
export async function GET() {
  return NextResponse.json({
    name: "productcasestudies-mcp",
    version: "1.0.0",
    description: "Product Case Studies MCP Server - Search 250+ product management case studies",
    tools: TOOLS.map((t) => t.name),
    documentation: "https://productcasestudies.com/mcp",
  });
}
