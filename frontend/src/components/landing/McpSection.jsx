"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import copyText from "@/functions/copyText";

const ENDPOINT = "https://api.markdownshare.shaheerahamed.com/mcp";

const PROMPT = `You have access to the Markdown Share MCP server at ${ENDPOINT} (Streamable HTTP).

When I ask you to share, publish, or hand off a markdown document, call create_share with the full document and a short title, then give me the link it returns. Use get_share when I send you a Markdown Share link.

Shares are unlisted: only people with the link can open them.`;

const CONFIG = `{
  "mcpServers": {
    "markdown-share": {
      "type": "http",
      "url": "${ENDPOINT}"
    }
  }
}`;

const COMMAND = `claude mcp add --transport http markdown-share ${ENDPOINT}`;

export default function McpSection() {
  const [tab, setTab] = useState("prompt");
  const [copied, setCopied] = useState(null);

  async function handleCopy(kind, value) {
    const ok = await copyText(value);
    if (!ok) return;
    setCopied(kind);
    setTimeout(() => setCopied(null), 1800);
  }

  const body = tab === "prompt" ? PROMPT : CONFIG;
  const kind = tab === "prompt" ? "prompt" : "config";

  return (
    <section id="mcp" className="scroll-mt-16 bg-[#0d0d0c] text-[#f4f3f0]">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-20 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16 lg:py-28">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/40">
            MCP · Model Context Protocol
          </p>
          <h2 className="mt-5 max-w-md text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
            Your agent writes.
            <br />
            We give it a link.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-7 text-white/55">
            Connect Markdown Share once. From then on, any long document your
            agent produces can become a clean, permanent page with a single
            tool call instead of a huge wall of text.
          </p>

          <ol className="mt-9 space-y-4">
            {[
              "Add the server to your MCP client.",
              "Ask your agent to share a document.",
              "Paste the link it returns.",
            ].map((step, index) => (
              <li key={step} className="flex items-start gap-4">
                <span className="mt-0.5 font-mono text-[11px] text-white/30">
                  0{index + 1}
                </span>
                <span className="text-sm leading-6 text-white/70">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-9 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/12 px-3 py-1 font-mono text-[10.5px] text-white/45">
              create_share
            </span>
            <span className="rounded-full border border-white/12 px-3 py-1 font-mono text-[10.5px] text-white/45">
              get_share
            </span>
            <span className="rounded-full border border-white/12 px-3 py-1 font-mono text-[10.5px] text-white/45">
              Streamable HTTP
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.035] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-1 rounded-full bg-white/[0.06] p-1">
                <button
                  type="button"
                  onClick={() => setTab("prompt")}
                  aria-pressed={tab === "prompt"}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-colors",
                    tab === "prompt"
                      ? "bg-white text-[#151513]"
                      : "text-white/50 hover:text-white/80"
                  )}
                >
                  Copy-paste prompt
                </button>
                <button
                  type="button"
                  onClick={() => setTab("config")}
                  aria-pressed={tab === "config"}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-colors",
                    tab === "config"
                      ? "bg-white text-[#151513]"
                      : "text-white/50 hover:text-white/80"
                  )}
                >
                  Client config
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(kind, body)}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3 text-[11.5px] font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white"
              >
                {copied === kind ? (
                  <>
                    <Check className="size-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="px-4 py-5 sm:px-6 sm:py-6">
              <pre
                className={cn(
                  "whitespace-pre-wrap break-words font-sans text-[13.5px] leading-7 text-white/75",
                  tab === "config" && "font-mono text-[12px] leading-6 text-white/70"
                )}
              >
                {body}
              </pre>
            </div>

            {tab === "config" ? (
              <div className="border-t border-white/10 bg-white/[0.025] px-4 py-4 sm:px-6">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
                  <Terminal className="size-3.5" />
                  Claude Code
                </div>
                <code className="mt-2 block break-all font-mono text-[11.5px] leading-6 text-white/60">
                  {COMMAND}
                </code>
              </div>
            ) : (
              <div className="border-t border-white/10 bg-white/[0.025] px-4 py-3.5 sm:px-6">
                <p className="text-[11.5px] leading-5 text-white/35">
                  Paste this into a new conversation after adding the server.
                  Works with any MCP client that supports Streamable HTTP.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 px-1 font-mono text-[10.5px] text-white/30">
            <span className="truncate">{ENDPOINT}</span>
            <span className="shrink-0">No keys. No accounts.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
