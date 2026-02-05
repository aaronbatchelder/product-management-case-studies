# Product Case Studies

A searchable database of product management case studies covering growth, launches, pricing, pivots, and more.

**Live site**: [productcasestudies.com](https://productcasestudies.com)

## Features

- **Searchable database** - Full-text search with Fuse.js
- **Category filtering** - Browse by topic (Growth, Pricing, Pivots, etc.)
- **Format filtering** - Filter by article, video, PDF, podcast, or slides
- **SEO optimized** - Structured data, sitemap, Open Graph tags
- **AI-friendly** - llms.txt, JSON API, MCP server integration
- **Fast** - Static site generation with Next.js

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Fuse.js (search)
- Vercel Analytics
- Model Context Protocol (MCP)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Import case studies from CSV
npm run import-csv -- path/to/data.csv
```

## Data Schema

Case studies are stored in `src/data/case-studies.json`:

```typescript
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
  format: "article" | "video" | "pdf" | "podcast" | "slides";
  company: string;
  createdAt: string;
}
```

## Categories

- Growth & Acquisition
- Product Launch
- Pricing & Monetization
- Platform Strategy
- User Research
- Pivots
- Design & UX
- Engineering Culture
- Startup Post-Mortems
- Scaling

## MCP Integration

Connect to Claude, Cursor, or other AI tools via Model Context Protocol:

```bash
npx productcasestudies-mcp
```

See [/mcp](https://productcasestudies.com/mcp) for setup instructions.

## Contributing

1. Fork the repository
2. Add case studies to `src/data/case-studies.json` (or use the CSV import script)
3. Submit a pull request

**CSV format:**
```
title,url,category,description,datePublished,source,format,company,tags
```

## API

- `/api/case-studies.json` - All case studies
- `/api/categories.json` - Categories with counts
- `/llms.txt` - AI-friendly site summary

## License

MIT

## Contact

- Twitter: [@aaronbatcheldr](https://twitter.com/aaronbatcheldr)
- Email: aaronmb7@gmail.com
