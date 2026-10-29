"use client";

import { useEffect, useState } from "react";
import { Command, CornerDownLeft, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

function Key({ children, className }) {
  return (
    <kbd
      className={cn(
        "grid h-6.5 min-w-6.5 place-items-center rounded-md border border-border bg-background px-1 text-muted-foreground shadow-[inset_0_-1px_0_var(--border)]",
        className
      )}
    >
      {children}
    </kbd>
  );
}

export default function SubmitHint({ className }) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(ua));
  }, []);

  return (
    <span
      className={cn(
        "items-center gap-1.5 text-[11px] text-muted-foreground",
        className
      )}
      aria-label={`Press ${isMac ? "Command" : "Control"} and Enter to create the share`}
    >
      {isMac ? (
        <Key>
          <Command className="size-4" aria-hidden="true" />
        </Key>
      ) : (
        <Key className="px-1.5 text-[10.5px] font-medium">Ctrl</Key>
      )}
      <Plus className="size-3.5 text-muted-foreground/60" aria-hidden="true" />
      <Key>
        <CornerDownLeft className="size-4" aria-hidden="true" />
      </Key>
      <span className="ml-0.5">to publish</span>
    </span>
  );
}
