'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(formData: FormData) {
  const supabase = await createClient();
  
  // Check if current user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminProfile || adminProfile.role !== 'admin') {
    return { error: 'Not authorized' };
  }

  // Update user role
  const userId = formData.get('userId') as string;
  const newRole = formData.get('role') as string;

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    return { error: 'Failed to update role' };
  }

  revalidatePath('/admin/users');
  return { success: true };
} 