'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Mail,
  Lock,
  User,
  Building,
  Check,
  X,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  BookOpen,
  BarChart3,
  MessageSquare,
  Globe,
  FileText,
} from 'lucide-react';
import { BrandMark, Logo } from '@/components/logo';
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

/* Shared field wrapper */
function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <label
        htmlFor={id}
        className="block text-[13px] font-semibold tracking-wide text-foreground"
      >
        {label}
      </label>

      {children}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-destructive"
        >
          <X className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/* Password strength */
function getStrength(pw: string) {
  let score = 0;

  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;

  const labels = ['Too short', 'Weak', 'Okay', 'Good', 'Strong'];

  return {
    score: pw ? score : 0,
    label: pw ? labels[score] : '',
  };
}

/* Reusable input styling */
const inputClass =
  'h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground/60 hover:border-foreground/20 focus:border-brand-strong focus:ring-[3px] focus:ring-brand-strong/10 disabled:cursor-not-allowed disabled:opacity-60';

const iconClass =
  'pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground';

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

  const [subdomainStatus, setSubdomainStatus] =
    useState<SubdomainStatus>('idle');

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
      errors.organizationName =
        'Organization name must be at least 2 characters';
    }

    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

    if (!formData.subdomain) {
      errors.subdomain = 'Subdomain is required';
    } else if (!subdomainRegex.test(formData.subdomain)) {
      errors.subdomain =
        'Use lowercase letters, numbers, and hyphens only';
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
            setSubdomainStatus(
              data.available ? 'available' : 'unavailable'
            );
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

  const strength = getStrength(formData.password);

  const passwordsMatch =
    !!formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  return (
    <div className="flex min-h-dvh">
      {/* ---------- LEFT BRAND PANEL: SLICK & MINIMAL ---------- */}
      <aside className="relative hidden w-[44%] overflow-hidden border-r border-border/80 bg-gradient-to-b from-muted/45 via-background to-muted/30 text-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse 75% 55% at 50% 0%, color-mix(in oklab, var(--brand-strong, currentColor) 12%, transparent), transparent)',
          }}
        />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-[0.12]" />

        <BrandMark
          size={420}
          className="pointer-events-none absolute -bottom-24 -right-20 text-foreground opacity-[0.04]"
        />

        <div className="sticky top-0 relative z-10 flex h-dvh w-full flex-col justify-between px-10 py-9 xl:px-14 xl:py-11">
          {/* Top brand header */}
          <div className="flex items-center justify-between">
            <Logo nameClassName="inline" />

            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3 py-1 text-[11px] font-medium tracking-wide text-muted-foreground shadow-2xs backdrop-blur-xs">
              <BrandMark size={13} className="shrink-0 text-brand-strong" />
              Knowledge-base AI workspace
            </span>
          </div>

          {/* Center headline + slick preview card */}
          <div className="my-auto max-w-md space-y-6 py-4">
            <div className="space-y-3">
              <h2 className="text-[2rem] font-semibold leading-[1.12] tracking-tight text-foreground xl:text-[2.45rem]">
                Answer customers instantly,{' '}
                <span className="text-muted-foreground">
                  from your own docs
                </span>
              </h2>

              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Train an assistant on your documentation, embed it on your site,
                and route complex threads to your team smoothly.
              </p>
            </div>

            {/* Sleek answer preview card */}
            <div
              className="overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-sm ring-1 ring-black/[0.02] dark:ring-white/[0.04]"
              aria-hidden="true"
            >
              <div className="flex items-center justify-between border-b border-border/70 bg-muted/35 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-md border border-border/80 bg-background">
                    <BrandMark size={12} />
                  </span>
                  <span className="text-[11px] font-medium text-foreground/85">
                    ClientSync Assistant
                  </span>
                </div>
                <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border/70">
                  Instant match
                </span>
              </div>

              <div className="space-y-3.5 p-4 text-[13px]">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-foreground px-3.5 py-2 text-background shadow-2xs">
                    How do I change my billing email?
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted/60">
                    <BrandMark size={13} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="rounded-2xl rounded-bl-sm border border-border/80 bg-muted/35 px-3.5 py-2.5 leading-relaxed text-foreground">
                      Go to{' '}
                      <span className="font-medium text-foreground">
                        Settings → Billing
                      </span>{' '}
                      and update the contact email. Changes take effect on your
                      next invoice.
                    </div>

                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      <FileText className="size-3 text-brand-strong" />
                      <span>Billing guide.pdf</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom feature strip */}
          <div className="grid gap-2.5 border-t border-border/70 pt-5">
            <div className="flex items-center gap-3 rounded-xl border border-transparent px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:border-border/60 hover:bg-background/70 hover:text-foreground">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background text-foreground/85 shadow-2xs">
                <MessageSquare className="size-3.5" />
              </span>
              <span>Embeddable chat widget with human handoff</span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-transparent px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:border-border/60 hover:bg-background/70 hover:text-foreground">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background text-foreground/85 shadow-2xs">
                <BookOpen className="size-3.5" />
              </span>
              <span>Upload PDFs, DOCX, TXT, and CSV files</span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-transparent px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:border-border/60 hover:bg-background/70 hover:text-foreground">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background text-foreground/85 shadow-2xs">
                <BarChart3 className="size-3.5" />
              </span>
              <span>Track resolution rate and customer satisfaction</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------- RIGHT FORM PANEL: MINIMAL ---------- */}
      <main className="auth-form-bg relative flex min-h-dvh flex-1 items-center justify-center px-4 py-5 sm:px-8 lg:px-10 xl:px-14">
        <div className="relative z-10 w-full max-w-[520px]">
          {/* Mobile logo */}
          <div className="mb-5 flex justify-center lg:hidden">
            <Logo nameClassName="inline" />
          </div>

          <div className="auth-panel !rounded-2xl !p-5 sm:!p-7">
            {/* Header */}
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <Logo />

                <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  <Sparkles className="size-3 text-brand-strong" />
                  Get started free
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight">
                Create your account
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Start building your workspace today.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">
                {/* API ERROR */}
                {error && (
                  <div
                    role="alert"
                    className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
                  >
                    <X className="size-4 shrink-0" />
                    {(error as { message?: string })?.message}
                  </div>
                )}

                {/* PERSONAL DETAILS */}
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    id="name"
                    label="Full name"
                    error={formErrors.name}
                  >
                    <div className="relative">
                      <User className={iconClass} />
                      <input
                        id="name"
                        className={inputClass}
                        placeholder="John Doe"
                        autoComplete="name"
                        value={formData.name}
                        onChange={(e) => setField('name', e.target.value)}
                        aria-invalid={!!formErrors.name}
                        disabled={isPending}
                      />
                    </div>
                  </Field>

                  <Field
                    id="email"
                    label="Work email"
                    error={formErrors.email}
                  >
                    <div className="relative">
                      <Mail className={iconClass} />
                      <input
                        id="email"
                        type="email"
                        className={inputClass}
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

                {/* ORGANIZATION */}
                <Field
                  id="organizationName"
                  label="Organization name"
                  error={formErrors.organizationName}
                >
                  <div className="relative">
                    <Building className={iconClass} />
                    <input
                      id="organizationName"
                      className={inputClass}
                      placeholder="Acme Corporation"
                      autoComplete="organization"
                      value={formData.organizationName}
                      onChange={(e) =>
                        setField('organizationName', e.target.value)
                      }
                      aria-invalid={!!formErrors.organizationName}
                      disabled={isPending}
                    />
                  </div>
                </Field>

                {/* WORKSPACE URL */}
                <Field
                  id="subdomain"
                  label="Workspace address"
                  error={formErrors.subdomain}
                >
                  <div
                    className={`flex h-11 overflow-hidden rounded-xl border bg-background transition-all focus-within:border-brand-strong focus-within:ring-[3px] focus-within:ring-brand-strong/10 ${
                      formErrors.subdomain
                        ? 'border-destructive'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center">
                      <Globe className="ml-3.5 size-4 shrink-0 text-muted-foreground" />

                      <input
                        id="subdomain"
                        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground/60"
                        placeholder="acme"
                        autoComplete="off"
                        value={formData.subdomain}
                        onChange={(e) =>
                          setField(
                            'subdomain',
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, '')
                          )
                        }
                        disabled={isPending}
                      />
                    </div>

                    <span className="flex shrink-0 items-center border-l border-border bg-muted/40 px-2.5 text-[11px] text-muted-foreground sm:text-xs">
                      .clientsync.com
                    </span>
                  </div>

                  {formData.subdomain && (
                    <div
                      className="mt-1.5 flex items-center gap-1.5"
                      aria-live="polite"
                    >
                      {subdomainStatus === 'checking' && (
                        <>
                          <Loader2 className="size-3 animate-spin text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Checking availability...
                          </span>
                        </>
                      )}

                      {subdomainStatus === 'available' && (
                        <>
                          <Check className="size-3.5 text-success" />
                          <span className="text-xs font-medium text-success">
                            Workspace address available
                          </span>
                        </>
                      )}

                      {subdomainStatus === 'unavailable' && (
                        <>
                          <X className="size-3.5 text-destructive" />
                          <span className="text-xs text-destructive">
                            Address unavailable
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </Field>

                {/* PASSWORDS */}
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    id="password"
                    label="Password"
                    error={formErrors.password}
                  >
                    <div className="relative">
                      <Lock className={iconClass} />

                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className={`${inputClass} pr-10`}
                        placeholder="Min. 6 characters"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={(e) => setField('password', e.target.value)}
                        aria-invalid={!!formErrors.password}
                        disabled={isPending}
                      />

                      <button
                        type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

                    {formData.password && (
                      <div
                        className="mt-1.5 flex items-center gap-1"
                        aria-live="polite"
                      >
                        {[1, 2, 3, 4].map((item) => (
                          <div
                            key={item}
                            className={`h-1 flex-1 rounded-full ${
                              item <= strength.score
                                ? 'bg-brand-strong'
                                : 'bg-muted'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-[10px] text-muted-foreground">
                          {strength.label}
                        </span>
                      </div>
                    )}
                  </Field>

                  <Field
                    id="confirmPassword"
                    label="Confirm password"
                    error={formErrors.confirmPassword}
                  >
                    <div className="relative">
                      <Lock className={iconClass} />

                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`${inputClass} pr-10`}
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setField('confirmPassword', e.target.value)
                        }
                        aria-invalid={!!formErrors.confirmPassword}
                        disabled={isPending}
                      />

                      <button
                        type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={
                          showConfirmPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                        disabled={isPending}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>

                    {passwordsMatch && !formErrors.confirmPassword && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-success">
                        <Check className="size-3" />
                        Passwords match
                      </p>
                    )}
                  </Field>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  className="btn btn-brand btn-lg group flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isPending || !isFormValid}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                {/* LOGIN */}
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-brand-strong hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* LEGAL */}
          <p className="mx-auto mt-4 max-w-md text-center text-[11px] leading-relaxed text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link
              href="/terms"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}