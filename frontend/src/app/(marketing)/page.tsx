import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  Check,
  Code2,
  FileText,
  Headset,
  Layers,
  Send,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { BrandMark } from "@/components/logo";
import { PricingPlans } from "@/components/marketing/pricing-plans";

const features = [
  {
    icon: BookOpenText,
    title: "Answers from your docs",
    text: "Upload PDFs, paste text or crawl your help center. Every answer cites the page it came from.",
  },
  {
    icon: Headset,
    title: "Human handoff",
    text: "When the bot isn't sure, the chat lands in your inbox with the full history attached.",
  },
  {
    icon: Code2,
    title: "One-line install",
    text: "Paste a script tag. The widget matches your brand colors and works on any site.",
  },
  {
    icon: Layers,
    title: "Built for many clients",
    text: "Each workspace is isolated, with its own subdomain, bots, documents and team.",
  },
  {
    icon: BarChart3,
    title: "See what customers ask",
    text: "Find unanswered questions and missing docs, then fix them in a click.",
  },
  {
    icon: ShieldCheck,
    title: "Your data stays yours",
    text: "Documents are never used to train shared models, and you can delete them any time.",
  },
];

const steps = [
  {
    title: "Add your knowledge",
    text: "Upload documents or point ClientSync at your help center.",
    icon: BookOpenText,
  },
  {
    title: "Install the widget",
    text: "Copy one line of code into your site.",
    icon: Code2,
    code: '<script src="https://clientsync.com/widget.js" data-tenant="acme" async></script>',
  },
  {
    title: "Review conversations",
    text: "Take over chats in the inbox and improve answers as you go.",
    icon: Headset,
  },
];

const stats = [
  { value: "10s", label: "Average first reply" },
  { value: "24/7", label: "Always-on support" },
  { value: "100%", label: "Answers with sources" },
  { value: "5 min", label: "To go live" },
];

