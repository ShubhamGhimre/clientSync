'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Home } from 'lucide-react'

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

    return (
        <main className="auth-layout">
            <div className="hero-glow" aria-hidden="true" />

            <div className="notfound-card pos-rel z-mid stack g-8 center">
                <div className="stack-sm center">
                    <p
                        className="gradient-text notfound-code"
                        aria-hidden="true"
                    >
                        404
                    </p>
                    <h1 className="page-title">Page not found</h1>
                    <p className="page-subtitle">
                        This page doesn't exist or has moved. Check the address, or head back to somewhere familiar.
                    </p>
                </div>

                <div className="notfound-actions">
                    <button type="button" onClick={handleGoBack} className="btn btn-brand">
                        <ArrowLeft />
                        Go back
                    </button>
                    <Link href="/dashboard" className="btn btn-secondary">
                        <Home />
                        Go to dashboard
                    </Link>
                </div>

                {/* Auto-redirect */}
                <div className="surface surface-pad full-w">
                    {paused ? (
                        <div className="row-between g-3">
                            <p className="t-sm t-muted">Redirect cancelled.</p>
                        </div>
                    ) : (
                        <>
                            <div className="row-between g-3">
                                <p className="t-sm t-muted" role="timer">
                                    Redirecting to the dashboard in{' '}
                                    <span className="t-semibold tabular">
                                        {countdown}
                                    </span>{' '}
                                    {countdown === 1 ? 'second' : 'seconds'}
                                </p>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setPaused(true)}
                                >
                                    Stay here
                                </button>
                            </div>
                            <div className="progress space-t-3" aria-hidden="true">
                                <span
                                    style={{
                                        width: `${((REDIRECT_SECONDS - countdown) / REDIRECT_SECONDS) * 100}%`,
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>

                <nav className="full-w border-top pad-y-6" aria-label="Common pages">
                    <p className="field-hint space-b-3">Looking for something else?</p>
                    <div className="cluster center g-6">
                        <Link href="/auth/login" className="btn btn-link">
                            Log in
                        </Link>
                        <Link href="/dashboard" className="btn btn-link">
                            Dashboard
                        </Link>
                        <Link href="/contact" className="btn btn-link">
                            Contact
                        </Link>
                    </div>
                </nav>
            </div>
        </main>
    )
}