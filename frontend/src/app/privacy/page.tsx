import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";

const description =
  "What the hosted Markdown Share service stores, how sharing works, and how to request deletion of your data.";

export const metadata: Metadata = {
  title: "Privacy policy",
  description,
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy policy",
    description,
    url: "/privacy",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "Privacy policy", description },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" description={description}>
      <h2>1. Scope and contact</h2>
      <p>
        This policy applies only to Markdown Share hosted at{" "}
        <a href="https://markdownshare.shaheerahamed.com">
          markdownshare.shaheerahamed.com
        </a>{" "}
        and the API, MCP endpoint, and image proxy used to provide that hosted
        service. It does not apply to independently hosted copies, forks, or
        other websites, even if they use the same open source code.
      </p>
      <p>
        Markdown Share is operated personally by Shaheer Ahamed as a side
        project based in Sri Lanka, rather than as a business. In this policy,
        &quot;we&quot; and &quot;us&quot; refer to Shaheer Ahamed as the operator of
        this hosted service.
      </p>
      <p>
        For privacy questions and data deletion requests, email{" "}
        <a href="mailto:contact@shaheerahamed.com">contact@shaheerahamed.com</a>.
      </p>

      <h2>2. Information the service stores</h2>
      <ul>
        <li>
          <strong>Shared documents:</strong> the markdown you submit, its title
          and optional description, a unique document identifier, creation time,
          and whether the share is public or unlisted. Any personal information
          you include in a document becomes part of its stored content.
        </li>
        <li>
          <strong>Creation metadata:</strong> whether a share was created through
          the web editor or MCP, and a retry identifier when supplied to prevent
          duplicate shares. The stored record also supports an optional client
          label.
        </li>
        <li>
          <strong>Reader IP addresses:</strong> ordinary reads through the share
          API can store the requesting IP address with the document to avoid
          counting the same address more than once. This is an IP address, not
          an anonymous identifier. Readers receive the total view count, not
          the stored address list. MCP reads, raw markdown reads, and metadata
          fetches do not add addresses to that list.
        </li>
        <li>
          <strong>Request and error logs:</strong> the backend logs request IP
          addresses, timestamps, requested paths and query strings, HTTP methods,
          response statuses and sizes, referrers, and browser or client user
          agents. Query strings can include share identifiers and requested image
          URLs. Errors may also appear in operational logs.
        </li>
        <li>
          <strong>Correspondence:</strong> if you email the contact address, your
          email address, message, and information you provide are used to handle
          your question or request.
        </li>
      </ul>
      <p>
        You do not need an account to create or read a share. The editor does not
        require your name or email address. Please avoid submitting passwords,
        access tokens, confidential documents, or personal information you do
        not have permission to share.
      </p>

      <h2>3. How information is used</h2>
      <p>
        Document content and metadata are used to create, store, display, and
        retrieve shares, generate previews, and provide raw markdown and MCP
        access. Public share metadata and excerpts are used in public listings.
        Retry identifiers prevent duplicate submissions. Reader IP records are
        used for view counting; request and error logs support operation and
        troubleshooting of the service. Correspondence is used to respond to
        inquiries and handle requests.
      </p>

      <h2>4. Public and unlisted shares</h2>
      <p>
        Public shares can appear on the home page and public list. Unlisted
        shares are excluded from those listings, but anyone who has their link
        or identifier can read them through the website, API, raw markdown
        endpoint, or MCP. Shares are not protected by an account or password.
        Shares created through MCP are always unlisted.
      </p>
      <p>
        Anyone with access can copy, download, or redistribute a document.
        Search engines and other third parties may discover links that are
        published elsewhere. Choosing unlisted does not guarantee secrecy or
        prevent indexing. Do not use it as a substitute for access controls.
      </p>

      <h2>5. Analytics and advertising</h2>
      <p>
        We use Vercel Web Analytics to understand traffic and improve the
        service through aggregated usage statistics. Analytics data can include
        page URLs, referring sites, timestamps, approximate location, browser,
        operating system, and device type. Page URLs may include a share&apos;s
        identifier. Vercel describes its analytics as using visitor hashes
        derived from requests rather than third-party cookies. See{" "}
        <a href="https://vercel.com/docs/analytics/privacy-policy">
          Vercel Web Analytics privacy documentation
        </a>{" "}
        for details. This analytics processing is separate from the reader IP
        records and request logs described above.
      </p>
      <p>
        We do not sell user data. There are currently no advertisements on the
        service. We may introduce advertising in the future; any related data
        practices will be described in an updated privacy policy before those
        changes take effect.
      </p>

      <h2>6. Hosting, external content, and agent clients</h2>
      <p>
        Vercel hosts the frontend and backend. MongoDB Atlas hosts the database
        containing shares, their metadata, and associated reader IP records.
        These providers process data as needed to deliver their hosting and
        database services. Hosting also involves processing request and
        operational information, such as IP addresses and logs. See{" "}
        <a href="https://vercel.com/legal/privacy-notice">Vercel&apos;s privacy notice</a>{" "}
        and <a href="https://www.mongodb.com/legal/privacy">MongoDB&apos;s privacy information</a>{" "}
        for information about their practices.
      </p>
      <p>
        Documents may contain external links and images. Images can be fetched
        through an image proxy, which processes the image URL and retrieves it
        from the external host. Depending on how an image is loaded, the external
        host may receive a request from the proxy or your browser. Following an
        external link sends you to a service with its own privacy practices.
      </p>
      <p>
        If you connect an AI assistant or other MCP client, that provider may
        process the content you ask it to submit or retrieve. Its own terms and
        privacy policy govern its handling of that content. Connecting a client
        does not make a share private.
      </p>

      <h2>7. Retention</h2>
      <p>
        Shares do not have an automatic expiry. We retain document content,
        metadata, and associated reader IP records until removal is requested,
        or the share is removed following a report of illegal or abusive content.
        There is no self-service edit or delete feature; request deletion using
        the contact details below. Removing a share from the live database does
        not necessarily remove cached copies immediately. Copies downloaded or
        republished by others are outside the service&apos;s control.
      </p>

      <h2>8. Deletion requests and your rights</h2>
      <p>
        Email{" "}
        <a href="mailto:contact@shaheerahamed.com">contact@shaheerahamed.com</a>{" "}
        to request deletion of a share or personal data, including stored reader
        IP records. Include the share URL or identifier when relevant and explain
        what you want removed. Avoid sending sensitive identity documents in your
        initial email. Additional information may be needed to locate the data
        and verify your connection to it, since shares are created without
        accounts.
      </p>
      <p>
        Depending on applicable law, you may also have rights to access, correct,
        restrict, object to processing of, or receive a copy of your personal
        data, and to complain to the relevant data protection authority. Contact
        the same address to make a request or raise a concern.
      </p>

      <h2>9. Minimum age</h2>
      <p>
        The service is intended for people aged 13 and over. Children under 13
        must not use it or submit personal information. If you believe a child
        under 13 has submitted personal information, email{" "}
        <a href="mailto:contact@shaheerahamed.com">contact@shaheerahamed.com</a>{" "}
        to request its removal.
      </p>

      <h2>10. Security and policy changes</h2>
      <p>
        No online service can guarantee complete security. The sharing model
        makes documents accessible to anyone with their link, so you should
        only submit content suitable for that access. If you believe personal
        information has been exposed, contact the email address above.
      </p>
      <p>
        Updates to this policy will be posted on this page with a revised
        last-updated date. See the <Link href="/terms">terms of service</Link>{" "}
        for the rules that apply to using the hosted service.
      </p>
    </LegalPage>
  );
}
