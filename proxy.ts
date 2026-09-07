import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewati file statis, next internal assets, favicon, dll
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Baca session cookie
  const sessionCookie = request.cookies.get('session')?.value;
  const session = await decrypt(sessionCookie);
  const isAuthenticated = !!(session?.userId && session?.role === 'admin');

  // 1. Jika mencoba akses halaman /login padahal sudah login -> redirect ke dashboard /
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 2. Jika belum login mencoba akses halaman atau API yang diproteksi
  if (!isAuthenticated) {
    // Jika request ke endpoint API, kembalikan response JSON 401 Unauthorized
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Sesi admin tidak valid atau telah berakhir.' },
        { status: 401 }
      );
    }

    // Jika request halaman (misal: /), redirect ke /login
    const loginUrl = new URL('/login', request.url);
    // Simpan return url jika diperlukan di masa depan
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Config matcher
export const config = {
  matcher: [
    /*
     * Match semua request kecuali file statis:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images / svg / static extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
