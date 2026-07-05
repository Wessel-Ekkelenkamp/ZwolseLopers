import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';

export async function DELETE() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const userId = user.id;

  const { data: userPosts } = await admin
    .from(DB.TABLES.POSTS)
    .select('id')
    .eq('author_id', userId);
  const userPostIds = userPosts?.map(p => p.id) ?? [];

  if (userPostIds.length > 0) {
    await admin.from(DB.TABLES.POST_IMAGES).delete().in('post_id', userPostIds);
    await admin.from(DB.TABLES.EVENTS).delete().in('id', userPostIds);
    await admin.from(DB.TABLES.POSTS).delete().in('id', userPostIds);
  }

  await admin.storage
    .from(DB.BUCKETS.AVATARS)
    .remove([`${userId}/profile.webp`]);

  const { error: profileError } = await admin
    .from(DB.TABLES.PROFILES)
    .delete()
    .eq('id', userId);
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
