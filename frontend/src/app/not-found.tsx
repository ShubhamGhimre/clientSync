'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Custom404() {
    const router = useRouter()
    const [countdown, setCountdown] = useState(10)

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    router.push('/dashboard')
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [router])

    const handleGoBack = () => {
        if (window.history.length > 1) {
            router.back()
        } else {
            router.push('/auth/login')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                {/* 404 Number */}
                <div className="relative">
                    <h1 className="text-9xl font-extrabold text-gray-200 select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl">😵</div>
                    </div>
                </div>

                {/* Error Message */}
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        Oops! Page not found
                    </h2>
                    <p className="text-lg text-gray-600">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleGoBack}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Go Back
                        </button>

                        <Link href="/dashboard">
                            <div className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Go to Dashboard
                            </div>
                        </Link>
                    </div>

                    {/* Auto-redirect countdown */}
                    <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-600">
                            Redirecting to dashboard in{' '}
                            <span className="font-semibold text-indigo-600">{countdown}</span>{' '}
                            seconds
                        </p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                                style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Additional Links */}
                <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-4">
                        Need help? Try these common pages:
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <Link href="/auth/login">
                            <div className="text-indigo-600 hover:text-indigo-500 hover:underline">
                                Login
                            </div>
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link href="/dashboard">
                            <div className="text-indigo-600 hover:text-indigo-500 hover:underline">
                                Dashboard
                            </div>
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link href="/contact">
                            <div className="text-indigo-600 hover:text-indigo-500 hover:underline">
                                Contact
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}