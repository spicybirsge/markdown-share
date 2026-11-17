import type { ApiResponse, ShareListItem } from "@/types/share";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import TimeAgo from "@/components/TimeAgo";
import SourceBadge from "@/components/SourceBadge";
import variables from "@/variables/variables";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Public shares",
  description:
    "Browse markdown documents people have published with Markdown Share - notes, guides, runbooks and everything in between.",
  openGraph: {
    title: "Public shares",
    description:
      "Browse markdown documents people have published with Markdown Share - notes, guides, runbooks and everything in between.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Public shares",
    description:
      "Browse markdown documents people have published with Markdown Share - notes, guides, runbooks and everything in between.",
    images: ["/og.png"],
  },
};

async function getShares(): Promise<{ shares: ShareListItem[]; error: boolean }> {
  try {
    const request = await fetch(
      variables.BACKEND_URL + "/api/v1/read/latest-shares?limit=27",
      { next: { revalidate: 60 } }
    );
    const response: ApiResponse<ShareListItem[]> | null = await request.json();

    if (!request.ok || !response?.success) {
      return { shares: [], error: true };
    }

    return {
      shares: Array.isArray(response.data) ? response.data : [],
      error: false,
    };
  } catch {
    return { shares: [], error: true };
  }
}

function ShareCard({ share }: { share: ShareListItem }) {
  return (
    <Link
      href={`/share/${share._id}`}
      className="group flex h-full min-h-64 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-[border-color,box-shadow] duration-200 hover:border-foreground/25 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-7"
    >
      <div className="flex items-center justify-between gap-4">
        <SourceBadge source={share.source} />
        <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>

      <h2
        className="mt-5 line-clamp-2 break-words text-lg font-medium leading-7 tracking-[-0.02em]"
        title={share.title || "Untitled share"}
      >
        {share.title || "Untitled share"}
      </h2>

      {(share.description || share.excerpt) && (
        <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-muted-foreground">
          {share.description || share.excerpt}
        </p>
      )}

      <div className="mt-auto flex items-center gap-2.5 pt-6 text-[11px] text-muted-foreground">
        <TimeAgo date={Number(share.createdAt)} />
        <span className="size-0.5 rounded-full bg-muted-foreground/60" />
        <span>
          {share.views} {share.views === 1 ? "view" : "views"}
        </span>
      </div>
    </Link>
  );
}

export default async function ListPage() {
  const { shares, error } = await getShares();

  return (
    <>
      <NavBar />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl px-5 pb-24 pt-14 sm:px-6 sm:pt-20">
        <header className="mb-10 sm:mb-12">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Public shares
          </h1>
        </header>

        {error ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-24 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-muted">
              <FileText className="size-5 text-muted-foreground" />
            </span>
            <h2 className="mt-5 text-lg font-medium">
              Public shares are unavailable right now
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              The list could not be loaded. Try again in a moment, or open a
              share directly if you have the link.
            </p>
            <a
              href="/list"
              className="mt-6 text-sm font-medium underline underline-offset-4 hover:text-muted-foreground"
            >
              Try again
            </a>
          </div>
        ) : shares.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-24 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-muted">
              <FileText className="size-5 text-muted-foreground" />
            </span>
            <h2 className="mt-5 text-lg font-medium">No public shares yet</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Be the first. Write something in markdown and publish it for
              anyone to read.
            </p>
            <Link
              href="/new"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background"
            >
              Create a share
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shares.map((share) => (
              <ShareCard key={share._id} share={share} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
