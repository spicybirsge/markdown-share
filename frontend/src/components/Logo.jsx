import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-[9px] bg-foreground text-background",
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        className="size-[17px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 46V18L32 35 46 18V46" />
        <circle cx="32" cy="21" r="3" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

export default function Logo({ className }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        className
      )}
      aria-label="Markdown Share home"
    >
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-[-0.01em]">
        Markdown <span className="text-muted-foreground">Share</span>
      </span>
    </Link>
  );
}
