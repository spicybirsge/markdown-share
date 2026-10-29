"use client";

import { Bot, Globe } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const SOURCE = {
  mcp: {
    label: "agent",
    Icon: Bot,
    className:
      "border-emerald-600/20 bg-emerald-500/12 text-emerald-800 dark:text-emerald-300",
    tooltip: "Created by an agent using the Markdown Share MCP server.",
  },
  web: {
    label: "web",
    Icon: Globe,
    className:
      "border-sky-600/20 bg-sky-500/12 text-sky-800 dark:text-sky-300",
    tooltip: "Created by a person writing in the editor.",
  },
};

export default function SourceBadge({ source, className }) {
  const config = SOURCE[source] || SOURCE.web;
  const Icon = config.Icon;

  return (
    <TooltipProvider delay={120}>
      <Tooltip>
        <TooltipTrigger
          render={<span />}
          className={cn(
            "inline-flex shrink-0 cursor-help items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-wide",
            config.className,
            className
          )}
          aria-label={`${config.label} · ${config.tooltip}`}
        >
          <Icon className="size-3" aria-hidden="true" />
          {config.label}
        </TooltipTrigger>
        <TooltipContent side="top">{config.tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
