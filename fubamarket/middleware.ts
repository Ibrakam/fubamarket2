import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Проверяем наличие реферального кода в URL
  const refCode = request.nextUrl.searchParams.get('ref')
  const utmSource = request.nextUrl.searchParams.get('utm_source')
  const utmMedium = request.nextUrl.searchParams.get('utm_medium')
  const utmCampaign = request.nextUrl.searchParams.get('utm_campaign')
  const utmTerm = request.nextUrl.searchParams.get('utm_term')
  const utmContent = request.nextUrl.searchParams.get('utm_content')
  
  if (refCode && utmSource === 'referral') {
    // Устанавливаем cookie с реферальным кодом на 30 дней
    response.cookies.set('referral_code', refCode, {
      maxAge: 30 * 24 * 60 * 60, // 30 дней
      httpOnly: false, // Нужно для клиентского кода
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })
    
    // Устанавливаем cookie с UTM метками на 30 дней
    response.cookies.set('utm_source', utmSource, {
      maxAge: 30 * 24 * 60 * 60, // 30 дней
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })
    
    if (utmMedium) {
      response.cookies.set('utm_medium', utmMedium, {
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }
    
    if (utmCampaign) {
      response.cookies.set('utm_campaign', utmCampaign, {
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }
    
    if (utmTerm) {
      response.cookies.set('utm_term', utmTerm, {
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }
    
    if (utmContent) {
      response.cookies.set('utm_content', utmContent, {
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }
    
    // Сохраняем время первого перехода
    response.cookies.set('referral_first_visit', new Date().toISOString(), {
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
