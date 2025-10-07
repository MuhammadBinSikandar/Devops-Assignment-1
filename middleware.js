import { updateSession } from './lib/supabase/middleware'

export async function middleware(request) {
  // Skip middleware for static assets and API routes for better performance
  const { pathname } = request.nextUrl;

  // Fast path for static assets
  if (pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') && !pathname.endsWith('.html')) {
    return;
  }

  // Only run session update for authenticated routes
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Highly optimized route matching to minimize middleware overhead
    '/dashboard/(parent|student|analytics|courses|profile)',
    '/dashboard/:path*',
    '/admin',
    '/admin/:path*',
    '/auth/login',
    '/auth/signup',
    '/auth/reset-password',
    '/auth/update-password',
    '/auth/role-selection',
    '/auth/waiting-approval',
    // Exclude static files, API routes, and other paths that don't need session updates
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};