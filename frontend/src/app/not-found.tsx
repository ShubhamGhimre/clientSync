'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Home } from 'lucide-react'
import { BrandMark } from '@/components/logo'

const REDIRECT_SECONDS = 10

export default function Custom404() {
    const router = useRouter()
    const [countdown, setCountdown] = useState(REDIRECT_SECONDS)
    const [paused, setPaused] = useState(false)

    // Tick once per second until paused or finished
    useEffect(() => {
        if (paused) return
        const timer = setInterval(() => {
            setCountdown((prev) => Math.max(prev - 1, 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [paused])

    // Navigate from an effect, not from inside the state updater
    useEffect(() => {
        if (countdown === 0 && !paused) {
            router.push('/dashboard')
        }
    }, [countdown, paused, router])

    const handleGoBack = () => {
        if (window.history.length > 1) {
            router.back()
        } else {
            router.push('/auth/login')
        }
    }

    const progressPercent =
        ((REDIRECT_SECONDS - countdown) / REDIRECT_SECONDS) * 100

    return (
        <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-background px-4 py-12 text-foreground">
            {/* Subtle brand radial glow */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(50% 45% at 50% 25%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 70%), radial-gradient(40% 40% at 65% 75%, color-mix(in oklab, var(--chart-2) 9%, transparent), transparent 70%)',
                }}
                aria-hidden="true"
            />
            <BrandMark
                size={240}
                className="pointer-events-none absolute -bottom-16 right-8 text-primary opacity-[0.035]"
                aria-hidden="true"
            />

            <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-7 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                    <p
                        className="tabular select-none bg-clip-text text-8xl font-extrabold tracking-tight text-transparent sm:text-9xl"
                        style={{
                            backgroundImage:
                                'linear-gradient(135deg, var(--primary), var(--chart-2))',
                        }}
                        aria-hidden="true"
                    >
                        404
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        Page not found
                    </h1>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        This page doesn&apos;t exist or has moved. Check the
                        address, or head back to somewhere familiar.
                    </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
                    <button
                        type="button"
                        onClick={handleGoBack}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
                    >
                        <ArrowLeft className="size-4" />
                        <span>Go back</span>
                    </button>
                    <Link
                        href="/dashboard"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground shadow-xs transition-colors hover:border-primary/30 hover:text-primary"
                    >
                        <Home className="size-4" />
                        <span>Go to dashboard</span>
                    </Link>
                </div>

                {/* Auto-redirect */}
                <div className="w-full rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-soft">
                    {paused ? (
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-muted-foreground">
                                Redirect cancelled.
                            </p>
                            <button
                                type="button"
                                className="inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                                onClick={() => setPaused(false)}
                            >
                                Resume
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between gap-3">
                                <p
                                    className="text-sm text-muted-foreground"
                                    role="timer"
                                >
                                    Redirecting to the dashboard in{' '}
                                    <span className="tabular font-semibold text-foreground">
                                        {countdown}
                                    </span>{' '}
                                    {countdown === 1 ? 'second' : 'seconds'}
                                </p>
                                <button
                                    type="button"
                                    className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                    onClick={() => setPaused(true)}
                                >
                                    Stay here
                                </button>
                            </div>
                            <div
                                className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary"
                                aria-hidden="true"
                            >
                                <span
                                    className="block h-full rounded-full bg-primary transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </>
                    )}
                </div>

                <nav
                    className="w-full border-t border-border pt-6"
                    aria-label="Common pages"
                >
                    <p className="mb-3 text-xs text-muted-foreground">
                        Looking for something else?
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
                        <Link
                            href="/auth/login"
                            className="text-primary underline-offset-4 hover:underline"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/dashboard"
                            className="text-primary underline-offset-4 hover:underline"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/contact"
                            className="text-primary underline-offset-4 hover:underline"
                        >
                            Contact
                        </Link>
                    </div>
                </nav>
            </div>
        </main>
    )
}