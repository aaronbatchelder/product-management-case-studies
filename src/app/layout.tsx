import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Product Case Studies | Learn from Real PM Examples",
    template: "%s | Product Case Studies",
  },
  description:
    "A searchable database of 1000+ product management case studies covering growth, launches, pricing, pivots, and more. Learn from Airbnb, Slack, Spotify, and other top companies.",
  keywords: [
    "product management",
    "case studies",
    "product strategy",
    "growth",
    "startup",
    "PM",
    "product launch",
    "pricing strategy",
  ],
  authors: [{ name: "Product Case Studies" }],
  creator: "Product Case Studies",
  metadataBase: new URL("https://productcasestudies.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://productcasestudies.com",
    siteName: "Product Case Studies",
    title: "Product Case Studies | Learn from Real PM Examples",
    description:
      "A searchable database of 1000+ product management case studies covering growth, launches, pricing, pivots, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Case Studies | Learn from Real PM Examples",
    description:
      "A searchable database of 1000+ product management case studies covering growth, launches, pricing, pivots, and more.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexMono.variable} font-mono bg-cream text-ink antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="border-b border-border">
      <div className="max-w-content mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <a href="/" className="text-lg font-semibold hover:text-accent transition-colors">
            Product Case Studies
          </a>
          <div className="flex items-center gap-6 text-sm">
            <a href="/case-studies" className="text-muted hover:text-ink transition-colors">
              Browse
            </a>
            <a href="/categories" className="text-muted hover:text-ink transition-colors">
              Categories
            </a>
            <a href="/submit" className="text-muted hover:text-ink transition-colors">
              Submit
            </a>
            <a href="/mcp" className="text-muted hover:text-ink transition-colors">
              MCP
            </a>
            <a href="/about" className="text-muted hover:text-ink transition-colors">
              About
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border mt-section">
      <div className="max-w-content mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>Product Case Studies - Learn from real PM examples</p>
          <div className="flex items-center gap-4">
            <a href="/llms.txt" className="hover:text-ink transition-colors">
              llms.txt
            </a>
            <a
              href="https://github.com/aaronbatchelder/product-management-case-studies"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
