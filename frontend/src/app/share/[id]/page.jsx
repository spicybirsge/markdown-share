import Share from "@/components/Share";
import variables from "@/variables/variables";

// Next 15+ passes route params to server components as a Promise, so they must
// be awaited before use. Reading params.id directly yields undefined, which
// made both the metadata fetch and the client reader request ?id=undefined.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const url =
    variables.BACKEND_URL +
    "/api/v1/read/share?metafetch=true&id=" +
    encodeURIComponent(id);
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  })
    .then((request) => request.json())
    .catch(() => null);

  // This never throws `notFound()`. Metadata resolves before the reader mounts,
  // so bailing out here rendered a 404 page that the client then replaced with
  // the real share (the flash the reader used to show). The client component
  // owns the missing/error states and renders its own 404 screen.
  if (!response?.success || !response?.data) {
    return {
      title: "Markdown Share",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: response.data.title,
    description: response.data.description || "No description",
    keywords: ["markdown share", "markdown", "share", "markdown post", "post"],
    // Lets a crawler that only sees the HTML discover the raw document, which is
    // served by the `/share/<id>.md` rewrite.
    alternates: {
      types: {
        "text/markdown": `/share/${encodeURIComponent(id)}.md`,
      },
    },
    openGraph: {
      type: "article",
      title: response.data.title,
      description: response.data.description || "No description",
      siteName: "Markdown Share",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "Markdown Share - The agentic markdown sharing platform",
        },
      ],
    },
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  return <Share id={id} />;
}
