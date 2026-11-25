import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  Check,
  Headset,
  Layers,
} from "lucide-react";
import { BrandMark } from "@/components/logo";

export const metadata: Metadata = {
  title: "Features | ClientSync",
  description:
    "Knowledge-base chatbots, human handoff, analytics and multi-tenant workspaces.",
};

const groups = [
  {
    icon: BookOpenText,
    tag: "Knowledge engine",
    title: "A chatbot that knows your business",
    text: "Train on what you already have. No scripts or decision trees to maintain.",
    points: [
      "Upload PDFs, DOCX and text files",
      "Crawl your help center or website",
      "Citations on every answer",
      "Answers stay within your documents",
    ],
  },
  {
    icon: Headset,
    tag: "Unified inbox",
    title: "Your team stays in control",
    text: "The bot handles the routine. People handle everything else.",
    points: [
      "Shared inbox for live and escalated chats",
      "Automatic handoff when confidence is low",
      "Full conversation history for every customer",
      "Agent replies look different from AI replies",
    ],
  },
  {
    icon: BarChart3,
    tag: "Insights",
    title: "Learn from every conversation",
    text: "Know which questions your docs can't answer yet.",
    points: [
      "Unanswered-question report",
      "Topic and volume trends",
      "Resolution rate per chatbot",
      "Export conversations as CSV",
    ],
  },
  {
    icon: Layers,
    tag: "Multi-tenant",
    title: "Made for agencies and multi-brand teams",
    text: "Run many clients from one account without mixing data.",
    points: [
      "Isolated workspaces with their own subdomain",
      "Brand colors, logo and welcome message per bot",
      "Role-based access for your team",
      "One embeddable script for any site",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-[0.14] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <BrandMark
          size={400}
          className="pointer-events-none absolute -top-24 left-[6%] text-foreground opacity-[0.03]"
          aria-hidden="true"
        />

        <div className="page-narrow relative stack gap-5 py-20 text-center">
          <span className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-background/85 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-2xs backdrop-blur-xs">
            <BrandMark size={14} className="shrink-0 text-brand-strong" />
            <span>Platform features</span>
          </span>

          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            Everything you need to{" "}
            <span className="gradient-text">automate support</span>
          </h1>

          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            From your first uploaded document to a full support inbox,
            ClientSync covers the whole loop.
          </p>
        </div>
      </section>

      {/* FEATURE GROUPS */}
      <div className="page stack gap-16 py-20 lg:gap-24">
        {groups.map((g, i) => {
          const Icon = g.icon;
          return (
            <section
              key={g.title}
              className="grid items-center gap-8 md:grid-cols-2 md:gap-14"
            >
              <div className={`stack gap-4 ${i % 2 ? "md:order-2" : ""}`}>
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-brand-strong shadow-2xs">
                    <Icon className="size-4" />
                  </span>
                  <span className="rounded-full border border-border/70 bg-muted/35 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    0{i + 1} · {g.tag}
                  </span>
                </div>

                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {g.title}
                </h2>

                <p className="text-base leading-relaxed text-muted-foreground">
                  {g.text}
                </p>

                <Link
                  href="/auth/register"
                  className="group mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-strong hover:underline"
                >
                  Try it free
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div
                className={`relative overflow-hidden rounded-2xl border border-border/80 bg-background/95 p-6 shadow-2xs sm:p-7 ${
                  i % 2 ? "md:order-1" : ""
                }`}
              >
                <BrandMark
                  size={180}
                  className="pointer-events-none absolute -bottom-12 -right-10 text-foreground opacity-[0.03]"
                  aria-hidden="true"
                />

                <ul className="relative z-10 stack gap-3.5">
                  {g.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/25 px-3.5 py-2.5 text-sm text-foreground/90"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background text-brand-strong shadow-2xs">
                        <Check className="size-3" />
                      </span>
                      <span className="leading-snug">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}

        {/* CTA CARD */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-muted/55 via-background to-muted/35 px-8 py-14 text-center shadow-sm sm:px-14">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-70"
            style={{
              background:
                "radial-gradient(ellipse 65% 55% at 50% 0%, color-mix(in oklab, var(--brand-strong, currentColor) 14%, transparent), transparent)",
            }}
            aria-hidden="true"
          />
          <div className="dot-grid pointer-events-none absolute inset-0 opacity-[0.14]" />

          <BrandMark
            size={300}
            className="pointer-events-none absolute -bottom-20 -right-14 text-foreground opacity-[0.04]"
            aria-hidden="true"
          />

          <div className="relative z-10 stack items-center gap-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/90 px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-2xs">
              <BrandMark size={14} className="text-brand-strong" />
              Quick setup
            </span>

            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Ready to try it on your site?
            </h2>

            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Set up your first chatbot in minutes. No credit card, no
              commitment.
            </p>

            <div className="cluster justify-center gap-3">
              <Link
                href="/auth/register"
                className="btn btn-brand group inline-flex items-center gap-2 rounded-xl"
              >
                Start free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/pricing" className="btn btn-secondary rounded-xl">
                Compare plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}