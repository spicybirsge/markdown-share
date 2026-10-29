import New from "@/components/New";

export const metadata = {
  title: "New share",
  description:
    "Create a new markdown share. Paste your document, add a title and publish a clean, permanent page.",
  openGraph: {
    title: "New share",
    description:
      "Create a new markdown share. Paste your document, add a title and publish a clean, permanent page.",
  },
  twitter: {
    card: "summary_large_image",
    title: "New share",
    description:
      "Create a new markdown share. Paste your document, add a title and publish a clean, permanent page.",
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
