'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Loader2, Mail, Lock, Eye, EyeOff, Building2, ArrowRight, X,
  MessageSquareText, Shield,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useLogin } from '@/hooks/api/useAuth';
import { getSubdomain, getAuthToken } from '@/lib/axios';
import { useAuthStore } from '@/store/auth-store';

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
    <div className="flex min-h-dvh">
      {/* ---------- Brand panel (desktop) ---------- */}
      <aside className="relative hidden w-[46%] overflow-hidden text-on-brand lg:flex">
        <div className="absolute inset-0 brand-gradient-alt" />
        <div className="hero-glow" />

        <div className="relative z-10 flex w-full flex-col justify-between px-12 py-12">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-on-brand/20 backdrop-blur-sm">
              <Building2 className="size-5 shrink-0" />
            </span>
            <span className="text-lg font-semibold">ClientSync</span>
          </div>

          <div className="w-full max-w-md">
            <h2 className="max-w-md text-4xl font-semibold leading-tight">
              Welcome back
              {subdomain ? (
                <>
                  {' '}to <span className="capitalize">{subdomain}</span>
                </>
              ) : null}
            </h2>
            <p className="mt-4 text-lg text-on-brand/80">
              Pick up where you left off: open conversations, knowledge base updates, and your latest support metrics.
            </p>

            {/* Product preview built from the real chat classes */}
            <div className="flex flex-col gap-3 mt-8" aria-hidden="true">
              <div className="msg msg-bot">
                <span className="avatar avatar-sm avatar-ai">AI</span>
                <div className="msg-body">
                  <div className="msg-bubble">
                    12 conversations resolved overnight. 2 are waiting for a human reply.
                  </div>
                </div>
              </div>
              <div className="typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>

          <ul className="flex flex-col gap-3 text-sm text-on-brand/90">
            <li>
              <MessageSquareText className="size-4 shrink-0" />
              AI answers with sources from your own documents
            </li>
            <li>
              <Shield className="size-4 shrink-0" />
              Each workspace is isolated to its own subdomain
            </li>
          </ul>
        </div>
      </aside>

      {/* ---------- Form panel ---------- */}
      <main className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-strong text-on-brand">
              <Building2 className="size-5 shrink-0" />
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-semibold">ClientSync</span>
              {subdomain && (
                <span className="text-sm capitalize text-muted-foreground">{subdomain}</span>
              )}
            </div>
          </div>

          <div className="surface shadow-soft">
            <div className="px-6 pb-2 pt-6 text-center sm:px-8 sm:pt-8">
              <h1 className="text-2xl font-semibold">Sign in</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your credentials to open your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4 px-6 py-6 sm:px-8">
                {errorMessage && (
                  <div role="alert" className="callout callout-danger">
                    <X className="space-t-0.5 size-4 shrink-0 text-destructive" />
                    <span className="text-destructive">{errorMessage}</span>
                  </div>
                )}

                <div className="field">
                  <label htmlFor="email" className="label">Email address</label>
                  <div className="input-wrap">
                    <Mail className="input-icon" />
                    <input
                      id="email"
                      type="email"
                      className="input"
                      placeholder="you@company.com"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="password" className="label">Password</label>
                  <div className="input-wrap has-action">
                    <Lock className="input-icon" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="input"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={isPending}
                    />
                    <button
                      type="button"
                      className="input-action"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      disabled={isPending}
                    >
                      {showPassword ? <EyeOff className="size-4 shrink-0" /> : <Eye className="size-4 shrink-0" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="remember" className="flex items-center cursor-pointer gap-2 text-sm text-muted-foreground">
                    <Checkbox
                      id="remember"
                      checked={formData.remember}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, remember: checked === true }))
                      }
                      disabled={isPending}
                    />
                    Remember me
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-brand-strong hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-border px-6 py-6 sm:px-8">
                <button type="submit" className="btn btn-brand btn-lg w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/register" className="font-medium text-brand-strong hover:underline">
                    Create one
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link href="/privacy" className="underline underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}