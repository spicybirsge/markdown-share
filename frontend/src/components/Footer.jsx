import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Logo, { LogoMark } from "@/components/Logo";
import GithubIcon from "@/components/GithubIcon";

const GROUPS = [
  {
    title: "Product",
    links: [
      { href: "/list", label: "Public shares" },
      { href: "/new", label: "Create a share" },
      { href: "/#mcp", label: "MCP for agents" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              The agentic markdown sharing platform.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10">
            {GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {group.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Open source
              </p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link
                    href="https://github.com/spicybirsge/markdown-share"
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <GithubIcon className="size-4" />
                    Contribute
                    <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark className="size-6 rounded-[7px]" />
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Shaheer Ahamed. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
