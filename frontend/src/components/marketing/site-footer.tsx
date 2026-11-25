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
    <footer className="relative overflow-hidden border-t border-border/80 bg-muted/25">
      <BrandMark
        size={300}
        className="pointer-events-none absolute -bottom-20 -left-16 text-foreground opacity-[0.035]"
        aria-hidden="true"
      />

      <div className="page relative z-10 grid gap-10 py-14 md:grid-cols-[1.6fr_1fr_1fr]">
        <div className="stack gap-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              <BrandMark size={12} className="text-brand-strong" />
              AI Support Workspace
            </span>
          </div>

          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            AI support chatbots trained on your own documentation, with your
            team one click away.
          </p>

          <Link
            href="/auth/register"
            className="group inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand-strong transition-colors hover:underline"
          >
            Get started free
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {cols.map((c) => (
          <div key={c.title} className="stack gap-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {c.title}
            </h3>
            <ul className="stack gap-2.5">
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

      <div className="relative z-10 border-t border-border/70">
        <div className="page flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} ClientSync. All rights reserved.</p>
          <span className="inline-flex items-center gap-1.5">
            <BrandMark size={13} className="text-muted-foreground/80" />
            Grounded in your knowledge base
          </span>
        </div>
      </div>
    </footer>
  );
}