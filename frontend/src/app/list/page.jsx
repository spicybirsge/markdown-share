import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import TimeAgo from "@/components/TimeAgo";
import variables from "@/variables/variables";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Public shares",
  description:
    "Browse markdown documents people have published with Markdown Share — notes, guides, runbooks and everything in between.",
};

async function getShares() {
  try {
    const request = await fetch(
      variables.BACKEND_URL + "/api/v1/read/latest-shares?limit=27",
      { cache: "no-store" }
    );
    const response = await request.json();

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

function ShareCard({ share }) {
  return (
    <Link
      href={`/share/${share._id}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/25 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {share.source === "mcp" ? "Agent share" : "Public share"}
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>

      <h2 className="mt-4 line-clamp-2 break-words text-[17px] font-medium leading-6 tracking-[-0.015em]">
        {share.title || "Untitled share"}
      </h2>

      <p className="mt-2 line-clamp-3 break-words text-[13.5px] leading-6 text-muted-foreground">
        {share.description || share.excerpt || "No description."}
      </p>

      <div className="mt-auto flex items-center gap-2.5 pt-6 text-[11px] text-muted-foreground">
        <TimeAgo date={share.createdAt * 1} />
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
      <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-14 sm:px-6 sm:pt-20">
        <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Public library
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Public shares
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted-foreground">
              Markdown documents published by people and agents which are not
              unlisted.
            </p>
          </div>
          <Link
            href="/new"
            className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:self-auto"
          >
            Create a share
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

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
          <>
            <p className="py-5 text-[13px] text-muted-foreground">
              Showing top 27 most recent posts sorted by newest first.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shares.map((share) => (
                <ShareCard key={share._id} share={share} />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
