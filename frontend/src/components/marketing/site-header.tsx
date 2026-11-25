"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { BrandMark, Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav
          className="ml-4 hidden items-center gap-1 rounded-full border border-border/60 bg-muted/35 p-1 md:flex"
          aria-label="Main"
        >
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "bg-background text-foreground shadow-2xs ring-1 ring-border/70"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2.5 md:flex">
          <ThemeToggle inline />
          <div className="mx-1 h-4 w-px bg-border/80" aria-hidden="true" />
          <Link href="/auth/login" className="btn btn-ghost btn-sm">
            Log in
          </Link>
          <Link
            href="/auth/register"
            className="btn btn-brand btn-sm group inline-flex items-center gap-1.5 rounded-xl"
          >
            Start free
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          className="btn btn-ghost btn-icon btn-sm ml-auto md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/70 bg-background/95 p-4 backdrop-blur-xl md:hidden">
          <div className="stack gap-2">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`btn btn-ghost justify-start rounded-xl ${
                    active ? "bg-muted text-foreground" : ""
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}

            <div className="my-1 h-px bg-border/70" />

            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="btn btn-secondary rounded-xl"
            >
              Log in
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setOpen(false)}
              className="btn btn-brand rounded-xl"
            >
              Start free <ArrowRight className="size-4" />
            </Link>

            <div className="mt-2 flex items-center justify-between rounded-xl border border-border/70 bg-muted/35 px-3 py-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <BrandMark size={14} className="text-brand-strong" />
                Appearance
              </span>
              <ThemeToggle inline />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}