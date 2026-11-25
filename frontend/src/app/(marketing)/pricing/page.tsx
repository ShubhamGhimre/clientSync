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
      <span className="mx-auto inline-flex size-6 items-center justify-center rounded-full border border-border/80 bg-muted/40 text-brand-strong">
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
  return <span className="font-medium text-foreground">{v}</span>;
}

export default function PricingPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-[0.14] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <BrandMark
          size={400}
          className="pointer-events-none absolute -top-24 right-[6%] text-foreground opacity-[0.03]"
          aria-hidden="true"
        />

        <div className="page-narrow relative stack gap-5 py-20 text-center">
          <span className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-background/85 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-2xs backdrop-blur-xs">
            <BrandMark size={14} className="shrink-0 text-brand-strong" />
            <span>Simple, transparent pricing</span>
          </span>

          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            Pricing that grows with{" "}
            <span className="gradient-text">your support volume</span>
          </h1>

          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Every paid plan starts with a 14-day trial. No credit card needed
            to begin.
          </p>
        </div>
      </section>

      {/* PLANS */}
      <section className="page py-16">
        <PricingPlans />
      </section>

      {/* COMPARISON TABLE */}
      <section className="page-narrow stack gap-6 pb-20">
        <div className="stack gap-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Compare plans
          </h2>
          <p className="text-sm text-muted-foreground">
            A closer look at what&apos;s included in every tier.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-center text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-muted/35 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-4 text-left font-semibold text-foreground">
                    Feature
                  </th>
                  <th className="px-5 py-4">Free</th>
                  <th className="px-5 py-4 text-brand-strong">Pro</th>
                  <th className="px-5 py-4">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map(([name, ...cells]) => (
                  <tr
                    key={name}
                    className="transition-colors hover:bg-muted/25"
                  >
                    <td className="px-5 py-3.5 text-left font-medium text-foreground/90">
                      {name}
                    </td>
                    {cells.map((c, i) => (
                      <td
                        key={i}
                        className={`px-5 py-3.5 text-muted-foreground ${
                          i === 1 ? "bg-muted/15" : ""
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
      <section className="page-narrow stack gap-6 pb-24">
        <div className="stack gap-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Questions about billing
          </h2>
          <p className="text-sm text-muted-foreground">
            Everything you need to know before you start.
          </p>
        </div>

        <div className="stack gap-2.5">
          {faqs.map(([q, a]) => (
            <details
              key={q}
              className="group rounded-2xl border border-border/80 bg-background/95 px-5 py-4 shadow-2xs transition-colors hover:border-foreground/15"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground">
                <span>{q}</span>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/40 text-muted-foreground transition-transform duration-200 group-open:rotate-45">
                  <Plus className="size-3.5" />
                </span>
              </summary>
              <p className="mt-3 border-t border-border/50 pt-3 text-sm leading-relaxed text-muted-foreground">
                {a}
              </p>
            </details>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <BrandMark size={15} className="shrink-0 text-brand-strong" />
            Need custom volume or enterprise security?
          </span>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-1 font-semibold text-brand-strong hover:underline"
          >
            Contact us
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </>
  );
}