"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Check,
  Clock,
  Copy,
  Eye,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ShareContent from "@/components/ShareContent";
import TimeAgo from "@/components/TimeAgo";
import { Skeleton } from "@/components/ui/skeleton";
import variables from "@/variables/variables";
import timeStampToDate from "@/functions/timeStampToDate";
import replaceWithProxy from "@/functions/replaceWithProxy";

function LoadingState() {
  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-10 h-11 w-4/5" />
        <Skeleton className="mt-3 h-11 w-3/5" />
        <Skeleton className="mt-6 h-5 w-2/3" />
        <Skeleton className="mt-8 h-10 w-full" />
        <div className="mt-10 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </main>
      <Footer />
    </>
  );
}

function NotFoundState() {
  return (
    <>
      <NavBar />
      <main className="mx-auto flex min-h-[68vh] w-full max-w-xl flex-col items-center justify-center px-5 py-20 text-center sm:px-6">
        <span className="grid size-12 place-items-center rounded-full border border-border bg-card">
          <FileText className="size-5 text-muted-foreground" />
        </span>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          This share doesn’t exist.
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          The link may be wrong, or the share was never published. Check the
          URL and try again.
        </p>
        <Link
          href="/list"
          className="mt-7 inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background"
        >
          Browse public shares
          <ArrowUpRight className="size-4" />
        </Link>
      </main>
      <Footer />
    </>
  );
}

function ErrorState({ onRetry }) {
  return (
    <>
      <NavBar />
      <main className="mx-auto flex min-h-[68vh] w-full max-w-xl flex-col items-center justify-center px-5 py-20 text-center sm:px-6">
        <span className="grid size-12 place-items-center rounded-full border border-border bg-card">
          <FileText className="size-5 text-muted-foreground" />
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          We couldn’t load this share.
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          The document didn’t arrive. The link is probably fine — try again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-7 inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background"
        >
          Try again
        </button>
      </main>
      <Footer />
    </>
  );
}

export default function Share({ id }) {
  const [share, setShare] = useState(null);
  // One explicit status instead of separate `loading` / `notFound` flags: a
  // stale or aborted request can no longer leave the reader "loaded but empty",
  // which is what briefly flashed the 404 screen between the skeleton and the
  // document.
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setShare(null);
    setStatus("loading");

    async function load(remainingRetries) {
      try {
        const request = await fetch(
          variables.BACKEND_URL +
            "/api/v1/read/share?id=" +
            encodeURIComponent(id),
          { signal: controller.signal, cache: "no-store" }
        );
        const response = await request.json().catch(() => null);

        if (!active) return;

        if (request.ok && response?.success) {
          setShare(response.data);
          setStatus("ready");
          return;
        }

        // Only a real 404 means the share is gone. Everything else is treated
        // as a transient failure further down.
        if (request.status === 404 || response?.code === 404) {
          setStatus("missing");
          return;
        }

        throw new Error("Could not load this share.");
      } catch (error) {
        if (!active || error?.name === "AbortError") return;

        if (remainingRetries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 350));
          if (!active) return;
          return load(remainingRetries - 1);
        }

        setStatus("error");
      }
    }

    load(2);
    return () => {
      active = false;
      controller.abort();
    };
  }, [id, attempt]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link");
    }
  }

  if (status === "loading") return <LoadingState />;
  if (status === "missing") return <NotFoundState />;
  if (status === "error" || !share) {
    return <ErrorState onRetry={() => setAttempt((value) => value + 1)} />;
  }

  const words = share.content?.trim()
    ? share.content.trim().split(/\s+/).length
    : 0;
  const readingTime = Math.max(1, Math.round(words / 220));

  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-8 sm:px-6 sm:pt-12">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/list"
            className="inline-flex items-center gap-1.5 rounded-full py-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Public shares
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
            >
              {copied ? (
                <>
                  <Check className="size-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy link
                </>
              )}
            </button>
            <Link
              href="/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-3.5 text-xs font-medium text-background transition-colors hover:bg-foreground/85"
            >
              New share
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>

        <article className="mt-10">
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            <span className="rounded-full border border-border bg-card px-2.5 py-1">
              {share.unlisted ? "Unlisted" : "Public"}
            </span>
            <span className="size-0.5 rounded-full bg-muted-foreground/60" />
            <span className="normal-case tracking-normal">
              <TimeAgo date={share.createdAt * 1} />
            </span>
          </div>

          <h1 className="mt-5 text-[clamp(2.1rem,5.5vw,3.35rem)] font-semibold leading-[1.06] tracking-[-0.04em]">
            {share.title || "Untitled share"}
          </h1>

          {share.description ? (
            <p className="mt-4 text-[17px] leading-8 text-muted-foreground">
              {share.description}
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3.5 text-[11.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {timeStampToDate(share.createdAt * 1)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-3.5" />
              {share.views} {share.views === 1 ? "view" : "views"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {readingTime} min read
            </span>
          </div>

          <div className="mt-10">
            <ShareContent content={replaceWithProxy(share.content || "")} />
          </div>
        </article>

        <div className="mt-16 flex flex-col gap-5 rounded-2xl border border-border bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              Markdown Share
            </p>
            <h2 className="mt-2 text-lg font-medium tracking-[-0.015em]">
              Have something to share?
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Turn your own markdown into a clean page in seconds.
            </p>
          </div>
          <Link
            href="/new"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background"
          >
            Create a share
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
