import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AgentDemo from "@/components/landing/AgentDemo";
import McpSection from "@/components/landing/McpSection";
import ShareComposer from "@/components/ShareComposer";

export default function Home() {
  return (
    <>
      <NavBar />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-6xl flex-col justify-center px-5 py-14 sm:px-6 lg:py-16">
            <div className="grid min-w-0 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
              <div className="min-w-0 max-w-xl">
                <Link
                  href="#mcp"
                  className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
                >
                  <span className="size-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/15" />
                  <span className="font-medium text-emerald-700">
                    Now with MCP
                  </span>
                  <span className="h-3 w-px bg-border" />
                  Connect your agent
                  <ArrowUpRight className="size-3" />
                </Link>

                <h1
                  className="animate-fade-up mt-7 text-[clamp(2rem,4.6vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.045em]"
                  style={{ animationDelay: "60ms" }}
                >
                  <span className="block">The agentic</span>
                  <span className="block">markdown sharing</span>
                  <span className="block">platform</span>
                </h1>

                <p
                  className="animate-fade-up mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-[17px] sm:leading-8"
                  style={{ animationDelay: "120ms" }}
                >
                  Markdown Share turns plain markdown into clean, permanent
                  pages. Write it yourself, or let your agent publish it over
                  MCP.
                </p>

                <div
                  className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row"
                  style={{ animationDelay: "180ms" }}
                >
                  <Link
                    href="#write"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Start writing
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/list"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:border-foreground/25 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Browse public shares
                  </Link>
                </div>
              </div>

              <div
                className="min-w-0 animate-fade-up"
                style={{ animationDelay: "140ms" }}
              >
                <AgentDemo />
              </div>
            </div>
          </div>
        </section>

        <section id="write" className="scroll-mt-16 border-b border-border">
          <div className="mx-auto w-full max-w-4xl px-5 py-20 sm:px-6 sm:py-24">
            <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Create
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                  Write one yourself.
                </h2>
                <p className="mt-3 max-w-lg text-[15px] leading-7 text-muted-foreground">
                  Paste markdown, add a title, get a link. No account, no
                  setup.
                </p>
              </div>
              <Link
                href="/new"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Open full editor
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <ShareComposer />
          </div>
        </section>

        <McpSection />
      </main>
      <Footer />
    </>
  );
}
