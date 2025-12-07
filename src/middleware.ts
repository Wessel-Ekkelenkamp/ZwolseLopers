import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('🚨 MIDDLEWARE CALLED:', request.nextUrl.pathname);

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          response.cookies.set(name, value, options);
        },
        remove: (name: string, options: CookieOptions) => {
          response.cookies.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('🔒 Checking admin access...');

    if (!session) {
      console.log('❌ No session found, redirecting to /auth');
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    console.log('✅ Session found:', session.user.email);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    console.log('📋 Profile role:', profile?.role, 'Error:', error);

    if (!profile || profile.role !== 'admin') {
      console.log('❌ User is not admin, redirecting to /');
      return NextResponse.redirect(new URL('/', request.url));
    }

    console.log('✅ Admin access granted!');
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
