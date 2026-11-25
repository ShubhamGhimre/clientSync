"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { BrandMark } from "@/components/logo";
import { plans } from "@/lib/marketing";

export function PricingPlans() {
  const [yearly, setYearly] = useState(true);

  return (
    <div className="stack gap-10">
      {/* Billing Toggle */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="inline-flex items-center rounded-full border border-border/80 bg-muted/40 p-1 shadow-2xs"
          role="tablist"
          aria-label="Billing period"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!yearly}
            onClick={() => setYearly(false)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              !yearly
                ? "bg-background text-foreground shadow-2xs ring-1 ring-border/70"
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
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              yearly
                ? "bg-background text-foreground shadow-2xs ring-1 ring-border/70"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Yearly</span>
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand-strong">
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
      <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((p) => {
          const price = yearly ? p.yearly : p.monthly;

          return (
            <div
              key={p.id}
              className={`group relative isolate flex flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-0.5 ${
                p.featured
                  ? "z-10 border-brand-strong/50 bg-gradient-to-b from-muted/45 via-background to-background shadow-md ring-1 ring-brand-strong/20"
                  : "border-border/80 bg-background/95 shadow-2xs hover:border-foreground/15 hover:shadow-sm"
              }`}
            >
              {p.featured && (
                <>
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-75"
                    style={{
                      background:
                        "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklab, var(--brand-strong, currentColor) 14%, transparent), transparent)",
                    }}
                    aria-hidden="true"
                  />
                  <BrandMark
                    size={160}
                    className="pointer-events-none absolute -bottom-10 -right-10 text-foreground opacity-[0.035]"
                    aria-hidden="true"
                  />
                </>
              )}

              {/* Plan Header */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {p.name}
                </h3>

                {p.featured && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-strong/25 bg-background/90 px-2.5 py-0.5 text-[11px] font-medium text-brand-strong shadow-2xs">
                    <BrandMark size={11} className="shrink-0" />
                    Most popular
                  </span>
                )}
              </div>

              <p className="relative z-10 mt-1.5 min-h-10 text-sm leading-relaxed text-muted-foreground">
                {p.blurb}
              </p>

              {/* Price */}
              <div className="relative z-10 my-6 flex items-baseline gap-1.5">
                {price === null ? (
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    Custom
                  </span>
                ) : (
                  <>
                    <span className="text-4xl font-semibold tabular-nums tracking-tight text-foreground">
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
                className={`btn group/btn relative z-10 inline-flex w-full items-center justify-center gap-1.5 rounded-xl text-sm font-semibold ${
                  p.featured ? "btn-brand" : "btn-secondary"
                }`}
              >
                <span>{p.cta}</span>
                <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
              </Link>

              <div className="relative z-10 my-6 h-px w-full bg-border/70" />

              {/* Features List */}
              <ul className="relative z-10 stack gap-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border shadow-2xs ${
                        p.featured
                          ? "border-brand-strong/30 bg-brand/10 text-brand-strong"
                          : "border-border/80 bg-muted/40 text-foreground/80"
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