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
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Markdown Share",
    statusBarStyle: "default",
  },
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
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Markdown Share — The agentic markdown sharing platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown Share — The agentic markdown sharing platform",
    description,
    images: ["/og.png"],
  },
};

export const viewport = {
  themeColor: "#faf9f7",
  colorScheme: "light",
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
