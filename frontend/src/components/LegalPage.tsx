import type { ReactNode } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";

export default function LegalPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-14 sm:px-6 sm:pt-20">
        <header className="mb-10 border-b border-border pb-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
            {description}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Last updated: <time dateTime="2026-11-09">November 9, 2026</time>
          </p>
        </header>
        <article className="md-content">{children}</article>
        <nav
          aria-label="Legal documents"
          className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-6 text-sm text-muted-foreground"
        >
          <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
            Terms of service
          </Link>
          <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
            Privacy policy
          </Link>
        </nav>
      </main>
      <Footer />
    </>
  );
}
