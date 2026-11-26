'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  X,
  Shield,
  Check,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { BrandMark, Logo } from '@/components/logo';
import { useLogin } from '@/hooks/api/useAuth';
import { getSubdomain, getAuthToken } from '@/lib/axios';
import { useAuthStore } from '@/store/auth-store';

const inputClass =
  'auth-input w-full rounded-xl border border-input bg-background pl-10 pr-11 text-sm text-foreground shadow-xs outline-none transition-all placeholder:text-muted-foreground/80 hover:border-foreground/20 focus:border-primary focus:ring-[3px] focus:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50';

const iconClass =
  'pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const { mutate: login, isPending, error } = useLogin();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();

    if (token && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(formData);
  };

  const subdomain = getSubdomain();
  const errorMessage = (error as { message?: string } | null)?.message;

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* ---------- LEFT BRAND PANEL: SLICK & MINIMAL ---------- */}
      <aside className="relative hidden w-[48%] overflow-hidden border-r border-border bg-secondary/35 text-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(75% 55% at 50% 0%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 70%), radial-gradient(55% 50% at 10% 95%, color-mix(in oklab, var(--chart-2) 9%, transparent), transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-55"
          style={{
            backgroundImage:
              'radial-gradient(color-mix(in oklab, var(--foreground) 12%, transparent) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
          aria-hidden="true"
        />

        <BrandMark
          size={420}
          className="pointer-events-none absolute -bottom-24 -right-20 text-primary opacity-[0.04]"
          aria-hidden="true"
        />

        <div className="relative z-10 flex w-full flex-col justify-between px-10 py-10 xl:px-16 xl:py-14">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <Logo nameClassName="inline" />

            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium tracking-wide text-primary shadow-xs">
              <span className="size-1.5 rounded-full bg-primary" />
              {subdomain ? (
                <span className="capitalize">{subdomain} workspace</span>
              ) : (
                'Workspace ready'
              )}
            </span>
          </div>

          {/* Center welcome + slick status card */}
          <div className="my-auto max-w-lg space-y-6 py-4">
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold leading-[1.12] tracking-tight text-foreground xl:text-[2.75rem]">
                Welcome back
                {subdomain ? (
                  <>
                    ,<br />
                    <span className="capitalize text-primary">
                      {subdomain}
                    </span>
                  </>
                ) : null}
              </h2>

              <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
                Pick up where you left off: open conversations, knowledge base
                updates, and your latest support metrics.
              </p>
            </div>

            {/* Sleek workspace snapshot */}
            <div
              className="relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-soft"
              aria-hidden="true"
            >
              {/* Top brand hairline accent */}
              <div
                className="pointer-events-none absolute inset-x-8 top-0 h-[2px] rounded-full opacity-80"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, var(--chart-1), var(--chart-2), transparent)',
                }}
              />

              <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                    <BrandMark size={12} />
                  </span>
                  <span className="text-[11px] font-medium text-foreground">
                    Overnight digest
                  </span>
                </div>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  Live sync
                </span>
              </div>

              <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex items-start gap-2.5 text-[13px]">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                    <BrandMark size={13} />
                  </span>
                  <p className="rounded-2xl rounded-tl-sm border border-border bg-secondary/50 px-3.5 py-2.5 leading-relaxed text-foreground">
                    12 conversations resolved overnight. 2 are waiting for a
                    human reply.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5 sm:flex-col sm:items-start sm:gap-1 sm:py-3">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Zap className="size-3.5" />
                    <span className="tabular text-lg font-semibold leading-none text-foreground">
                      94%
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Resolution rate
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom highlights */}
          <div className="grid gap-2.5 border-t border-border pt-5">
            <div className="flex items-center gap-3 rounded-xl border border-transparent px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:border-border hover:bg-card/80 hover:text-foreground">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-xs">
                <Check className="size-3.5" />
              </span>
              <span>AI answers with sources from your own documents</span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-transparent px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:border-border hover:bg-card/80 hover:text-foreground">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-xs">
                <Shield className="size-3.5" />
              </span>
              <span>Each workspace is isolated to its own subdomain</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------- RIGHT LOGIN PANEL: MINIMAL ---------- */}
      <main className="auth-form-bg relative flex min-h-dvh flex-1 items-center justify-center px-4 py-6 sm:px-8 lg:px-10 xl:px-14">
        <div className="relative z-10 w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="mb-6 flex justify-center lg:hidden">
            <Logo nameClassName="inline" />
          </div>

          {/* Login card */}
          <div className="auth-panel !rounded-2xl !p-5 sm:!p-8">
            {/* Header */}
            <div className="mb-7">
              <div className="mb-5 flex items-center justify-between">
                <Logo />

                <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                  <Sparkles className="size-3 text-primary" />
                  Secure access
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Welcome back
              </h1>

              <p className="mt-1.5 text-sm text-muted-foreground">
                Sign in to continue to your workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* LOGIN ERROR */}
                {errorMessage && (
                  <div
                    role="alert"
                    className="flex items-center gap-2.5 rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    <X className="size-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* EMAIL */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-[13px] font-semibold text-foreground"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className={iconClass} />

                    <input
                      id="email"
                      type="email"
                      className={inputClass}
                      placeholder="you@company.com"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="password"
                      className="text-[13px] font-semibold text-foreground"
                    >
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-primary transition-colors hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <Lock className={iconClass} />

                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className={inputClass}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                      disabled={isPending}
                    />

                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      disabled={isPending}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* REMEMBER ME */}
                <label
                  htmlFor="remember"
                  className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-muted-foreground"
                >
                  <Checkbox
                    id="remember"
                    checked={formData.remember}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        remember: checked === true,
                      }))
                    }
                    disabled={isPending}
                  />

                  Keep me signed in
                </label>

                {/* SIGN IN */}
                <button
                  type="submit"
                  className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                {/* REGISTER LINK */}
                <div className="auth-divider py-1">New to ClientSync?</div>

                <Link
                  href="/auth/register"
                  className="flex h-11 w-full items-center justify-center rounded-xl border border-border bg-secondary px-5 text-sm font-semibold text-secondary-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Create an account
                </Link>
              </div>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <Shield className="size-3.5 shrink-0 text-primary" />
            Secure sign in
            <span className="text-border">·</span>
            <Link
              href="/privacy"
              className="underline underline-offset-2 transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}