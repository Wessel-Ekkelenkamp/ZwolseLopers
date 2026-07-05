import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { DB } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// Generous enough that normal browsing never trips these — meant to catch
// sustained scripted abuse, not the occasional burst from a real visitor.
const RATE_LIMITS = {
  sensitive: { limit: 10, windowMs: 10 * 60 * 1000 }, // /api/* (mutations, admin actions)
  image: { limit: 120, windowMs: 60 * 1000 }, // /_next/image (Vercel image optimization quota)
  page: { limit: 300, windowMs: 60 * 1000 }, // everything else
} as const;

function classify(pathname: string): keyof typeof RATE_LIMITS {
  if (pathname.startsWith('/api/')) return 'sensitive';
  if (pathname.startsWith('/_next/image')) return 'image';
  return 'page';
}

export async function proxy(request: NextRequest) {
  const bucket = classify(request.nextUrl.pathname);
  const { limit, windowMs } = RATE_LIMITS[bucket];
  const ip = getClientIp(request.headers);

  const { allowed, retryAfterSeconds } = checkRateLimit(`${bucket}:${ip}`, limit, windowMs);

  if (!allowed) {
    return new NextResponse('Too many requests. Please slow down and try again shortly.', {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSeconds) },
    });
  }

  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return response; // unauthenticated users see the login form on /admin
  }

  const { data: profile } = await supabase
    .from(DB.TABLES.PROFILES)
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== DB.ROLES.ADMIN) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)'],
};
