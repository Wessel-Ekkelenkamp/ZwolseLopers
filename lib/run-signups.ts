// /lib/run-signups.ts
import { supabase } from './supabase';
import { DB } from './db';

export type RunSignup = {
  id: string;
  run_id: string;
  user_id: string;
  status: 'confirmed' | 'cancelled';
  signed_up_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

export async function getRunSignups(runId: string): Promise<RunSignup[]> {
  const { data, error } = await supabase
    .from(DB.TABLES.RUN_SIGNUPS)
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .eq('run_id', runId)
    .eq('status', 'confirmed')
    .order('signed_up_at', { ascending: true });

  if (error) {
    console.error('Error fetching signups:', error);
    return [];
  }

  return data || [];
}

export async function signUpForRun(runId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Check if user already signed up
  const { data: existing } = await supabase
    .from(DB.TABLES.RUN_SIGNUPS)
    .select('id, status')
    .eq('run_id', runId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'cancelled') {
      // Reactivate cancelled signup
      const { error } = await supabase
        .from(DB.TABLES.RUN_SIGNUPS)
        .update({ status: 'confirmed' })
        .eq('id', existing.id);

      return !error;
    }
    return true; // Already signed up
  }

  // Create new signup
  const { error } = await supabase
    .from(DB.TABLES.RUN_SIGNUPS)
    .insert({
      run_id: runId,
      user_id: user.id,
      status: 'confirmed'
    });

  if (error) {
    console.error('Error signing up:', error.message, '| code:', error.code, '| details:', error.details, '| hint:', error.hint);
    return false;
  }

  return true;
}

export async function cancelRunSignup(runId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from(DB.TABLES.RUN_SIGNUPS)
    .update({ status: 'cancelled' })
    .eq('run_id', runId)
    .eq('user_id', user.id)
    .eq('status', 'confirmed');

  if (error) {
    console.error('Error cancelling signup:', error);
    return false;
  }

  return true;
}