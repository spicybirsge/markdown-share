"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  FileText,
  LoaderCircle,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROMPT = "Take my meeting notes and publish them as a share.";

export default function AgentDemo() {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (reduced) {
      setTyped(PROMPT.length);
      setPhase("done");
      return;
    }

    let cancelled = false;
    const timers = [];
    const wait = (ms) =>
      new Promise((resolve) => timers.push(setTimeout(resolve, ms)));

    async function run() {
      while (!cancelled) {
        setPhase("typing");
        setTyped(0);

        for (let index = 1; index <= PROMPT.length; index += 1) {
          await wait(26);
          if (cancelled) return;
          setTyped(index);
        }

        await wait(700);
        if (cancelled) return;
        setPhase("thinking");

        await wait(1150);
        if (cancelled) return;
        setPhase("tool");

        await wait(1500);
        if (cancelled) return;
        setPhase("done");

        await wait(7000);
        if (cancelled) return;
      }
    }

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [visible, reduced]);

  const agentVisible = phase !== "typing";
  const toolVisible = phase === "tool" || phase === "done";
  const resultVisible = phase === "done";

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full min-w-0 max-w-3xl"
    >
      <div className="min-w-0 rounded-[22px] border border-black/5 bg-[#10100f] p-1.5 shadow-[0_24px_70px_-30px_rgba(24,22,20,0.55)] sm:p-2">
        <div className="min-w-0 overflow-hidden rounded-[16px] border border-white/10 bg-[#171716]">
          <div className="flex h-11 items-center gap-3 border-b border-white/10 px-4">
            <div className="flex shrink-0 gap-1.5" aria-hidden="true">
              {/* macOS traffic lights: close, minimize, zoom. */}
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
            </div>
            <p className="min-w-0 truncate font-mono text-[10.5px] tracking-wide text-white/35">
              claude
              <span className="hidden sm:inline"> · markdown share</span>
            </p>
            <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.06] px-2 py-1 font-mono text-[10px] text-white/45">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              MCP connected
            </span>
          </div>

          <div className="flex min-h-[340px] min-w-0 flex-col gap-4 px-4 py-5 sm:min-h-[356px] sm:px-6 sm:py-6">
            <div
              className={cn(
                "flex justify-end transition-opacity duration-300",
                typed === 0 && "opacity-0"
              )}
            >
              <div className="max-w-[85%] break-words rounded-2xl rounded-br-md bg-white px-4 py-2.5 text-[13px] leading-6 text-[#181816] sm:max-w-[75%]">
                {PROMPT.slice(0, typed)}
                {phase === "typing" ? (
                  <span className="animate-caret ml-0.5 inline-block h-[13px] w-[1.5px] translate-y-[2px] bg-[#181816]" />
                ) : null}
              </div>
            </div>

            <div
              className={cn(
                "transition-all duration-500",
                agentVisible
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-2 opacity-0"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-white/10 font-mono text-[9px] text-white/60">
                  C
                </span>
                <span className="text-[11.5px] font-medium text-white/70">
                  Claude
                </span>
                <span className="font-mono text-[10px] text-white/25">
                  markdown-share
                </span>
              </div>

              <div className="mt-2.5 flex min-w-0 flex-wrap items-center gap-2 pl-8 text-[12px] text-white/45">
                {phase === "thinking" ? (
                  <>
                    <LoaderCircle className="size-3.5 animate-spin" />
                    Reading the request
                  </>
                ) : null}
                {toolVisible ? (
                  <>
                    <Terminal className="size-3.5" />
                    <span className="font-mono text-[11px]">
                      create_share
                    </span>
                    <span className="text-white/25">·</span>
                    <span className="font-mono text-[10.5px]">unlisted</span>
                    {resultVisible ? (
                      <Check className="ml-1 size-3.5 text-emerald-400" />
                    ) : null}
                  </>
                ) : null}
              </div>

              <div
                className={cn(
                  "ml-8 mt-3 min-w-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] transition-all duration-500",
                  toolVisible
                    ? "max-h-40 translate-y-0 opacity-100"
                    : "max-h-0 translate-y-1 border-transparent opacity-0"
                )}
              >
                <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2 font-mono text-[10px] text-white/35">
                  <span>tools/create_share</span>
                  <span>unlisted: true</span>
                </div>
                <div className="space-y-1 px-3.5 py-2.5 font-mono text-[10.5px] leading-5 text-white/50">
                  <p>
                    <span className="text-white/30">title</span>{" "}
                    <span className="text-white/75">
                      &quot;Q4 planning notes&quot;
                    </span>
                  </p>
                  <p className="truncate">
                    <span className="text-white/30">content</span>{" "}
                    <span className="text-white/60">
                      &quot;# Q4 planning · Ship the reader by Friday…&quot;
                    </span>
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  "ml-8 mt-3 transition-all duration-500",
                  resultVisible
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0"
                )}
              >
                <div className="flex min-w-0 items-center gap-3 rounded-xl bg-[#faf9f7] p-3 text-[#1b1b19]">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#eeece8]">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium">
                      Q4 planning notes
                    </p>
                    <p className="truncate font-mono text-[10px] text-black/45">
                      markdownshare.shaheerahamed.com/share/8f2c1a
                    </p>
                  </div>
                  <span className="ml-auto hidden shrink-0 rounded-full border border-black/10 px-2 py-0.5 text-[9.5px] font-medium text-black/50 sm:inline">
                    Unlisted
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-black/35" />
                </div>
                <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-emerald-400/75">
                  <Check className="size-3" />
                  Published in 1.2s · link ready to paste
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
