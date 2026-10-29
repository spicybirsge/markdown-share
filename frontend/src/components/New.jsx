import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ShareComposer from "@/components/ShareComposer";

export default function New() {
  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-4xl px-5 pb-24 pt-14 sm:px-6 sm:pt-20">
        <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Create
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              New share
            </h1>
            <p className="mt-3 max-w-lg text-[15px] leading-7 text-muted-foreground">
              Paste markdown, add a title, get a link. Code blocks, tables,
              images and checklists all work.
            </p>
          </div>
          <Link
            href="/list"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Public shares
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <ShareComposer />
      </main>
      <Footer />
    </>
  );
}
