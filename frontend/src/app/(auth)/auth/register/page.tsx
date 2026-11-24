'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Loader2, Mail, Lock, User, Building, Check, X, Eye, EyeOff,
  ArrowRight, Sparkles, MessageSquareText, BookOpen, BarChart3, Building2,
} from 'lucide-react';
import { useRegister, useCheckSubdomain } from '@/hooks/api/useAuth';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
  subdomain: string;
};

type SubdomainStatus = 'idle' | 'checking' | 'available' | 'unavailable';

/* Small wrapper so every field gets the same label / error markup */
function Field({
  id, label, error, hint, children,
}: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="field-error flex items-center gap-1">
          <X className="size-3 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint">{hint}</p>
      ) : null}
    </div>
  );
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    subdomain: '',
  });
  const [subdomainStatus, setSubdomainStatus] = useState<SubdomainStatus>('idle');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { mutate: register, isPending, error } = useRegister();
  const { mutate: checkSubdomain } = useCheckSubdomain();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Please enter your full name';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.organizationName.trim()) {
      errors.organizationName = 'Organization name is required';
    } else if (formData.organizationName.trim().length < 2) {
      errors.organizationName = 'Organization name must be at least 2 characters';
    }

    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
    if (!formData.subdomain) {
      errors.subdomain = 'Subdomain is required';
    } else if (!subdomainRegex.test(formData.subdomain)) {
      errors.subdomain = 'Use lowercase letters, numbers, and hyphens only';
    } else if (formData.subdomain.length < 3) {
      errors.subdomain = 'Subdomain must be at least 3 characters';
    } else if (subdomainStatus !== 'available') {
      errors.subdomain = 'Please choose an available subdomain';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (formData.subdomain.length >= 3) {
      setSubdomainStatus('checking');

      const timer = setTimeout(() => {
        checkSubdomain(formData.subdomain, {
          onSuccess: (data) => {
            setSubdomainStatus(data.available ? 'available' : 'unavailable');
          },
          onError: (err) => {
            console.error('Subdomain check error:', err);
            setSubdomainStatus('unavailable');
          },
        });
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setSubdomainStatus('idle');
    }
  }, [formData.subdomain, checkSubdomain]);

  /* One handler for every field. Also removes that field's error key
     (the old version left an empty-string key behind, which kept
     Object.keys(formErrors).length > 0 and the submit button disabled). */
  const setField = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const [firstName, ...rest] = formData.name.trim().split(' ');
    const lastName = rest.join(' ') || '';
    register({
      firstName,
      lastName,
      contactEmail: formData.email,
      password: formData.password,
      companyName: formData.organizationName,
      email: formData.email,
      subdomain: formData.subdomain,
    });
  };

  const isFormValid =
    formData.name.trim() &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.organizationName.trim() &&
    formData.subdomain &&
    formData.password === formData.confirmPassword &&
    formData.password.length >= 6 &&
    subdomainStatus === 'available' &&
    Object.keys(formErrors).length === 0;

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
              Answer customers instantly, from your own knowledge base
            </h2>
            <p className="mt-4 text-lg text-on-brand/80">
              Train an AI assistant on your docs, put it on your site, and hand off to your team when it matters.
            </p>

            {/* Product preview: uses the real chat classes */}
            <div className="flex flex-col gap-3 mt-8" aria-hidden="true">
              <div className="msg msg-user">
                  <div className="msg-body">
                   <div className="msg-bubble text-on-brand">
                     How do I change my billing email?
                  </div>
                </div>
              </div>
              <div className="msg msg-bot">
                <span className="avatar avatar-sm avatar-ai">AI</span>
                <div className="msg-body">
                  <div className="msg-bubble">
                    Go to Settings → Billing and edit the contact email. Changes apply to your next invoice.
                  </div>
                  <div className="source-list">
                    <span className="source-chip">Billing guide.pdf</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ul className="flex flex-col gap-3 text-sm text-on-brand/90">
            <li>
              <MessageSquareText className="size-4 shrink-0" />
              Embeddable chat widget with human handoff
            </li>
            <li>
              <BookOpen className="size-4 shrink-0" />
              Upload PDFs, DOCX, TXT and CSV files
            </li>
            <li>
              <BarChart3 className="size-4 shrink-0" />
              Track resolution rate and satisfaction
            </li>
          </ul>
        </div>
      </aside>

      {/* ---------- Form panel ---------- */}
      <main className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-strong text-on-brand">
              <Building2 className="size-5 shrink-0" />
            </span>
            <span className="text-xl font-semibold">ClientSync</span>
          </div>

          <div className="surface shadow-soft">
            <div className="px-6 pb-2 pt-6 text-center sm:px-8 sm:pt-8">
              <h1 className="flex items-center justify-center gap-2 text-2xl font-semibold">
                <Sparkles className="size-5 shrink-0 text-brand-strong" />
                Create your account
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up your AI support assistant in a few minutes
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col gap-4 px-6 py-6 sm:px-8">
                {error && (
                  <div role="alert" className="callout callout-danger">
                    <X className="space-t-0.5 size-4 shrink-0 text-destructive" />
                    <span className="text-destructive">
                      {(error as { message?: string })?.message}
                    </span>
                  </div>
                )}

                {/* Personal */}
                <fieldset className="stack">
                  <legend className="mb-1 flex items-center gap-2 text-sm font-medium">
                    <User className="size-4 shrink-0 text-brand-strong" />
                    Personal information
                  </legend>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field id="name" label="Full name" error={formErrors.name}>
                      <div className="input-wrap">
                        <User className="input-icon" />
                        <input
                          id="name"
                          className="input"
                          placeholder="John Doe"
                          autoComplete="name"
                          value={formData.name}
                          onChange={(e) => setField('name', e.target.value)}
                          aria-invalid={!!formErrors.name}
                          disabled={isPending}
                        />
                      </div>
                    </Field>

                    <Field id="email" label="Work email" error={formErrors.email}>
                      <div className="input-wrap">
                        <Mail className="input-icon" />
                        <input
                          id="email"
                          type="email"
                          className="input"
                          placeholder="john@company.com"
                          autoComplete="email"
                          value={formData.email}
                          onChange={(e) => setField('email', e.target.value)}
                          aria-invalid={!!formErrors.email}
                          disabled={isPending}
                        />
                      </div>
                    </Field>
                  </div>
                </fieldset>

                {/* Organization */}
                <fieldset className="stack">
                  <legend className="mb-1 flex items-center gap-2 text-sm font-medium">
                    <Building className="size-4 shrink-0 text-brand-strong" />
                    Organization
                  </legend>

                  <Field id="organizationName" label="Organization name" error={formErrors.organizationName}>
                    <div className="input-wrap">
                      <Building className="input-icon" />
                      <input
                        id="organizationName"
                        className="input"
                        placeholder="Acme Corporation"
                        autoComplete="organization"
                        value={formData.organizationName}
                        onChange={(e) => setField('organizationName', e.target.value)}
                        aria-invalid={!!formErrors.organizationName}
                        disabled={isPending}
                      />
                    </div>
                  </Field>

                  <Field
                    id="subdomain"
                    label="Your workspace address"
                    error={formErrors.subdomain}
                    hint="Customers and your team will use this to reach your workspace."
                  >
                    <div className={`input-group ${formErrors.subdomain ? 'is-invalid' : ''}`}>
                      <input
                        id="subdomain"
                        className="input"
                        placeholder="acme"
                        autoComplete="off"
                        value={formData.subdomain}
                        onChange={(e) =>
                          setField('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                        }
                        disabled={isPending}
                      />
                      <span className="input-addon">.clientsync.com</span>
                    </div>

                    {formData.subdomain && (
                      <div className="mt-1 flex items-center gap-2" aria-live="polite">
                        {subdomainStatus === 'checking' && (
                          <>
                            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Checking availability…</span>
                          </>
                        )}
                        {subdomainStatus === 'available' && (
                          <span className="badge badge-success">
                            <Check className="size-3 shrink-0" />
                            Available
                          </span>
                        )}
                        {subdomainStatus === 'unavailable' && (
                          <span className="badge badge-danger">
                            <X className="size-3 shrink-0" />
                            Not available
                          </span>
                        )}
                      </div>
                    )}
                  </Field>
                </fieldset>

                {/* Security */}
                <fieldset className="stack">
                  <legend className="mb-1 flex items-center gap-2 text-sm font-medium">
                    <Lock className="size-4 shrink-0 text-brand-strong" />
                    Security
                  </legend>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field id="password" label="Password" error={formErrors.password}>
                      <div className="input-wrap has-action">
                        <Lock className="input-icon" />
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          className="input"
                          placeholder="At least 6 characters"
                          autoComplete="new-password"
                          value={formData.password}
                          onChange={(e) => setField('password', e.target.value)}
                          aria-invalid={!!formErrors.password}
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
                    </Field>

                    <Field id="confirmPassword" label="Confirm password" error={formErrors.confirmPassword}>
                      <div className="input-wrap has-action">
                        <Lock className="input-icon" />
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="input"
                          placeholder="Repeat password"
                          autoComplete="new-password"
                          value={formData.confirmPassword}
                          onChange={(e) => setField('confirmPassword', e.target.value)}
                          aria-invalid={!!formErrors.confirmPassword}
                          disabled={isPending}
                        />
                        <button
                          type="button"
                          className="input-action"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          disabled={isPending}
                        >
                          {showConfirmPassword ? <EyeOff className="size-4 shrink-0" /> : <Eye className="size-4 shrink-0" />}
                        </button>
                      </div>
                    </Field>
                  </div>
                </fieldset>
              </div>

              <div className="flex flex-col gap-4 border-t border-border px-6 py-6 sm:px-8">
                <button
                  type="submit"
                  className="btn btn-brand btn-lg w-full"
                  disabled={isPending || !isFormValid}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-medium text-brand-strong hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-2 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}