"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bold,
  Code,
  Eye,
  Italic,
  Link as LinkIcon,
  List,
  LoaderCircle,
  PenLine,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ShareContent from "@/components/ShareContent";
import replaceWithProxy from "@/functions/replaceWithProxy";
import variables from "@/variables/variables";
import { cn } from "@/lib/utils";

const LIMITS = { title: 70, description: 180, contentBytes: 4 * 1024 * 1024 };

const FORMATS = [
  { label: "Bold", icon: Bold, before: "**", after: "**" },
  { label: "Italic", icon: Italic, before: "_", after: "_" },
  { label: "Code", icon: Code, before: "`", after: "`" },
  { label: "Link", icon: LinkIcon, before: "[", after: "](https://)" },
  { label: "List", icon: List, before: "- ", after: "" },
];

export default function ShareComposer({ className }) {
  const router = useRouter();
  const textareaRef = useRef(null);
  const idempotencyRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [unlisted, setUnlisted] = useState(true);
  const [mode, setMode] = useState("write");
  const [creating, setCreating] = useState(false);

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.round(words / 220));

  function applyFormat(format) {
    const element = textareaRef.current;
    if (!element) return;

    const start = element.selectionStart ?? content.length;
    const end = element.selectionEnd ?? content.length;
    const selected = content.slice(start, end) || "text";
    const next =
      content.slice(0, start) +
      format.before +
      selected +
      format.after +
      content.slice(end);

    setContent(next);
    requestAnimationFrame(() => {
      element.focus();
      const selectionStart = start + format.before.length;
      element.setSelectionRange(selectionStart, selectionStart + selected.length);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (creating) return;

    if (!content.trim()) {
      setMode("write");
      toast.error("Add some markdown first.");
      textareaRef.current?.focus();
      return;
    }

    if (new TextEncoder().encode(content).length > LIMITS.contentBytes) {
      toast.error("This document is over the 4 MB limit.");
      return;
    }

    if (!idempotencyRef.current) {
      idempotencyRef.current = crypto.randomUUID();
    }

    setCreating(true);
    try {
      const request = await fetch(
        variables.BACKEND_URL + "/api/v1/create/share",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim() || undefined,
            description: description.trim() || undefined,
            content: replaceWithProxy(content),
            isUnlisted: unlisted,
            idempotencyKey: idempotencyRef.current,
          }),
        }
      );

      const response = await request.json().catch(() => null);

      if (!request.ok || !response?.success) {
        throw new Error(response?.message || "Could not create your share.");
      }

      idempotencyRef.current = null;
      router.push(`/share/${response.data._id}`);
    } catch (error) {
      toast.error(error?.message || "Could not create your share.");
    } finally {
      setCreating(false);
    }
  }

  function handleKeyDown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      handleSubmit(event);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className={cn("w-full", className)}
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
        <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <Label
                htmlFor="share-title"
                className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
              >
                Title
              </Label>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {title.length}/{LIMITS.title}
              </span>
            </div>
            <Input
              id="share-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={LIMITS.title}
              placeholder="Untitled share"
              className="mt-2 h-auto rounded-none border-0 bg-transparent px-0 py-0.5 text-2xl font-semibold tracking-[-0.025em] shadow-none placeholder:text-muted-foreground/45 focus-visible:border-transparent focus-visible:ring-0 md:text-[28px]"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Leave blank and we’ll use the first heading in your document.
            </p>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-4">
              <Label
                htmlFor="share-description"
                className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
              >
                Description
              </Label>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {description.length}/{LIMITS.description}
              </span>
            </div>
            <Input
              id="share-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={LIMITS.description}
              placeholder="A short line about what this is"
              className="mt-2 h-10 rounded-none border-0 border-b border-border bg-transparent px-0 text-[15px] shadow-none placeholder:text-muted-foreground/60 focus-visible:border-foreground focus-visible:ring-0 md:text-[15px]"
            />
          </div>
        </div>

        <div className="border-t border-border">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2 sm:px-4">
            <div className="flex items-center gap-1 rounded-full bg-background p-1 ring-1 ring-border">
              <button
                type="button"
                onClick={() => setMode("write")}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors",
                  mode === "write" && "bg-foreground text-background"
                )}
              >
                <PenLine className="size-3.5" />
                Write
              </button>
              <button
                type="button"
                onClick={() => setMode("preview")}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors",
                  mode === "preview" && "bg-foreground text-background"
                )}
              >
                <Eye className="size-3.5" />
                Preview
              </button>
            </div>

            <div className="flex items-center gap-0.5">
              {FORMATS.map((format) => (
                <button
                  key={format.label}
                  type="button"
                  onClick={() => applyFormat(format)}
                  aria-label={format.label}
                  title={format.label}
                  className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                >
                  <format.icon className="size-4" />
                </button>
              ))}
            </div>
          </div>

          {mode === "write" ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={"# Start here\n\nWrite in markdown. Code blocks, tables, images and checklists all work."}
              spellCheck={false}
              className="block min-h-[320px] w-full resize-y bg-transparent px-5 py-5 font-mono text-[13.5px] leading-7 text-foreground outline-none placeholder:text-muted-foreground/55 sm:min-h-[380px] sm:px-6"
            />
          ) : (
            <div className="min-h-[320px] px-5 py-6 sm:min-h-[380px] sm:px-8">
              {content.trim() ? (
                <ShareContent content={replaceWithProxy(content)} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nothing to preview yet.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/20 px-5 py-2 font-mono text-[11px] text-muted-foreground sm:px-6">
            <span>{words.toLocaleString()} words</span>
            <span>
              {readingTime} min read · Markdown
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-t border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <Switch
              id="share-unlisted"
              checked={unlisted}
              onCheckedChange={setUnlisted}
              className="mt-0.5"
            />
            <div>
              <Label htmlFor="share-unlisted" className="text-sm font-medium">
                Unlisted
              </Label>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                {unlisted
                  ? "Only people with the link can view this share."
                  : "This share will appear on the public list."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
              ⌘↵
            </span>
            <Button
              type="submit"
              disabled={creating}
              className="h-10 rounded-full bg-foreground px-5 text-sm font-medium text-background hover:bg-foreground/85"
            >
              {creating ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  Create share
                  <ArrowUpRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
