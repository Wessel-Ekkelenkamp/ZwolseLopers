import { supabase } from './supabase';
import { DB } from './db';

export async function updatePost(postId: string, updates: {
  title: string;
  content: string;
  event_info?: any;
  imagesToDelete?: string[];
  imagesToAdd?: string[];
}) {
  const coreUpdates = [
    supabase.from(DB.TABLES.POSTS).update({ title: updates.title, content: updates.content }).eq('id', postId),
    ...(updates.event_info ? [
      supabase.from(DB.TABLES.EVENTS).update({
        event_date: updates.event_info.event_date,
        event_time: updates.event_info.event_time,
        location: updates.event_info.location,
        distance: updates.event_info.distance || null,
      }).eq('id', postId),
    ] : []),
  ];

  for (const { error } of await Promise.all(coreUpdates)) {
    if (error) throw error;
  }

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
