# Product Case Studies MCP Server

An MCP (Model Context Protocol) server that provides access to product management case studies. Use it with Claude Desktop, Cursor, or other MCP-compatible AI tools.

## Quick Start

```bash
npx productcasestudies-mcp
```

## Installation

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "productcasestudies": {
      "command": "npx",
      "args": ["productcasestudies-mcp"]
    }
  }
}
```

### Cursor

Add to your Cursor MCP settings (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "productcasestudies": {
      "command": "npx",
      "args": ["productcasestudies-mcp"]
    }
  }
}
```

## Available Tools

### search_case_studies

Search case studies by keyword with optional filters.

```typescript
{
  query?: string,      // Search term
  category?: string,   // Category slug
  format?: string,     // "article" | "video" | "pdf" | "podcast" | "slides"
  limit?: number       // Max results (default: 10)
}
```

### get_case_study

Get a specific case study by slug.

```typescript
{
  slug: string  // Case study slug or ID
}
```

### list_categories

List all categories with case study counts.

### get_random_case_studies

Get random case studies for inspiration.

```typescript
{
  count?: number,     // Number of results (default: 3)
  category?: string   // Optional category filter
}
```

## Available Resources

- `casestudies://all` - Complete database of all case studies
- `casestudies://categories` - List of all categories

## Categories

- `growth-acquisition` - User growth, viral loops, marketing
- `product-launch` - Go-to-market, launch strategies
- `pricing-monetization` - Pricing models, revenue strategy
- `platform-strategy` - Marketplaces, ecosystems, APIs
- `user-research` - Discovery, validation, insights
- `pivots` - Strategic changes, repositioning
- `design-ux` - User experience, design thinking
- `engineering-culture` - Team structure, processes
- `post-mortems` - Failure analysis, lessons learned
- `scaling` - Growing teams, infrastructure, operations

## Example Prompts

- "Find case studies about freemium pricing strategies"
- "Show me examples of successful product pivots"
- "What can I learn from Airbnb's early growth strategy?"
- "Give me 3 random case studies about product launches"

## License

MIT
