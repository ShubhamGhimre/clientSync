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
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-5 px-4 sm:px-6">
        <Logo />

        <nav
          className="ml-2 hidden items-center gap-1 rounded-full border border-border bg-muted/50 p-1 md:flex"
          aria-label="Main"
        >
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-card text-foreground shadow-xs ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ThemeToggle inline />
          <div className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
          <Link
            href="/auth/login"
            className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            href="/auth/register"
            className="group inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90"
          >
            Start free
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          type="button"
          className="ml-auto inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-card p-3.5 shadow-soft md:hidden">
          <div className="flex flex-col gap-1.5">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`flex h-9 items-center rounded-lg px-3 text-xs font-medium transition-colors ${
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}

            <div className="my-1.5 h-px bg-border" />

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-secondary px-3 text-xs font-medium text-secondary-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90"
              >
                Start free
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="mt-1.5 flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <BrandMark size={14} className="text-primary" />
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