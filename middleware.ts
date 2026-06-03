import { createServerClient } from '@supabase/ssr'
import { getSupabasePublicEnv } from '@/lib/supabaseEnv'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })
  const { pathname } = request.nextUrl
  const { url, anonKey, isConfigured } = getSupabasePublicEnv()

  if (!isConfigured) {
    if (pathname.startsWith('/admin/dashboard')) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin'
      return NextResponse.redirect(loginUrl)
    }

    return supabaseResponse
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (pathname.startsWith('/admin/dashboard') && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin'
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === '/admin' && user) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/admin/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
