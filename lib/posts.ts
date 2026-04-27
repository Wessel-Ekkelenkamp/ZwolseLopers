// lib/posts.ts
import { supabase } from './supabase';
import { DB } from './db';

export async function updatePost(postId: string, updates: {
  title: string;
  content: string;
  run_info?: any;
  imagesToDelete?: string[];
  imagesToAdd?: string[];
}) {
  // Run post + run updates in parallel
  const coreUpdates = [
    supabase.from(DB.TABLES.POSTS).update({ title: updates.title, content: updates.content }).eq('id', postId),
    ...(updates.run_info ? [
      supabase.from(DB.TABLES.RUNS).update({
        run_date: updates.run_info.run_date,
        run_time: updates.run_info.run_time,
        distance: updates.run_info.distance,
        start_location: updates.run_info.start_location,
        average_speed: updates.run_info.average_speed,
        max_participants: updates.run_info.max_participants === '' ? null : updates.run_info.max_participants,
      }).eq('id', postId),
    ] : []),
  ];

  for (const { error } of await Promise.all(coreUpdates)) {
    if (error) throw error;
  }

  // Run image delete + insert in parallel
  const imageOps = [
    ...(updates.imagesToDelete?.length
      ? [supabase.from(DB.TABLES.POST_IMAGES).delete().in('id', updates.imagesToDelete)]
      : []),
    ...(updates.imagesToAdd?.length
      ? [supabase.from(DB.TABLES.POST_IMAGES).insert(updates.imagesToAdd.map(url => ({ post_id: postId, image_url: url })))]
      : []),
  ];

  if (imageOps.length) {
    for (const { error } of await Promise.all(imageOps)) {
      if (error) throw error;
    }
  }

  return { success: true };
}

export async function deletePost(postId: string) {
  const { error } = await supabase
    .from(DB.TABLES.POSTS)
    .delete()
    .eq('id', postId);

  if (error) throw error;
  return { success: true };
}
