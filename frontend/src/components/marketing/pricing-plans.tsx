"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { BrandMark } from "@/components/logo";
import { plans } from "@/lib/marketing";

export function PricingPlans() {
  const [yearly, setYearly] = useState(true);

  return (
    <div className="flex flex-col gap-8">
      {/* Billing Toggle */}
      <div className="flex flex-col items-center gap-2.5">
        <div
          className="inline-flex items-center rounded-full border border-border bg-muted/50 p-1 shadow-xs"
          role="tablist"
          aria-label="Billing period"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!yearly}
            onClick={() => setYearly(false)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              !yearly
                ? "bg-card text-foreground shadow-xs ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={yearly}
            onClick={() => setYearly(true)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              yearly
                ? "bg-card text-foreground shadow-xs ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Yearly</span>
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-primary">
              -17%
            </span>
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          {yearly
            ? "Billed annually — save 17% compared to monthly billing."
            : "Switch to yearly billing to save 17%."}
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((p) => {
          const price = yearly ? p.yearly : p.monthly;

          return (
            <div
              key={p.id}
              className={`group relative isolate flex flex-col overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${
                p.featured
                  ? "z-10 border-primary/50 bg-card shadow-lift ring-1 ring-primary/20"
                  : "border-border bg-card shadow-xs hover:border-ring/50 hover:shadow-soft"
              }`}
              style={
                p.featured
                  ? {
                      background:
                        "radial-gradient(80% 55% at 50% 0%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 70%), var(--card)",
                    }
                  : undefined
              }
            >
              {p.featured && (
                <BrandMark
                  size={150}
                  className="pointer-events-none absolute -bottom-10 -right-10 text-foreground opacity-[0.035]"
                  aria-hidden="true"
                />
              )}

              {/* Plan Header */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {p.name}
                </h3>

                {p.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-background px-2.5 py-0.5 text-[11px] font-medium text-primary shadow-xs">
                    <BrandMark size={11} className="shrink-0" />
                    Most popular
                  </span>
                )}
              </div>

              <p className="relative z-10 mt-1.5 min-h-9 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {p.blurb}
              </p>

              {/* Price */}
              <div className="relative z-10 my-5 flex items-baseline gap-1.5">
                {price === null ? (
                  <span className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Custom
                  </span>
                ) : (
                  <>
                    <span className="tabular text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                      ${price}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      / month
                    </span>
                  </>
                )}
              </div>

              {/* CTA */}
              <Link
                href={p.href}
                className={`group/btn relative z-10 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-medium shadow-xs transition-all sm:text-sm ${
                  p.featured
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <span>{p.cta}</span>
                <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </Link>

              <div className="relative z-10 my-5 h-px w-full bg-border" />

              {/* Features List */}
              <ul className="relative z-10 flex flex-col gap-2.5 text-xs sm:text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full border shadow-xs ${
                        p.featured
                          ? "border-primary/35 bg-accent text-primary"
                          : "border-border bg-muted/60 text-foreground"
                      }`}
                    >
                      <Check className="size-3" />
                    </span>
                    <span className="leading-snug text-muted-foreground">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}