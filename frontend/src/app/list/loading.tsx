import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

function ShareCardSkeleton() {
  return (
    <div className="flex h-full min-h-64 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-7 animate-pulse">
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
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl px-5 pb-24 pt-14 sm:px-6 sm:pt-20">
        <header className="mb-10 sm:mb-12">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Public shares
          </h1>
        </header>
        <p role="status" className="sr-only">Loading public shares…</p>

        <div aria-hidden="true" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ShareCardSkeleton key={index} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
