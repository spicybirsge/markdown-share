import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";

const description =
  "The terms for creating, reading, and sharing documents on the hosted Markdown Share service.";

export const metadata: Metadata = {
  title: "Terms of service",
  description,
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of service",
    description,
    url: "/terms",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "Terms of service", description },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" description={description}>
      <h2>1. Scope and agreement</h2>
      <p>
        These terms apply only to Markdown Share hosted at{" "}
        <a href="https://markdownshare.shaheerahamed.com">
          markdownshare.shaheerahamed.com
        </a>{" "}
        and the API, MCP endpoint, and image proxy used to provide that hosted
        service. They do not apply to independently hosted copies, forks, or
        other websites. By using the hosted service, you agree to these terms.
        If you do not agree, do not use it.
      </p>
      <p>
        Markdown Share is operated personally by Shaheer Ahamed as a side
        project based in Sri Lanka, rather than as a business. References to
        the &quot;operator&quot; in these terms mean Shaheer Ahamed.
      </p>
      <p>
        Questions, abuse reports, copyright concerns, and data deletion requests
        can be sent to{" "}
        <a href="mailto:contact@shaheerahamed.com">contact@shaheerahamed.com</a>.
        The <Link href="/privacy">privacy policy</Link> explains what the service
        stores and how to make a privacy request.
      </p>

      <h2>2. Minimum age</h2>
      <p>
        You must be at least 13 years old to use the service and meet any higher
        minimum age required by the law that applies to you.
      </p>

      <h2>3. How sharing works</h2>
      <p>
        Markdown Share lets you submit markdown and receive a link to a rendered
        document. No account is required. You can create public or unlisted
        shares through the web editor; shares created through MCP are always
        unlisted. Public shares can appear on the home page and public list.
      </p>
      <p>
        Unlisted means excluded from those listings. Anyone with a share&apos;s
        link or identifier can read, copy, or download it, including through the
        API, raw markdown endpoint, or MCP. There is no password or account-based
        access control. Do not submit secrets or content that needs restricted
        access, and check what an agent is submitting on your behalf.
      </p>
      <p>
        Shares currently cannot be edited or deleted through the editor, API, or
        MCP. To request removal, email the contact address with the share URL and
        an explanation of your request. Verification may be needed. Removing a
        share cannot recall copies already downloaded or republished by others,
        and cached copies may remain temporarily.
      </p>

      <h2>4. Your content and permissions</h2>
      <p>
        You retain any ownership rights you have in your content. You must have
        the rights and permissions needed to submit it and make it accessible
        through the service, including permission for personal information about
        other people.
      </p>
      <p>
        By submitting content, you grant the service operator a non-exclusive
        permission to store, reproduce, render, and distribute it as needed to
        operate the sharing features, including public previews when you choose
        a public share. This permission does not transfer ownership of your
        content. Making a document accessible does not by itself give other
        users a license to reuse it beyond the permissions you or the law provide.
      </p>
      <p>
        The project&apos;s open source license applies to its software. It does
        not automatically apply to documents submitted by users, and it does not
        make operators of independent copies responsible for this hosted service.
      </p>

      <h2>5. Acceptable use and content removal</h2>
      <p>You must not use the service to:</p>
      <ul>
        <li>
          Publish unlawful material, exploitative content, credible threats,
          harassment, or personal information shared without appropriate rights.
        </li>
        <li>
          Infringe copyright, trademarks, privacy, or other rights, or impersonate
          someone in a misleading or harmful way.
        </li>
        <li>
          Distribute malware, run phishing campaigns, or facilitate fraud.
        </li>
        <li>
          Flood the service with spam or requests, disrupt its availability,
          exploit vulnerabilities, or bypass technical restrictions and limits.
        </li>
        <li>
          Use the image proxy to access restricted systems or retrieve content
          outside its intended image-serving function.
        </li>
      </ul>
      <p>
        These rules also apply to API calls and actions taken by agents or other
        automated clients on your behalf. Report suspected misuse to the contact
        address above, including the relevant share URL and the reason for your
        report.
      </p>
      <p>
        The operator may remove illegal or abusive content following a report.
        To report a share, email{" "}
        <a href="mailto:contact@shaheerahamed.com">contact@shaheerahamed.com</a>{" "}
        with its URL and an explanation of the issue. You can also use that
        address to request deletion of your share or personal data.
      </p>

      <h2>6. Content from other people and services</h2>
      <p>
        Documents are submitted by users and automated clients. Their availability
        does not mean the service operator endorses them or has verified their
        accuracy, safety, or legality. Evaluate content before relying on it.
        External websites, image hosts, and AI clients have their own terms and
        privacy policies.
      </p>

      <h2>7. Availability and your own copies</h2>
      <p>
        The service is currently free to use. It is a personal side project,
        with no guaranteed level of availability or support.
      </p>
      <p>
        The service is provided on an &quot;as is&quot; and &quot;as available&quot;
        basis, to the extent permitted by law. There is no guarantee of
        uninterrupted access, error-free rendering, suitability for a particular
        purpose, or permanent storage. Features and technical limits may change,
        and the service may be interrupted or discontinued. Keep your own copies
        of documents you need.
      </p>

      <h2>8. Responsibility and liability</h2>
      <p>
        You are responsible for the content you submit and for using the service
        lawfully. To the extent permitted by applicable law, the service operator
        is not liable for loss of data, lost profits, or indirect or consequential
        losses arising from use of, or inability to use, the service. Nothing in
        these terms excludes liability or limits rights that cannot lawfully be
        excluded or limited.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These terms are governed by the laws of Sri Lanka. This does not take
        away any mandatory protections or rights that apply to you under the
        laws of your place of residence.
      </p>

      <h2>10. Changes and contact</h2>
      <p>
        Updated terms will be posted on this page with a revised last-updated
        date. Review them when using the service. Changes apply to future use
        to the extent permitted by law; if you do not agree to updated terms,
        stop using the service.
      </p>
      <p>
        For any question about these terms, email{" "}
        <a href="mailto:contact@shaheerahamed.com">contact@shaheerahamed.com</a>.
      </p>
    </LegalPage>
  );
}
