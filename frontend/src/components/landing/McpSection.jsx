"use client";

import { useState } from "react";
import { Check, Copy, Link2, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import copyText from "@/functions/copyText";

const ENDPOINT = "https://api.markdownshare.shaheerahamed.com/mcp";

const PROMPT = `You have access to the Markdown Share MCP server at ${ENDPOINT} (Streamable HTTP).

When I ask you to share, publish, or hand off a markdown document, call create_share with the full document and a short title, then give me the link it returns. Use get_share when I send you a Markdown Share link.

If the server isn't connected yet, tell me exactly what to add to my MCP config.

Shares are unlisted: only people with the link can open them.`;

const CLIENTS = [
  {
    id: "claude",
    name: "Claude Code",
    logo: "/assets/media/claude.svg",
    logoClass: "size-4 brightness-0 invert",
    hint: "Run this once in your terminal. It adds the server at user scope.",
    code: `claude mcp add --transport http --scope user markdown-share ${ENDPOINT}`,
  },
  {
    id: "codex",
    name: "Codex",
    logo: "/assets/media/openai.svg",
    logoClass: "size-4 brightness-0 invert",
    hint: "Run this once in your terminal. Codex saves it to ~/.codex/config.toml.",
    code: `codex mcp add markdown-share --url ${ENDPOINT}`,
  },
  {
    id: "opencode",
    name: "OpenCode",
    logo: "/assets/media/opencode-logo-dark.svg",
    logoClass: "h-4 w-auto",
    hint: "Run this once in your terminal. It writes the server to your global config.",
    code: `opencode mcp add --global markdown-share --url ${ENDPOINT}`,
  },
  {
    id: "cursor",
    name: "Cursor CLI",
    logo: "/assets/media/CURSOR_ICON_2D_DARK.png",
    logoClass: "size-4 rounded-[3px] mix-blend-lighten",
    hint: "Cursor CLI reads the editor's mcp.json. Add this to ~/.cursor/mcp.json, or .cursor/mcp.json for one project.",
    code: `{
  "mcpServers": {
    "markdown-share": {
      "url": "${ENDPOINT}"
    }
  }
}`,
  },
  {
    id: "other",
    name: "Other clients",
    icon: Terminal,
    hint: "No one-line command? Add the server in your client's MCP settings, then paste this into a new conversation.",
    code: PROMPT,
    isPrompt: true,
  },
];

export default function McpSection() {
  const [client, setClient] = useState("claude");
  const [copied, setCopied] = useState(null);

  const active = CLIENTS.find((item) => item.id === client) ?? CLIENTS[0];

  async function handleCopy(kind, value) {
    const ok = await copyText(value);
    if (!ok) return;
    setCopied(kind);
    setTimeout(
      () => setCopied((current) => (current === kind ? null : current)),
      1800
    );
  }

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
              "Pick your client and run the setup.",
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
            <div className="border-b border-white/10 px-4 py-3.5 sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
                  Set up your client
                </p>
                <span className="shrink-0 font-mono text-[10px] text-white/25">
                  one-time
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {CLIENTS.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === active.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setClient(item.id)}
                      aria-pressed={isActive}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                        isActive
                          ? "border-white/20 bg-white/[0.12] text-white"
                          : "border-transparent text-white/45 hover:bg-white/[0.05] hover:text-white/80"
                      )}
                    >
                      {Icon ? (
                        <Icon className="size-3.5" />
                      ) : (
                        <img
                          src={item.logo}
                          alt=""
                          aria-hidden="true"
                          className={item.logoClass}
                        />
                      )}
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-5 sm:px-5">
              <div className="flex items-start justify-between gap-4">
                <p className="max-w-md text-[12.5px] leading-6 text-white/45">
                  {active.hint}
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy(active.id, active.code)}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3 text-[11.5px] font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  {copied === active.id ? (
                    <>
                      <Check className="size-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      {active.isPrompt ? "Copy prompt" : "Copy"}
                    </>
                  )}
                </button>
              </div>

              <pre
                className={cn(
                  "mt-3 whitespace-pre-wrap break-words rounded-xl border border-white/[0.07] bg-black/25 px-3.5 py-3",
                  active.isPrompt
                    ? "font-sans text-[13px] leading-6 text-white/70"
                    : "font-mono text-[11.5px] leading-6 text-white/65"
                )}
              >
                {active.code}
              </pre>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[0.025] px-4 py-3.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-2">
                <Link2 className="size-3.5 shrink-0 text-white/30" />
                <code className="truncate font-mono text-[11px] text-white/45">
                  {ENDPOINT}
                </code>
              </div>
              <button
                type="button"
                onClick={() => handleCopy("endpoint", ENDPOINT)}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3 text-[11.5px] font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                {copied === "endpoint" ? (
                  <>
                    <Check className="size-3.5" />
                    Link copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Copy MCP link
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 px-1 font-mono text-[10.5px] text-white/30">
            <span>No keys. No accounts.</span>
            <span className="shrink-0">Streamable HTTP</span>
          </div>
        </div>
      </div>
    </section>
  );
}
