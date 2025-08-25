import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Get token from cookies (since middleware can't access sessionStorage)
    const token = request.cookies.get('token')?.value

    const { pathname } = request.nextUrl

    // Check if the current path is an auth route
    const isAuthRoute = pathname.startsWith('/auth') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/register')

    // Check if the current path is a dashboard route
    const isDashboardRoute = pathname.startsWith('/dashboard')

    // Root route redirect
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // If user has token
    if (token) {
        // Redirect away from auth routes to dashboard
        if (isAuthRoute) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        // Allow access to dashboard and other routes
        return NextResponse.next()
    }

    // If user doesn't have token
    if (!token) {
        // Allow access to auth routes
        if (isAuthRoute) {
            return NextResponse.next()
        }
        // Redirect from dashboard or any other route to /auth/login
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return NextResponse.next()
}

// Configure which routes this middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
}