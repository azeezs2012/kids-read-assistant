'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type StoryLevel = {
  id: number
  level_number: number
  description: string
  created_at: string
  updated_at: string
}

export async function getStoryLevels() {
  const supabase = await createClient()
  
  const { data: levels, error } = await supabase
    .from('story_levels')
    .select('*')
    .order('level_number')

  if (error) throw error
  return levels as StoryLevel[]
}

async function checkAdminRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (error) throw error
  if (profile?.role !== 'admin') throw new Error('Unauthorized: Admin role required')
}

export async function createStoryLevel(level_number: number, description: string) {
  await checkAdminRole()
  const supabase = await createClient()

  const { error } = await supabase
    .from('story_levels')
    .insert([{ level_number, description }])

  if (error) throw error
  revalidatePath('/admin/story-levels')
}

export async function updateStoryLevel(id: number, level_number: number, description: string) {
  await checkAdminRole()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('story_levels')
    .update({ level_number, description })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/admin/story-levels')
}

export async function deleteStoryLevel(id: number) {
  await checkAdminRole()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('story_levels')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/admin/story-levels')
} 