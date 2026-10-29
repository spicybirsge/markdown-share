import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://markdownshare.shaheerahamed.com";
const description =
  "The agentic markdown sharing platform. Share content directly with the markdown share MCP or paste your content via our UI!";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Markdown Share - The agentic markdown sharing platform",
    template: "%s · Markdown Share",
  },
  description,
  applicationName: "Markdown Share",
  keywords: [
    "markdown share",
    "markdown",
    "share",
    "codebin",
    "pastebin",
    "mcp",
    "model context protocol",
    "ai agents",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Markdown Share — The agentic markdown sharing platform",
    description,
    siteName: "Markdown Share",
    images: [{ url: "/assets/media/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown Share — The agentic markdown sharing platform",
    description,
    images: ["/assets/media/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
        <Toaster
          position="bottom-right"
          theme="light"
          toastOptions={{
            style: {
              borderRadius: "0.75rem",
              border: "1px solid var(--border)",
              background: "var(--popover)",
              color: "var(--popover-foreground)",
            },
          }}
        />
      </body>
    </html>
  );
}
