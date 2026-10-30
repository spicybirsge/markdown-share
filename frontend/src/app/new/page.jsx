import New from "@/components/New";

export const metadata = {
  title: "New share",
  description:
    "Create a new markdown share. Paste your document, add a title and publish a clean, permanent page.",
  openGraph: {
    title: "New share",
    description:
      "Create a new markdown share. Paste your document, add a title and publish a clean, permanent page.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "New share",
    description:
      "Create a new markdown share. Paste your document, add a title and publish a clean, permanent page.",
    images: ["/og.png"],
  },
  keywords: [
    "markdown share",
    "markdown",
    "share",
    "new share",
    "new markdown",
    "readme",
  ],
};

export default function Page() {
  return <New />;
}