function ChatDemo() {
  return (
    <div className="flex h-[32rem] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-sm ring-1 ring-black/[0.02] dark:ring-white/[0.04]">
      {/* Minimal Header */}
      <div className="flex items-center gap-3 border-b border-border/70 bg-muted/30 px-4 py-3.5">
        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background text-brand-strong shadow-2xs">
          <BrandMark size={18} />
          <span
            className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background"
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-foreground">
            Acme Support
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            Online · Replies instantly
          </p>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground shadow-2xs">
          <BrandMark size={11} className="text-brand-strong" />
          AI
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-4 text-[13px]">
        <div className="my-0.5 flex items-center justify-center">
          <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Today
          </span>
        </div>

        {/* Bot Greeting */}
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted/50 text-foreground/85">
            <BrandMark size={13} />
          </span>
          <div className="max-w-[82%] rounded-2xl rounded-tl-xs border border-border/75 bg-muted/35 px-3.5 py-2.5 leading-relaxed text-foreground">
            Hi! Ask me anything about Acme orders, shipping or returns.
          </div>
        </div>

        {/* User Question */}
        <div className="flex justify-end">
          <div className="max-w-[82%] rounded-2xl rounded-tr-xs bg-foreground px-3.5 py-2.5 leading-relaxed text-background shadow-2xs">
            Can I return an item after 30 days?
          </div>
        </div>

        {/* Bot Answer + Sources */}
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted/50 text-foreground/85">
            <BrandMark size={13} />
          </span>
          <div className="min-w-0 max-w-[84%] space-y-2">
            <div className="rounded-2xl rounded-tl-xs border border-border/75 bg-muted/35 px-3.5 py-2.5 leading-relaxed text-foreground">
              Returns are accepted within 45 days of delivery if the item is
              unused. Refunds go back to your original payment method in 5–7
              days.
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-lg border border-border/75 bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground shadow-2xs">
                <FileText className="size-3 text-brand-strong" />
                Returns policy
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-border/75 bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground shadow-2xs">
                <FileText className="size-3 text-brand-strong" />
                Refund FAQ
              </span>
            </div>
          </div>
        </div>

        {/* Subtle Typing Indicator */}
        <div className="flex items-center gap-2.5">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted/50 text-foreground/85">
            <BrandMark size={13} />
          </span>
          <div className="inline-flex items-center gap-1 rounded-2xl rounded-tl-xs border border-border/75 bg-muted/35 px-3 py-2.5">
            <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60" />
            <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
          </div>
        </div>
      </div>

      {/* Quick Replies */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border/50 bg-muted/15 px-4 py-2.5">
        <span className="rounded-full border border-border/80 bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-2xs">
          Start a return
        </span>
        <span className="rounded-full border border-border/80 bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-2xs">
          Talk to a person
        </span>
      </div>

      {/* Composer */}
      <div className="flex items-center gap-2 border-t border-border/70 bg-background p-3">
        <input
          className="h-9 min-w-0 flex-1 rounded-xl border border-border/80 bg-muted/30 px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground/65"
          placeholder="Type your question..."
          disabled
          aria-label="Demo message input"
        />
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/50 text-muted-foreground"
          disabled
          aria-label="Send"
        >
          <Send className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-[0.14] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <BrandMark
          size={440}
          className="pointer-events-none absolute -top-24 right-[8%] text-foreground opacity-[0.03]"
          aria-hidden="true"
        />

        <div className="page relative grid items-center gap-14 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div className="stack gap-7">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-background/85 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-2xs backdrop-blur-xs">
              <BrandMark size={14} className="shrink-0 text-brand-strong" />
              <span>AI support, grounded in your docs</span>
            </span>

            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-[4rem]">
              Support that{" "}
              <span className="gradient-text">knows your business</span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              ClientSync trains an AI chatbot on your documentation, answers
              customers on your website, and hands the conversation to your team
              when it can&apos;t.
            </p>

            <div className="cluster gap-3">
              <Link
                href="/auth/register"
                className="btn btn-brand btn-lg group inline-flex items-center gap-2 rounded-xl"
              >
                Start free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/pricing"
                className="btn btn-secondary btn-lg rounded-xl"
              >
                See pricing
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-muted-foreground">
              <div className="avatar-stack">
                {["JD", "MK", "AR"].map((initials) => (
                  <span
                    key={initials}
                    className="avatar avatar-sm ring-2 ring-background"
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <span>No credit card. Live in about five minutes.</span>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div
              className="pointer-events-none absolute -inset-6 rounded-[2.5rem] opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--brand-strong, currentColor) 14%, transparent), transparent 70%)",
              }}
              aria-hidden="true"
            />
            <ChatDemo />

            <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-border/80 bg-background/95 px-4 py-3 shadow-md backdrop-blur-md sm:flex lg:-left-8">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/50 text-brand-strong">
                <Check className="size-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Answer verified
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Sourced from Returns policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border/70 bg-muted/25">
        <div className="page grid grid-cols-2 divide-y divide-border/60 py-8 sm:divide-y-0 md:grid-cols-4 md:divide-x">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-3 text-center">
              <p className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                {s.value}
              </p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="page stack gap-12 py-20">
        <div className="max-w-2xl stack gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Zap className="size-3.5 shrink-0 text-brand-strong" />
            The whole loop
          </span>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything between a question and a resolved ticket
          </h2>
          <p className="text-muted-foreground">
            Set it up in an afternoon, then let it handle the repeat questions.
          </p>
        </div>

        <div className="grid-auto">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-border/80 bg-background/90 p-6 shadow-2xs transition-all hover:border-foreground/15 hover:shadow-sm"
            >
              <div className="stack gap-3.5">
                <span className="flex size-10 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-foreground/85 transition-colors group-hover:border-brand-strong/30 group-hover:text-brand-strong">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-semibold tracking-tight text-foreground">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative overflow-hidden border-y border-border/70 bg-muted/25 py-20">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-[0.14]" />
        <BrandMark
          size={360}
          className="pointer-events-none absolute -bottom-24 right-8 text-foreground opacity-[0.03]"
          aria-hidden="true"
        />

        <div className="page relative stack gap-12">
          <div className="max-w-2xl stack gap-3">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/80 bg-background/85 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 shrink-0 text-brand-strong" />
              Simple by design
            </span>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Live in three steps
            </h2>
          </div>

          <ol className="grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="flex flex-col justify-between rounded-2xl border border-border/80 bg-background/95 p-6 shadow-2xs"
              >
                <div className="stack gap-4">
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-foreground/85">
                      <s.icon className="size-5" />
                    </span>
                    <span className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                      0{i + 1}
                    </span>
                  </div>

                  <h3 className="font-semibold tracking-tight text-foreground">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {s.text}
                  </p>
                </div>

                {s.code && (
                  <pre className="mt-4 overflow-x-auto rounded-xl border border-border/80 bg-foreground p-3 text-xs text-background">
                    <code>{s.code}</code>
                  </pre>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PRICING */}
      <section className="page stack gap-10 py-20">
        <div className="stack gap-3 text-center">
          <span className="mx-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            <BarChart3 className="size-3.5 shrink-0 text-brand-strong" />
            Pricing
          </span>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple pricing that scales with you
          </h2>
          <p className="text-muted-foreground">
            Start free. Upgrade when your customers start asking more.
          </p>
        </div>
        <PricingPlans />
      </section>

      {/* FINAL CTA */}
      <section className="page pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-muted/55 via-background to-muted/35 px-8 py-16 text-center shadow-sm sm:px-14">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-56 opacity-70"
            style={{
              background:
                "radial-gradient(ellipse 65% 55% at 50% 0%, color-mix(in oklab, var(--brand-strong, currentColor) 14%, transparent), transparent)",
            }}
            aria-hidden="true"
          />
          <div className="dot-grid pointer-events-none absolute inset-0 opacity-[0.14]" />

          <BrandMark
            size={340}
            className="pointer-events-none absolute -bottom-24 -right-16 text-foreground opacity-[0.04]"
            aria-hidden="true"
          />

          <div className="relative z-10 stack items-center gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/90 px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-2xs">
              <BrandMark size={14} className="text-brand-strong" />
              Ready when you are
            </span>

            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Give your customers an answer before they open a ticket
            </h2>

            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Join teams that turn their documentation into always-on support.
            </p>

            <div className="cluster justify-center gap-3">
              <Link
                href="/auth/register"
                className="btn btn-brand btn-lg group inline-flex items-center gap-2 rounded-xl"
              >
                Start free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contact"
                className="btn btn-secondary btn-lg rounded-xl"
              >
                Talk to sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}