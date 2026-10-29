"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import CodeBlock from "@/components/CodeBlock";

// GFM task lists produce `<input type="checkbox" checked disabled>`. The default
// sanitize schema keeps `type` and `disabled` but drops `checked`, which made
// every completed task render as an empty box.
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    input: [...defaultSchema.attributes.input, ["checked", true]],
  },
};

const rehypePlugins = [
  [rehypeSanitize, schema],
  [rehypeHighlight, { detect: false, ignoreMissing: true }],
];

// Defined outside the component so react-markdown sees a stable reference and
// does not remount every code block on each render.
const components = { pre: CodeBlock };

export default function ShareContent({ content }) {
  return (
    <div className="md-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}
