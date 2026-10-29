"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import copyText from "@/functions/copyText";

// Rendered in place of `<pre>` by ShareContent. The wrapper owns the outer
// margin so the copy button can sit outside the horizontally scrolling `<pre>`,
// and the text is read from the DOM so highlighted spans need no unwrapping.
export default function CodeBlock({ node: _node, children, ...props }) {
  const preRef = useRef(null);
  const timer = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleCopy() {
    // `textContent` keeps the code block's trailing newline; drop it so a paste
    // does not land with an extra blank line.
    const text = preRef.current?.textContent?.replace(/\n$/, "");
    if (!text) return;
    if (!(await copyText(text))) return;
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="md-code-block">
      <pre ref={preRef} {...props}>
        {children}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="md-code-copy"
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
