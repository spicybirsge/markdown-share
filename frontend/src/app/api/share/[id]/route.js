import variables from "@/variables/variables";

// Serves `/share/<id>.md` as raw markdown, via the rewrite in next.config.mjs.
// The share reader is a page, so it can only return HTML; this handler is the
// one place that can hand back the document itself.
//
// `metafetch=true` reads the share without counting a view, matching what MCP
// reads and the page metadata fetch already do. An agent polling the same
// document should not move the counter.

function text(body, status, headers = {}) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-content-type-options": "nosniff",
      ...headers,
    },
  });
}

export async function GET(request, { params }) {
  const { id } = await params;

  let payload = null;
  try {
    const response = await fetch(
      variables.BACKEND_URL +
        "/api/v1/read/share?metafetch=true&id=" +
        encodeURIComponent(id),
      { cache: "no-store" }
    );
    payload = await response.json().catch(() => null);
  } catch {
    payload = null;
  }

  if (!payload?.success || !payload?.data) {
    // 404 is a real answer about the share; anything else means the backend or
    // the database did not answer, which is not the same thing to an agent.
    if (payload?.code === 404) {
      return text("share not found\n", 404);
    }
    return text("share is temporarily unavailable\n", 503, {
      "cache-control": "no-store",
    });
  }

  return new Response(payload.data.content ?? "", {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "x-content-type-options": "nosniff",
      // Shares are immutable — there is no edit endpoint — so the document at a
      // given URL never changes. The short browser TTL keeps a future delete
      // from lingering, while the CDN can hold it for an hour.
      "cache-control": "public, max-age=60, s-maxage=3600",
    },
  });
}
