#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Types
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
}

interface Category {
  slug: string;
  name: string;
  description: string;
}

// Data - fetched from the website
const DATA_URL = "https://productcasestudies.com/api/case-studies.json";
const CATEGORIES_URL = "https://productcasestudies.com/api/categories.json";

let caseStudiesCache: CaseStudy[] | null = null;
let categoriesCache: Category[] | null = null;

async function fetchCaseStudies(): Promise<CaseStudy[]> {
  if (caseStudiesCache) return caseStudiesCache;

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    caseStudiesCache = await response.json();
    return caseStudiesCache!;
  } catch {
    // Fallback to embedded sample data if fetch fails
    return getSampleData();
  }
}

async function fetchCategories(): Promise<Category[]> {
  if (categoriesCache) return categoriesCache;

  try {
    const response = await fetch(CATEGORIES_URL);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    categoriesCache = await response.json();
    return categoriesCache!;
  } catch {
    return getDefaultCategories();
  }
}

function getSampleData(): CaseStudy[] {
  return [
    {
      id: "1",
      slug: "how-airbnb-used-design-thinking",
      title: "How Design Thinking Transformed Airbnb from a Failing Startup to a Billion Dollar Business",
      url: "https://firstround.com/review/How-design-thinking-transformed-Airbnb-from-failing-startup-to-billion-dollar-business/",
      category: "design-ux",
      tags: ["design thinking", "startup", "pivot", "growth"],
      description: "The story of how Airbnb founders used design thinking methodology to transform their failing startup into a billion-dollar company.",
      datePublished: "2014-01-15",
      source: "First Round Review",
      format: "article",
      company: "Airbnb",
      createdAt: "2024-01-01"
    },
    {
      id: "2",
      slug: "slack-epic-launch-strategy",
      title: "From 0 to $1B - Slack's Founder Shares Their Epic Launch Strategy",
      url: "https://firstround.com/review/From-0-to-1B-Slacks-Founder-Shares-Their-Epic-Launch-Strategy/",
      category: "product-launch",
      tags: ["launch", "beta", "word of mouth", "B2B"],
      description: "Stewart Butterfield reveals how Slack went from internal tool to billion-dollar company through careful beta testing.",
      datePublished: "2015-02-10",
      source: "First Round Review",
      format: "article",
      company: "Slack",
      createdAt: "2024-01-01"
    }
  ];
}

function getDefaultCategories(): Category[] {
  return [
    { slug: "growth-acquisition", name: "Growth & Acquisition", description: "User growth, viral loops, marketing strategies" },
    { slug: "product-launch", name: "Product Launch", description: "Go-to-market strategies, launch playbooks" },
    { slug: "pricing-monetization", name: "Pricing & Monetization", description: "Pricing models, revenue optimization" },
    { slug: "platform-strategy", name: "Platform Strategy", description: "Marketplaces, ecosystems, API strategies" },
    { slug: "user-research", name: "User Research", description: "Discovery, validation, customer insights" },
    { slug: "pivots", name: "Pivots", description: "Strategic changes, repositioning" },
    { slug: "design-ux", name: "Design & UX", description: "User experience, design thinking" },
    { slug: "engineering-culture", name: "Engineering Culture", description: "Team structure, development processes" },
    { slug: "post-mortems", name: "Startup Post-Mortems", description: "Failure analysis, lessons learned" },
    { slug: "scaling", name: "Scaling", description: "Growing teams, infrastructure, operations" },
  ];
}

// Search function
function searchCaseStudies(
  caseStudies: CaseStudy[],
  query: string,
  category?: string,
  format?: string,
  limit: number = 10
): CaseStudy[] {
  let results = caseStudies;

  if (category) {
    results = results.filter(cs => cs.category === category);
  }

  if (format) {
    results = results.filter(cs => cs.format === format);
  }

  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(cs =>
      cs.title.toLowerCase().includes(lowerQuery) ||
      cs.description.toLowerCase().includes(lowerQuery) ||
      cs.company.toLowerCase().includes(lowerQuery) ||
      cs.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  return results.slice(0, limit);
}

// Create MCP server
const server = new Server(
  {
    name: "productcasestudies-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_case_studies",
        description: "Search product management case studies by keyword, with optional category and format filters",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (searches title, description, company, and tags)",
            },
            category: {
              type: "string",
              description: "Filter by category slug (e.g., 'growth-acquisition', 'product-launch', 'pricing-monetization')",
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
        description: "Get a specific case study by its slug",
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
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "search_case_studies": {
      const caseStudies = await fetchCaseStudies();
      const results = searchCaseStudies(
        caseStudies,
        (args?.query as string) || "",
        args?.category as string,
        args?.format as string,
        (args?.limit as number) || 10
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }

    case "get_case_study": {
      const caseStudies = await fetchCaseStudies();
      const slug = args?.slug as string;
      const caseStudy = caseStudies.find(cs => cs.slug === slug || cs.id === slug);

      if (!caseStudy) {
        return {
          content: [
            {
              type: "text",
              text: `Case study not found: ${slug}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(caseStudy, null, 2),
          },
        ],
      };
    }

    case "list_categories": {
      const caseStudies = await fetchCaseStudies();
      const categories = await fetchCategories();

      const categoriesWithCounts = categories.map(cat => ({
        ...cat,
        count: caseStudies.filter(cs => cs.category === cat.slug).length,
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(categoriesWithCounts, null, 2),
          },
        ],
      };
    }

    case "get_random_case_studies": {
      const caseStudies = await fetchCaseStudies();
      const count = (args?.count as number) || 3;
      const category = args?.category as string;

      let pool = category
        ? caseStudies.filter(cs => cs.category === category)
        : caseStudies;

      // Shuffle and take random samples
      const shuffled = pool.sort(() => Math.random() - 0.5);
      const results = shuffled.slice(0, count);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }

    default:
      return {
        content: [
          {
            type: "text",
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      };
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "casestudies://all",
        name: "All Case Studies",
        description: "Complete database of all case studies",
        mimeType: "application/json",
      },
      {
        uri: "casestudies://categories",
        name: "Categories",
        description: "List of all categories",
        mimeType: "application/json",
      },
    ],
  };
});

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "casestudies://all") {
    const caseStudies = await fetchCaseStudies();
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(caseStudies, null, 2),
        },
      ],
    };
  }

  if (uri === "casestudies://categories") {
    const categories = await fetchCategories();
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(categories, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Product Case Studies MCP server running on stdio");
}

main().catch(console.error);
