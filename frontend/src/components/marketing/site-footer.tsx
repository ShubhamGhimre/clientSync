import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandMark, Logo } from "@/components/logo";

const cols = [
  {
    title: "Product",
    links: [
      ["Features", "/features"],
      ["Pricing", "/pricing"],
      ["Log in", "/auth/login"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Contact", "/contact"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-muted/35">
      <BrandMark
        size={280}
        className="pointer-events-none absolute -bottom-20 -left-16 text-foreground opacity-[0.035]"
        aria-hidden="true"
      />

      <div className="mx-auto relative z-10 grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr]">
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <Logo />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground shadow-xs">
              <BrandMark size={12} className="text-primary" />
              AI Support Workspace
            </span>
          </div>

          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            AI support chatbots trained on your own documentation, with your
            team one click away.
          </p>

          <Link
            href="/auth/register"
            className="group inline-flex w-fit items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline"
          >
            Get started free
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {cols.map((c) => (
          <div key={c.title} className="flex flex-col gap-2.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {c.title}
            </h3>
            <ul className="flex flex-col gap-2">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative z-10 border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} ClientSync. All rights reserved.</p>
          <span className="inline-flex items-center gap-1.5">
            <BrandMark size={13} className="text-muted-foreground" />
            Grounded in your knowledge base
          </span>
        </div>
      </div>
    </footer>
  );
}