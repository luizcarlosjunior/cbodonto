// src/middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware() {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/admin/login',
    },
  }
)

// Only protect admin API routes via middleware
// The admin UI pages are protected by their layout.tsx (server component)
export const config = {
  matcher: ['/api/admin/:path*'],
}
