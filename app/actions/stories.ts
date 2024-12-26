'use server'

import { Story, NewStory } from '@/lib/types';
import { createClient } from '@/utils/supabase/server';

export async function getStories() {
  const supabase = await createClient();
  
  const { data: stories, error } = await supabase
    .from('stories')
    .select(`
      *,
      level:story_levels!inner(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return stories as Story[];
}

export async function getStory(id: number) {
  const supabase = await createClient();
  
  const { data: story, error } = await supabase
    .from('stories')
    .select(`
      *,
      level:story_levels!inner(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return story as Story;
}

export async function createStory(story: NewStory) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('stories')
    .insert(story)
    .select(`
      *,
      level:story_levels!inner(*)
    `)
    .single();

  if (error) throw error;
  return data as Story;
}

export async function updateStory(id: number, story: Partial<Story>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('stories')
    .update(story)
    .eq('id', id)
    .select(`
      *,
      level:story_levels!inner(*)
    `)
    .single();

  if (error) throw error;
  return data as Story;
}

export async function deleteStory(id: number) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id);

  if (error) throw error;
} 