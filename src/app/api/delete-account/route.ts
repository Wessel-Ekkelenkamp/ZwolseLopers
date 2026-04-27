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

  // Get all posts authored by this user
  const { data: userPosts } = await admin
    .from(DB.TABLES.POSTS)
    .select('id')
    .eq('author_id', userId);
  const userPostIds = userPosts?.map(p => p.id) ?? [];

  // Null out parent_comment_id for replies referencing comments that will be deleted
  const commentFilter = userPostIds.length > 0
    ? `user_id.eq.${userId},post_id.in.(${userPostIds.join(',')})`
    : `user_id.eq.${userId}`;
  const { data: deletingComments } = await admin
    .from(DB.TABLES.COMMENTS)
    .select('id')
    .or(commentFilter);
  const deletingCommentIds = deletingComments?.map(c => c.id) ?? [];
  if (deletingCommentIds.length > 0) {
    await admin
      .from(DB.TABLES.COMMENTS)
      .update({ parent_comment_id: null })
      .in('parent_comment_id', deletingCommentIds);
  }

  // Delete run signups for runs owned by this user (so we can delete those runs)
  if (userPostIds.length > 0) {
    await admin.from(DB.TABLES.RUN_SIGNUPS).delete().in('run_id', userPostIds);
  }

  // Delete run signups BY this user
  await admin.from(DB.TABLES.RUN_SIGNUPS).delete().eq('user_id', userId);

  // Delete comments on user's posts
  if (userPostIds.length > 0) {
    await admin.from(DB.TABLES.COMMENTS).delete().in('post_id', userPostIds);
  }
  // Delete user's own comments on other posts
  await admin.from(DB.TABLES.COMMENTS).delete().eq('user_id', userId);

  // Delete post images for user's posts
  if (userPostIds.length > 0) {
    await admin.from(DB.TABLES.POST_IMAGES).delete().in('post_id', userPostIds);
    // Delete run records before posts (runs.id FK references posts.id)
    await admin.from(DB.TABLES.RUNS).delete().in('id', userPostIds);
    await admin.from(DB.TABLES.POSTS).delete().in('id', userPostIds);
  }

  // Delete avatar from storage
  await admin.storage
    .from(DB.BUCKETS.AVATARS)
    .remove([`${userId}/profile.webp`]);

  // Delete profile
  const { error: profileError } = await admin
    .from(DB.TABLES.PROFILES)
    .delete()
    .eq('id', userId);
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Delete auth user
  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
