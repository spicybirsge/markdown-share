import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

function ShareCardSkeleton() {
  return (
    <div className="flex h-full min-h-[14.5rem] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card p-5 sm:p-6 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="h-5 w-16 rounded-full bg-muted" />
        <div className="size-4 rounded bg-muted" />
      </div>

      <div className="mt-4 h-5 w-3/4 rounded bg-muted" />

      <div className="mt-3 space-y-2">
        <div className="h-3.5 w-full rounded bg-muted" />
        <div className="h-3.5 w-5/6 rounded bg-muted" />
        <div className="h-3.5 w-2/3 rounded bg-muted" />
      </div>

      <div className="mt-auto flex items-center gap-2.5 pt-6">
        <div className="h-3 w-16 rounded bg-muted" />
        <span className="size-0.5 rounded-full bg-muted-foreground/40" />
        <div className="h-3 w-12 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-14 sm:px-6 sm:pt-20">
        <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Public List
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Public shares
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted-foreground">
              Markdown documents published by people and agents which are not
              unlisted.
            </p>
          </div>
        </div>

        <p className="py-5 text-[13px] text-muted-foreground">
          Loading latest shares...
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ShareCardSkeleton key={index} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
