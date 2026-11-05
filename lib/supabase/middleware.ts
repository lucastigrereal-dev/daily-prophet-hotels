import { safeAuthReturn } from '../hotel/v2/domain'
import { publicConfig } from './config'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let config
  try { config = publicConfig() } catch { return new NextResponse('Configuração operacional ausente ou inválida. O LAB sintético é separado; nenhum serviço foi conectado.', { status: 503 }) }
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    config.url,
    config.key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users to login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.search = ''
    url.searchParams.set('next',request.nextUrl.pathname+request.nextUrl.search)
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone()
    url.search = ''
    url.searchParams.set('next',request.nextUrl.pathname+request.nextUrl.search)
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (!user && request.nextUrl.pathname.startsWith('/onboarding')) {
    const url = request.nextUrl.clone()
    url.search = ''
    url.searchParams.set('next',request.nextUrl.pathname+request.nextUrl.search)
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (user && ['/auth/login','/auth/register'].includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone()
    const destination = request.nextUrl.pathname === '/auth/login'
      ? safeAuthReturn(request.nextUrl.searchParams.get('next'),url.origin) : '/dashboard'
    const target = new URL(destination,url.origin)
    if (['/auth/login','/auth/register'].includes(target.pathname)) {
      target.pathname = '/dashboard'
      target.search = ''
      target.hash = ''
    }
    return NextResponse.redirect(target)
  }

  return supabaseResponse
}
