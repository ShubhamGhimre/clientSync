import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Minus, Plus } from "lucide-react";
import { BrandMark } from "@/components/logo";
import { PricingPlans } from "@/components/marketing/pricing-plans";

export const metadata: Metadata = {
  title: "Pricing | ClientSync",
  description: "Start free. Pay as your chatbot handles more conversations.",
};

type Cell = string | boolean;
const rows: [string, Cell, Cell, Cell][] = [
  ["Chatbots", "1", "3", "10"],
  ["AI replies / month", "100", "3,000", "20,000"],
  ["Documents", "5", "100", "Unlimited"],
  ["Website crawling", false, true, true],
  ["Human handoff inbox", false, true, true],
  ["Source citations", true, true, true],
  ["Remove ClientSync branding", false, true, true],
  ["Analytics", false, "Basic", "Advanced"],
  ["Team seats", "1", "2", "5"],
];

const faqs = [
  [
    "What counts as an AI reply?",
    "Each answer the chatbot sends counts as one reply. Messages from your team and visitor messages don't count.",
  ],
  [
    "What happens if I hit my reply limit?",
    "The widget switches to collecting the visitor's email so your team can follow up. You can upgrade at any time to turn the bot back on.",
  ],
  [
    "Can I change plans later?",
    "Yes. Upgrades apply immediately, and downgrades apply at the end of your billing period.",
  ],
  [
    "Is my data used to train other models?",
    "No. Your documents and conversations are only used to answer questions in your workspace.",
  ],
  [
    "Do you offer refunds?",
    "If you're not happy within the first 14 days of a paid plan, contact us and we'll refund you.",
  ],
];

function CellView({ v }: { v: Cell }) {
  if (v === true) {
    return (
      <span className="mx-auto inline-flex size-6 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
        <Check className="size-3.5" aria-label="Included" />
      </span>
    );
  }
  if (v === false) {
    return (
      <Minus
        className="mx-auto size-4 text-muted-foreground/60"
        aria-label="Not included"
      />
    );
  }
  return <span className="tabular font-medium text-foreground">{v}</span>;
}

export default function PricingPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        {/* Subtle dot pattern + brand radial glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]"
          style={{
            backgroundImage:
              "radial-gradient(color-mix(in oklab, var(--foreground) 12%, transparent) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 60% at 50% 0%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 70%), radial-gradient(40% 50% at 85% 20%, color-mix(in oklab, var(--chart-2) 8%, transparent), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <BrandMark
          size={400}
          className="pointer-events-none absolute -top-24 right-[6%] text-primary opacity-[0.04]"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-4xl flex-col gap-5 px-4 py-20 text-center sm:px-6">
          <span className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary shadow-xs backdrop-blur-xs">
            <BrandMark size={14} className="shrink-0 text-primary" />
            <span>Simple, transparent pricing</span>
          </span>

          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-6xl">
            Pricing that grows with{" "}
            <span className="bg-gradient-to-r from-primary via-chart-3 to-chart-2 bg-clip-text text-transparent">
              your support volume
            </span>
          </h1>

          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Every paid plan starts with a 14-day trial. No credit card needed
            to begin.
          </p>
        </div>
      </section>

      {/* PLANS */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <PricingPlans />
      </section>

      {/* COMPARISON TABLE */}
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pb-20 sm:px-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Compare plans
          </h2>
          <p className="text-sm text-muted-foreground">
            A closer look at what&apos;s included in every tier.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-soft">
          {/* Top brand hairline accent */}
          <div
            className="pointer-events-none absolute inset-x-8 top-0 h-[2px] rounded-full opacity-80"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--chart-1), var(--chart-2), transparent)",
            }}
            aria-hidden="true"
          />

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-center text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-4 text-left font-semibold text-foreground">
                    Feature
                  </th>
                  <th className="px-5 py-4">Free</th>
                  <th className="bg-primary/5 px-5 py-4 text-primary">Pro</th>
                  <th className="px-5 py-4">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {rows.map(([name, ...cells]) => (
                  <tr
                    key={name}
                    className="transition-colors hover:bg-secondary/35"
                  >
                    <td className="px-5 py-3.5 text-left font-medium text-foreground">
                      {name}
                    </td>
                    {cells.map((c, i) => (
                      <td
                        key={i}
                        className={`px-5 py-3.5 text-muted-foreground ${
                          i === 1 ? "bg-primary/[0.03]" : ""
                        }`}
                      >
                        <CellView v={c} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pb-24 sm:px-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Questions about billing
          </h2>
          <p className="text-sm text-muted-foreground">
            Everything you need to know before you start.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {faqs.map(([q, a]) => (
            <details
              key={q}
              className="group rounded-2xl border border-border bg-card px-5 py-4 text-card-foreground shadow-xs transition-colors hover:border-primary/30"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground">
                <span>{q}</span>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-all duration-200 group-open:rotate-45 group-open:border-primary/30 group-open:bg-primary/10 group-open:text-primary">
                  <Plus className="size-3.5" />
                </span>
              </summary>
              <p className="mt-3 border-t border-border/70 pt-3 text-sm leading-relaxed text-muted-foreground">
                {a}
              </p>
            </details>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/40 px-5 py-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <BrandMark size={15} className="shrink-0 text-primary" />
            Need custom volume or enterprise security?
          </span>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            Contact us
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </>
  );
}