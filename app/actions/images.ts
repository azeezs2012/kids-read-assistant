'use server'

import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function uploadImage(file: File) {
  const supabase = await createClient();
  
  // Create a unique file name
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `story-images/${fileName}`;

  // Upload the file to Supabase storage
  const { error: uploadError } = await supabase.storage
    .from('stories')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('stories')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteImage(url: string) {
  const supabase = await createClient();
  
  // Extract the file path from the URL
  const filePath = url.split('/').slice(-2).join('/');
  
  const { error } = await supabase.storage
    .from('stories')
    .remove([filePath]);

  if (error) throw error;
} 