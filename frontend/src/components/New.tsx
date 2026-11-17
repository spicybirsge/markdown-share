import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ShareComposer from "@/components/ShareComposer";

export default function New() {
  return (
    <>
      <NavBar />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-4xl px-5 pb-24 pt-14 sm:px-6 sm:pt-20">
        <header className="mb-10 sm:mb-12">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            New share
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-7 text-muted-foreground">
            Write or paste markdown. Get a link to share.
          </p>
        </header>

        <ShareComposer />
      </main>
      <Footer />
    </>
  );
}
