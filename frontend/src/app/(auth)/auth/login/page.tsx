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
    <div className="auth-shell">
      {/* ---------- Brand panel (desktop) ---------- */}
      <aside className="auth-brand">
        <div className="inset-fill brand-gradient-alt" />
        <div className="hero-glow" />

        <div className="auth-brand-inner">
          <div className="auth-logo">
            <span className="auth-logo-mark auth-logo-ghost">
              <Building2 className="ico-lg" />
            </span>
            <span className="t-lg t-semibold">ClientSync</span>
          </div>

          <div className="auth-form-wrap">
            <h2 className="auth-title">
              Welcome back
              {subdomain ? (
                <>
                  {' '}to <span className="capitalize-label">{subdomain}</span>
                </>
              ) : null}
            </h2>
            <p className="auth-lead">
              Pick up where you left off: open conversations, knowledge base updates, and your latest support metrics.
            </p>

            {/* Product preview built from the real chat classes */}
            <div className="col g-3 space-t-8" aria-hidden="true">
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

          <ul className="auth-feature-list">
            <li>
              <MessageSquareText className="ico" />
              AI answers with sources from your own documents
            </li>
            <li>
              <Shield className="ico" />
              Each workspace is isolated to its own subdomain
            </li>
          </ul>
        </div>
      </aside>

      {/* ---------- Form panel ---------- */}
      <main className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-logo">
            <span className="auth-logo-mark auth-logo-solid">
              <Building2 className="ico-lg" />
            </span>
            <div className="col">
              <span className="t-xl t-semibold">ClientSync</span>
              {subdomain && (
                <span className="t-sm capitalize-label t-muted">{subdomain}</span>
              )}
            </div>
          </div>

          <div className="surface-raised">
            <div className="auth-card-head">
              <h1 className="t-2xl t-semibold">Sign in</h1>
              <p className="auth-card-sub">
                Enter your credentials to open your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="auth-card-body">
                {errorMessage && (
                  <div role="alert" className="callout callout-danger">
                    <X className="space-t-0.5 ico t-danger" />
                    <span className="t-danger">{errorMessage}</span>
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
                      {showPassword ? <EyeOff className="ico" /> : <Eye className="ico" />}
                    </button>
                  </div>
                </div>

                <div className="row-between">
                  <label htmlFor="remember" className="row pointer g-2 t-sm t-muted">
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
                    className="t-sm t-medium t-brand t-hover-underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="auth-card-foot">
                <button type="submit" className="btn btn-brand btn-lg full-w" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight />
                    </>
                  )}
                </button>

                <p className="align-center t-sm t-muted">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/register" className="t-medium t-brand t-hover-underline">
                    Create one
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <p className="auth-legal">
            <Link href="/privacy" className="t-underline t-hover-underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}