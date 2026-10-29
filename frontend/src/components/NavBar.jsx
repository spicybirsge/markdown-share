"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import GithubIcon from "@/components/GithubIcon";
import { cn } from "@/lib/utils";

const LINKS = [

  { href: "/list", label: "Public shares" },
  { href: "/#mcp", label: "MCP" },
 
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href) => {
    if (href === "/list") return pathname === "/list";
    if (href === "/new") return pathname === "/new";
    return false;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-6">
        <Logo />

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex"
          aria-label="Main"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive(link.href) && "bg-muted text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="https://github.com/spicybirsge/markdown-share"
            target="_blank"
            rel="noreferrer"
            aria-label="Markdown Share on GitHub"
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <GithubIcon className="size-[17px]" />
          </Link>
          <Link
            href="/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            New share
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-muted md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          className="animate-fade-in border-t border-border bg-background px-5 pb-6 pt-3 md:hidden"
        >
          <nav className="flex flex-col" aria-label="Mobile">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center justify-between border-b border-border/70 py-4 text-base font-medium text-muted-foreground",
                  isActive(link.href) && "text-foreground"
                )}
              >
                {link.label}
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
            <Link
              href="https://github.com/spicybirsge/markdown-share"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between py-4 text-base font-medium text-muted-foreground"
            >
              Contribute
              <GithubIcon className="size-[18px]" />
            </Link>
          </nav>
          <Link
            href="/new"
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background"
          >
            New share
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      ) : null}
    </header>
  );
}
