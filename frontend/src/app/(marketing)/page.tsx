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
    <div className="relative flex h-[30rem] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-lift">
      {/* Top brand hairline accent */}
      <div
        className="pointer-events-none absolute inset-x-8 top-0 z-10 h-[2px] rounded-full opacity-80"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--chart-1), var(--chart-2), transparent)",
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-secondary/40 px-4 py-3">
        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary shadow-xs">
          <BrandMark size={18} />
          <span
            className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-2 ring-card"
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

        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
          <BrandMark size={11} className="text-primary" />
          AI
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 text-[13px]">
        <div className="my-0.5 flex items-center justify-center">
          <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Today
          </span>
        </div>

        {/* Bot Greeting */}
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <BrandMark size={13} />
          </span>
          <div className="max-w-[82%] rounded-2xl rounded-tl-sm border border-border bg-secondary/60 px-3.5 py-2.5 leading-relaxed text-foreground">
            Hi! Ask me anything about Acme orders, shipping or returns.
          </div>
        </div>

        {/* User Question */}
        <div className="flex justify-end">
          <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 leading-relaxed text-primary-foreground shadow-xs">
            Can I return an item after 30 days?
          </div>
        </div>

        {/* Bot Answer + Sources */}
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <BrandMark size={13} />
          </span>
          <div className="min-w-0 max-w-[84%] space-y-2">
            <div className="rounded-2xl rounded-tl-sm border border-border bg-secondary/60 px-3.5 py-2.5 leading-relaxed text-foreground">
              Returns are accepted within 45 days of delivery if the item is
              unused. Refunds go back to your original payment method in 5–7
              days.
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground shadow-xs">
                <FileText className="size-3 text-primary" />
                Returns policy
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground shadow-xs">
                <FileText className="size-3 text-primary" />
                Refund FAQ
              </span>
            </div>
          </div>
        </div>

        {/* Typing Indicator */}
        <div className="flex items-center gap-2.5">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <BrandMark size={13} />
          </span>
          <div className="inline-flex items-center gap-1 rounded-2xl rounded-tl-sm border border-border bg-secondary/60 px-3 py-2.5">
            <span className="size-1.5 animate-pulse rounded-full bg-primary/70" />
            <span className="size-1.5 animate-pulse rounded-full bg-primary/70 [animation-delay:150ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-primary/70 [animation-delay:300ms]" />
          </div>
        </div>
      </div>

      {/* Quick Replies */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border bg-secondary/35 px-4 py-2">
        <span className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-xs">
          Start a return
        </span>
        <span className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-xs">
          Talk to a person
        </span>
      </div>

      {/* Composer */}
      <div className="flex items-center gap-2 border-t border-border bg-card p-3">
        <input
          className="h-9 min-w-0 flex-1 rounded-xl border border-input bg-secondary/45 px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground"
          placeholder="Type your question..."
          disabled
          aria-label="Demo message input"
        />
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs"
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
      <section className="relative overflow-hidden border-b border-border bg-background">
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
              "radial-gradient(60% 55% at 75% 15%, color-mix(in oklab, var(--primary) 11%, transparent), transparent 70%), radial-gradient(45% 50% at 15% 85%, color-mix(in oklab, var(--chart-2) 8%, transparent), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <BrandMark
          size={420}
          className="pointer-events-none absolute -top-24 right-[6%] text-primary opacity-[0.04]"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary shadow-xs">
              <BrandMark size={14} className="shrink-0 text-primary" />
              <span>AI support, grounded in your docs</span>
            </span>

            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.75rem]">
              Support that{" "}
              <span className="bg-gradient-to-r from-primary via-chart-3 to-chart-2 bg-clip-text text-transparent">
                knows your business
              </span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              ClientSync trains an AI chatbot on your documentation, answers
              customers on your website, and hands the conversation to your team
              when it can&apos;t.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/auth/register"
                className="group inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
              >
                Start free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:border-primary/30 hover:text-primary"
              >
                See pricing
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {["JD", "MK", "AR"].map((initials) => (
                  <span
                    key={initials}
                    className="inline-flex size-7 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-[11px] font-semibold text-primary ring-2 ring-background"
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <span>No credit card. Live in about five minutes.</span>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <ChatDemo />

            <div className="absolute -bottom-4 -left-3 hidden items-center gap-3 rounded-2xl border border-border bg-card px-4 py-2.5 text-card-foreground shadow-soft sm:flex lg:-left-6">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
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
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 divide-y divide-border px-4 py-6 sm:divide-y-0 sm:px-6 md:grid-cols-4 md:divide-x">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-2.5 text-center">
              <p className="tabular text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
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
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6">
        <div className="flex max-w-2xl flex-col gap-2.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Zap className="size-3.5 shrink-0 text-primary" />
            The whole loop
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything between a question and a resolved ticket
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Set it up in an afternoon, then let it handle the repeat questions.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-xs transition-all hover:border-primary/30 hover:shadow-soft"
            >
              <div className="flex flex-col gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary">
                  <Icon className="size-4" />
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
      <section className="relative overflow-hidden border-y border-border bg-secondary/35 py-16">
        <BrandMark
          size={340}
          className="pointer-events-none absolute -bottom-24 right-8 text-primary opacity-[0.04]"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6">
          <div className="flex max-w-2xl flex-col gap-2.5">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary shadow-xs">
              <Sparkles className="size-3.5 shrink-0 text-primary" />
              Simple by design
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Live in three steps
            </h2>
          </div>

          <ol className="grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-xs"
              >
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      <s.icon className="size-4" />
                    </span>
                    <span className="tabular rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
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
                  <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-foreground p-3 font-mono text-xs text-background">
                    <code>{s.code}</code>
                  </pre>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PRICING */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-2.5 text-center">
          <span className="mx-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <BarChart3 className="size-3.5 shrink-0 text-primary" />
            Pricing
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Simple pricing that scales with you
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Start free. Upgrade when your customers start asking more.
          </p>
        </div>
        <PricingPlans />
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-12 text-center text-card-foreground shadow-lift sm:px-12 sm:py-14">
          {/* Top brand hairline accent */}
          <div
            className="pointer-events-none absolute inset-x-12 top-0 h-[2px] rounded-full opacity-85"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--chart-1), var(--chart-2), transparent)",
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(65% 55% at 50% 0%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 70%), radial-gradient(50% 50% at 85% 100%, color-mix(in oklab, var(--chart-2) 9%, transparent), transparent 70%)",
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(color-mix(in oklab, var(--foreground) 12%, transparent) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
            aria-hidden="true"
          />

          <BrandMark
            size={320}
            className="pointer-events-none absolute -bottom-24 -right-16 text-primary opacity-[0.05]"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center gap-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary shadow-xs">
              <BrandMark size={14} className="text-primary" />
              Ready when you are
            </span>

            <h2 className="mx-auto max-w-2xl text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Give your customers an answer before they open a ticket
            </h2>

            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Join teams that turn their documentation into always-on support.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/auth/register"
                className="group inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
              >
                Start free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:border-primary/30 hover:text-primary"
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